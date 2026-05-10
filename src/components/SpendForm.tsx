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

      // Handle cascading updates (e.g., if tool changes, reset plan)
      if (updates.toolId && updates.toolId !== newTools[index].toolId) {
        const selectedTool = tools.find((t) => t.id === updates.toolId);
        if (selectedTool && selectedTool.plans.length > 0) {
          toolEntry.planId = selectedTool.plans[0].id;
        }
      }

      // Recalculate monthlySpend if it's a standard plan
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

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto">
      {/* General Information */}
      <div className="bg-gray-900 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-6">Team Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-300 mb-2">Company Name (Optional)</label>
            <input
              id="company-name"
              type="text"
              value={formData.companyName || ""}
              onChange={(e) => updateCompanyName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Acme Corp"
              aria-label="Enter your company name"
            />
          </div>
          <div>
            <label htmlFor="team-size" className="block text-sm font-medium text-gray-300 mb-2">Total Team Size</label>
            <input
              id="team-size"
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) => updateTeamSize(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              aria-label="Enter total number of team members"
            />
          </div>
        </div>
      </div>

      {/* Tool Stack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your AI Tool Stack</h2>
          <button
            type="button"
            onClick={addTool}
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-900/20 active:scale-95"
          >
            + Add Tool
          </button>
        </div>

        {formData.tools.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-10 text-center">
            <p className="text-gray-300 mb-4">No tools added yet. Add the tools you are currently paying for to begin the audit.</p>
            <button
              type="button"
              onClick={addTool}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              aria-label="Add your first tool"
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
                <div key={index} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative shadow-sm group">
                  <button
                    type="button"
                    onClick={() => removeTool(index)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors px-2 py-1 text-sm font-medium opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove tool"
                  >
                    Remove
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
                    {/* Tool Selection */}
                    <div>
                      <label htmlFor={`tool-${index}`} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Tool</label>
                      <select
                        id={`tool-${index}`}
                        value={toolEntry.toolId}
                        onChange={(e) => updateTool(index, { toolId: e.target.value as ToolId })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                        aria-label={`Select tool for entry ${index + 1}`}
                      >
                        {tools.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan Selection */}
                    <div>
                      <label htmlFor={`plan-${index}`} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Plan</label>
                      <select
                        id={`plan-${index}`}
                        value={toolEntry.planId}
                        onChange={(e) => updateTool(index, { planId: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                        aria-label={`Select plan for ${selectedTool?.name}`}
                      >
                        {selectedTool?.plans.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Primary Use Case */}
                    <div>
                      <label htmlFor={`usecase-${index}`} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Primary Use Case</label>
                      <select
                        id={`usecase-${index}`}
                        value={toolEntry.primaryUseCase}
                        onChange={(e) => updateTool(index, { primaryUseCase: e.target.value as UseCase })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                        aria-label={`Select primary use case for ${selectedTool?.name}`}
                      >
                        {Object.entries(USE_CASE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats & Spend */}
                    <div className="flex gap-3">
                      {selectedPlan?.isPerUser && (
                        <div className="flex-1">
                          <label htmlFor={`seats-${index}`} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Seats</label>
                          <input
                            id={`seats-${index}`}
                            type="number"
                            min="1"
                            value={toolEntry.seats}
                            onChange={(e) => updateTool(index, { seats: parseInt(e.target.value) || 1 })}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                            aria-label={`Enter number of seats for ${selectedTool?.name}`}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <label htmlFor={`spend-${index}`} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Spend/mo</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 text-sm" aria-hidden="true">$</span>
                          <input
                            id={`spend-${index}`}
                            type="number"
                            min="0"
                            step="1"
                            value={toolEntry.monthlySpend}
                            onChange={(e) => updateTool(index, { monthlySpend: parseFloat(e.target.value) || 0 })}
                            disabled={!selectedPlan?.isCustom && !selectedPlan?.isApiDirect}
                            className={`w-full bg-gray-950 border border-gray-800 rounded-xl pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors ${!selectedPlan?.isCustom && !selectedPlan?.isApiDirect ? 'opacity-50 cursor-not-allowed bg-gray-900' : ''}`}
                            aria-label={`Enter monthly spend for ${selectedTool?.name}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-800">
        <button
          type="submit"
          disabled={formData.tools.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          Run Audit
        </button>
      </div>
    </form>
  );
}
