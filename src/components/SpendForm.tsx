"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuditFormData, UserToolEntry, ToolId, UseCase } from "@/types";
import { getAllTools, getToolPlan, USE_CASE_LABELS } from "@/lib/tools";

const STORAGE_KEY = "spendlens_form_data";

const defaultFormData: AuditFormData = {
  tools: [],
  teamSize: 1,
  companyName: "",
};

export default function SpendForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<AuditFormData>(defaultFormData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save audit result");
      }

      const data = await response.json();
      if (!data.id) throw new Error("No ID returned from server");

      router.push(`/audit/${data.id}`);
    } catch (error) {
      console.error("Audit submission failed:", error);
      alert("Failed to run the audit. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  if (isSubmitting) {
    return (
      <div className="bg-white/5 border border-white/10 p-12 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-electric-500/30 border-t-electric-500 rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-black text-white mb-2 italic">Running Audit...</h2>
        <p className="text-gray-400">Analyzing your stack against our pricing database.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full px-4 sm:px-8 md:px-16 lg:px-24 space-y-4 md:space-y-8" aria-label="AI Tool Audit Form">
      {/* Team Information - Wide Header Card */}
      <div className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl shadow-2xl">
        <h2 className="text-lg md:text-xl font-black text-white mb-4 md:mb-6 tracking-tight uppercase">Team Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label htmlFor="company-name" className="block text-[10px] font-bold text-gray-300 mb-2 uppercase tracking-[0.2em]">Company Name (Optional)</label>
            <input
              id="company-name"
              type="text"
              value={formData.companyName || ""}
              onChange={(e) => updateCompanyName(e.target.value)}
              className="w-full h-10 md:h-12 bg-gray-950 border border-gray-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-500"
              placeholder="Acme Corp"
              aria-required="false"
            />
          </div>
          <div>
            <label htmlFor="team-size" className="block text-[10px] font-bold text-gray-300 mb-2 uppercase tracking-[0.2em]">Total Team Size</label>
            <input
              id="team-size"
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) => updateTeamSize(parseInt(e.target.value) || 1)}
              className="w-full h-10 md:h-12 bg-gray-950 border border-gray-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
              aria-required="true"
            />
          </div>
        </div>
      </div>

      {/* Tool Stack - Expandable List */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase">Your AI Tool Stack</h2>
          <button
            type="button"
            onClick={addTool}
            className="w-full sm:w-auto text-xs md:text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-2 rounded-lg font-black transition-all active:scale-95 uppercase tracking-wider"
            aria-label="Add another tool to your stack"
          >
            + Add Tool
          </button>
        </div>

        {formData.tools.length === 0 ? (
          <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-3xl md:rounded-[2.5rem] min-h-[200px] md:min-h-[300px] flex flex-col items-center justify-center p-8 md:p-16 text-center">
            <p className="text-gray-300 text-lg md:text-2xl font-medium mb-8 md:mb-10 max-w-2xl">
              No tools added yet. Add the tools you are currently paying for to begin your professional audit.
            </p>
            <button
              type="button"
              onClick={addTool}
              className="text-sm md:text-lg bg-white/10 hover:bg-white/20 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl transition-all font-black uppercase tracking-widest"
              aria-label="Add your first tool to get started"
            >
              Add your first tool
            </button>
          </div>
        ) : (
          <div className="space-y-3" role="list">
            {formData.tools.map((toolEntry, index) => {
              const selectedTool = tools.find((t) => t.id === toolEntry.toolId);
              const selectedPlan = getToolPlan(toolEntry.toolId, toolEntry.planId);

              return (
                <div key={index} role="listitem" className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl relative shadow-xl group transition-all hover:bg-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => removeTool(index)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white border border-red-500/20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Remove ${selectedTool?.name || 'tool'} from stack`}
                  >
                    ×
                  </button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    {/* Tool Selection */}
                    <div className="col-span-1">
                      <label htmlFor={`tool-${index}`} className="block text-[10px] font-bold text-gray-300 mb-2 md:mb-3 uppercase tracking-[0.2em]">Tool</label>
                      <select
                        id={`tool-${index}`}
                        value={toolEntry.toolId}
                        onChange={(e) => updateTool(index, { toolId: e.target.value as ToolId })}
                        className="w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-sm md:text-base text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        aria-label="Select AI Tool"
                      >
                        {tools.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan Selection */}
                    <div className="col-span-1">
                      <label htmlFor={`plan-${index}`} className="block text-[10px] font-bold text-gray-300 mb-2 md:mb-3 uppercase tracking-[0.2em]">Plan</label>
                      <select
                        id={`plan-${index}`}
                        value={toolEntry.planId}
                        onChange={(e) => updateTool(index, { planId: e.target.value })}
                        className="w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-sm md:text-base text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        aria-label="Select Plan"
                      >
                        {selectedTool?.plans.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Primary Use Case */}
                    <div className="col-span-1">
                      <label htmlFor={`use-case-${index}`} className="block text-[10px] font-bold text-gray-300 mb-2 md:mb-3 uppercase tracking-[0.2em]">Use Case</label>
                      <select
                        id={`use-case-${index}`}
                        value={toolEntry.primaryUseCase}
                        onChange={(e) => updateTool(index, { primaryUseCase: e.target.value as UseCase })}
                        className="w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-sm md:text-base text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        aria-label="Select Primary Use Case"
                      >
                        {Object.entries(USE_CASE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div className="col-span-1">
                      <label htmlFor={`seats-${index}`} className="block text-[10px] font-bold text-gray-300 mb-2 md:mb-3 uppercase tracking-[0.2em]">Seats</label>
                      <input
                        id={`seats-${index}`}
                        type="number"
                        min="1"
                        value={toolEntry.seats}
                        onChange={(e) => updateTool(index, { seats: parseInt(e.target.value) || 1 })}
                        disabled={!selectedPlan?.isPerUser}
                        className={`w-full h-12 bg-gray-950 border border-gray-700 rounded-xl px-4 text-sm md:text-base text-white focus:outline-none focus:border-blue-500 transition-all ${!selectedPlan?.isPerUser ? 'opacity-30 cursor-not-allowed' : ''}`}
                        aria-label="Number of seats"
                      />
                    </div>
                    
                    {/* Spend */}
                    <div className="col-span-1">
                      <label htmlFor={`spend-${index}`} className="block text-[10px] font-bold text-gray-300 mb-2 md:mb-3 uppercase tracking-[0.2em]">Spend/mo</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500 text-sm" aria-hidden="true">$</span>
                        <input
                          id={`spend-${index}`}
                          type="number"
                          min="0"
                          step="1"
                          value={toolEntry.monthlySpend}
                          onChange={(e) => updateTool(index, { monthlySpend: parseFloat(e.target.value) || 0 })}
                          disabled={!selectedPlan?.isCustom && !selectedPlan?.isApiDirect}
                          className={`w-full h-12 bg-gray-950 border border-gray-700 rounded-xl pl-8 pr-4 text-sm md:text-base text-white focus:outline-none focus:border-blue-500 transition-all ${!selectedPlan?.isCustom && !selectedPlan?.isApiDirect ? 'opacity-30 cursor-not-allowed' : ''}`}
                          aria-label="Monthly spend amount"
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

      <div className="flex justify-center pt-4 md:pt-8 border-t border-white/10">
        <button
          type="submit"
          disabled={formData.tools.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white w-full sm:w-56 h-12 rounded-lg font-black text-sm transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
          aria-label="Run audit and calculate savings"
        >
          Run Audit
        </button>
      </div>
    </form>
  );
}
