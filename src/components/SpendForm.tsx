"use client";

import React, { useState, useEffect } from "react";
import { AuditFormData, UserToolEntry, ToolId, UseCase } from "@/types";
import { getAllTools, getToolPlan, USE_CASE_LABELS } from "@/lib/tools";

const STORAGE_KEY = "spendlens_form_data";

const defaultFormData: AuditFormData = {
  tools: [],
  teamSize: 1,
  companyName: "",
};

interface SpendFormProps {
  onSubmit: (data: AuditFormData) => void;
}

export default function SpendForm({ onSubmit }: SpendFormProps) {
  const [formData, setFormData] = useState<AuditFormData>(defaultFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  const tools = getAllTools();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tools && Array.isArray(parsed.tools)) {
          setFormData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const updateTeamSize = (size: number) => {
    setFormData((prev) => ({ ...prev, teamSize: Math.max(1, size) }));
  };

  const updateCompanyName = (name: string) => {
    setFormData((prev) => ({ ...prev, companyName: name }));
  };

  const addTool = () => {
    setFormData((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          toolId: tools[0].id,
          planId: tools[0].plans[0].id,
          monthlySpend: tools[0].plans[0].pricePerUser,
          seats: 1,
          primaryUseCase: "general" as UseCase,
        },
      ],
    }));
  };

  const removeTool = (index: number) => {
    setFormData((prev) => {
      const newTools = [...prev.tools];
      newTools.splice(index, 1);
      return { ...prev, tools: newTools };
    });
  };

  const updateTool = (index: number, updates: Partial<UserToolEntry>) => {
    setFormData((prev) => {
      const newTools = [...prev.tools];
      const toolEntry = { ...newTools[index], ...updates };

      // Handle cascading updates
      if (updates.toolId && updates.toolId !== newTools[index].toolId) {
        const selectedTool = tools.find((t) => t.id === updates.toolId);
        if (selectedTool && selectedTool.plans.length > 0) {
          toolEntry.planId = selectedTool.plans[0].id;
        }
      }

      // Recalculate monthlySpend
      const currentPlan = getToolPlan(toolEntry.toolId, toolEntry.planId);
      if (currentPlan) {
        if (!currentPlan.isCustom && !currentPlan.isApiDirect) {
          toolEntry.monthlySpend = currentPlan.isPerUser
            ? currentPlan.pricePerUser * toolEntry.seats
            : currentPlan.pricePerUser;
        }
      }

      newTools[index] = toolEntry;
      return { ...prev, tools: newTools };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isLoaded) return null;

  return (
    <form onSubmit={handleSubmit} className="w-full px-8 md:px-16 lg:px-24 space-y-16">
      {/* Team Information - Wide Header Card */}
      <div className="w-full bg-white/5 border border-white/10 p-10 md:p-12 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-10 tracking-tight">Team Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label htmlFor="company-name" className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-[0.3em]">Company Name (Optional)</label>
            <input
              id="company-name"
              type="text"
              value={formData.companyName || ""}
              onChange={(e) => updateCompanyName(e.target.value)}
              className="w-full h-16 bg-gray-950 border border-gray-700 rounded-2xl px-6 text-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-700"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label htmlFor="team-size" className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-[0.3em]">Total Team Size</label>
            <input
              id="team-size"
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) => updateTeamSize(parseInt(e.target.value) || 1)}
              className="w-full h-16 bg-gray-950 border border-gray-700 rounded-2xl px-6 text-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tool Stack - Expandable List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-3xl font-black text-white tracking-tight">Your AI Tool Stack</h2>
          <button
            type="button"
            onClick={addTool}
            className="text-lg bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-95 uppercase tracking-wider"
          >
            + Add Tool
          </button>
        </div>

        {formData.tools.length === 0 ? (
          <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-[2.5rem] min-h-[300px] flex flex-col items-center justify-center p-16 text-center">
            <p className="text-gray-400 text-2xl font-medium mb-10 max-w-2xl">
              No tools added yet. Add the tools you are currently paying for to begin your professional audit.
            </p>
            <button
              type="button"
              onClick={addTool}
              className="text-lg bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl transition-all font-black uppercase tracking-widest"
            >
              Add your first tool
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.tools.map((toolEntry, index) => {
              const selectedTool = tools.find((t) => t.id === toolEntry.toolId);
              const selectedPlan = getToolPlan(toolEntry.toolId, toolEntry.planId);

              return (
                <div key={index} className="w-full bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl relative shadow-xl group transition-all hover:bg-white/[0.08] min-h-[120px]">
                  <button
                    type="button"
                    onClick={() => removeTool(index)}
                    className="absolute -top-3 -right-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    aria-label="Remove tool"
                  >
                    ×
                  </button>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-end">
                    {/* Tool Selection */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">Tool</label>
                      <select
                        value={toolEntry.toolId}
                        onChange={(e) => updateTool(index, { toolId: e.target.value as ToolId })}
                        className="w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-base text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        {tools.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan Selection */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">Plan</label>
                      <select
                        value={toolEntry.planId}
                        onChange={(e) => updateTool(index, { planId: e.target.value })}
                        className="w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-base text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        {selectedTool?.plans.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Primary Use Case */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">Use Case</label>
                      <select
                        value={toolEntry.primaryUseCase}
                        onChange={(e) => updateTool(index, { primaryUseCase: e.target.value as UseCase })}
                        className="w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-base text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        {Object.entries(USE_CASE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">Seats</label>
                      <input
                        type="number"
                        min="1"
                        value={toolEntry.seats}
                        onChange={(e) => updateTool(index, { seats: parseInt(e.target.value) || 1 })}
                        disabled={!selectedPlan?.isPerUser}
                        className={`w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-base text-white focus:outline-none focus:border-blue-500 transition-all ${!selectedPlan?.isPerUser ? 'opacity-30 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    
                    {/* Spend */}
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">Spend/mo</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-600 text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={toolEntry.monthlySpend}
                          onChange={(e) => updateTool(index, { monthlySpend: parseFloat(e.target.value) || 0 })}
                          disabled={!selectedPlan?.isCustom && !selectedPlan?.isApiDirect}
                          className={`w-full h-12 bg-gray-950 border border-gray-700 rounded-xl pl-8 pr-4 text-base text-white focus:outline-none focus:border-blue-500 transition-all ${!selectedPlan?.isCustom && !selectedPlan?.isApiDirect ? 'opacity-30 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-16 border-t border-white/10">
        <button
          type="submit"
          disabled={formData.tools.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white w-64 h-14 rounded-2xl font-black text-base transition-all shadow-[0_15px_40px_rgba(37,99,235,0.3)] active:scale-[0.98] uppercase tracking-[0.2em]"
        >
          Run Audit
        </button>
      </div>
    </form>
  );
}
