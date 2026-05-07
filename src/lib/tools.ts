import { Tool, ToolId } from "@/types";

// ============================================================
// AI Tool Database — Plans & Pricing
// Will be populated with all 8 supported tools
// ============================================================

export const TOOLS: Record<string, Tool> = {};

/** Get all tools as an array */
export function getAllTools(): Tool[] {
  return Object.values(TOOLS);
}

/** Get a specific tool by ID */
export function getToolById(id: ToolId): Tool | undefined {
  return TOOLS[id];
}

/** Get a specific plan for a tool */
export function getToolPlan(toolId: ToolId, planId: string) {
  const tool = TOOLS[toolId];
  if (!tool) return undefined;
  return tool.plans.find((p) => p.id === planId);
}

/** Use case display labels */
export const USE_CASE_LABELS: Record<string, string> = {
  "code-completion": "Code Completion",
  "chat-debug": "Chat & Debugging",
  "code-review": "Code Review",
  documentation: "Documentation",
  "api-integration": "API Integration",
  general: "General Use",
};
