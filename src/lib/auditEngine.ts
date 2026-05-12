import {
  AuditFormData,
  AuditResult,
  ToolRecommendation,
  UserToolEntry,
  SavingsTier,
} from "@/types";
import { TOOLS, getToolPlan } from "./tools";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// SpendLens Audit Engine
// Pure logic - no AI, no external calls
// ============================================================

/**
 * Run a full spending audit on the user's AI tool stack.
 * Evaluates each tool against hardcoded rules and returns
 * recommendations with savings calculations.
 */
export function runAudit(formData: AuditFormData): AuditResult {
  const recommendations: ToolRecommendation[] = [];

  // Evaluate each tool individually
  for (const entry of formData.tools) {
    const rec = evaluateTool(entry, formData.teamSize);
    recommendations.push(rec);
  }

  // Evaluate overlapping tools by category
  const overlapRecs = evaluateOverlaps(formData.tools);
  for (const overlapRec of overlapRecs) {
    const idx = recommendations.findIndex(
      (r) => r.toolId === overlapRec.toolId
    );
    // Only replace if overlap savings are greater than existing recommendation
    if (idx !== -1 && overlapRec.monthlySavings > recommendations[idx].monthlySavings) {
      recommendations[idx] = overlapRec;
    }
  }

  // Evaluate same-vendor redundancy
  const redundancyRecs = evaluateVendorRedundancy(formData.tools);
  for (const redundancyRec of redundancyRecs) {
    const idx = recommendations.findIndex(
      (r) => r.toolId === redundancyRec.toolId
    );
    if (idx !== -1 && redundancyRec.monthlySavings > recommendations[idx].monthlySavings) {
      recommendations[idx] = redundancyRec;
    }
  }

  const totalMonthlySpend = formData.tools.reduce(
    (sum, t) => sum + t.monthlySpend,
    0
  );
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  // Classify savings tier
  let savingsTier: SavingsTier;
  if (totalMonthlySavings > 500) {
    savingsTier = "high";
  } else if (totalMonthlySavings >= 100) {
    savingsTier = "moderate";
  } else {
    savingsTier = "low";
  }

  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    formData,
    recommendations,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier,
  };
}

// ============================================================
// Per-Tool Evaluation
// ============================================================

function evaluateTool(entry: UserToolEntry, teamSize: number): ToolRecommendation {
  const tool = TOOLS[entry.toolId];
  const plan = getToolPlan(entry.toolId, entry.planId);
  const toolName = tool?.name ?? entry.toolId;

  if (!tool || !plan) {
    return {
      toolId: entry.toolId,
      toolName,
      currentSpend: entry.monthlySpend,
      recommendedAction: "keep",
      reasoning: "Unable to evaluate - tool or plan not found in our database.",
      monthlySavings: 0,
      credexRelevant: false,
    };
  }

  // API direct usage - recommend Credex credits
  if (plan.isApiDirect && entry.monthlySpend > 0) {
    return evaluateApiDirect(entry, tool.name);
  }

  // Seat count vs team size mismatch
  const seatMismatch = evaluateSeatMismatch(entry, tool.name, teamSize);
  if (seatMismatch) return seatMismatch;

  // Small team on Team/Business plan - recommend downgrade
  const teamDowngrade = evaluateTeamDowngrade(entry, tool.name);
  if (teamDowngrade) return teamDowngrade;

  // Paying for Pro when Free tier would work
  const freeDowngrade = evaluateFreeDowngrade(entry, tool.name);
  if (freeDowngrade) return freeDowngrade;

  // No issues - tool is well-optimized
  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentSpend: entry.monthlySpend,
    recommendedAction: "keep",
    reasoning: `Your ${tool.name} ${plan.name} plan is well-suited for your use case. No changes recommended.`,
    monthlySavings: 0,
    credexRelevant: false,
  };
}

// ============================================================
// Seat Mismatch
// If user pays for more seats than teamSize, recommend dropping seats.
// ============================================================

/**
 * Evaluates whether a user is paying for more seats than their team size.
 * Suggests removing excess seats to save money.
 */
function evaluateSeatMismatch(
  entry: UserToolEntry,
  toolName: string,
  teamSize: number
): ToolRecommendation | null {
  if (entry.seats > teamSize) {
    const currentPlan = getToolPlan(entry.toolId, entry.planId);
    if (!currentPlan) return null;
    
    const excessSeats = entry.seats - teamSize;
    const savings = excessSeats * currentPlan.pricePerUser;
    
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName,
        currentSpend: entry.monthlySpend,
        recommendedAction: "downgrade",
        reasoning: `You're paying for ${entry.seats} ${toolName} ${currentPlan.name} seats ($${currentPlan.pricePerUser}/mo) but only have ${teamSize} team members. Remove ${excessSeats} seat${excessSeats === 1 ? "" : "s"} to save $${savings}/mo.`,
        monthlySavings: savings,
        credexRelevant: false,
      };
    }
  }
  return null;
}

// ============================================================
// Team Plan Downgrade
// Compare current team plan cost with best individual alternative.
// If savings > $10/mo, recommend the downgrade.
// ============================================================

/**
 * Calculates actual total cost of current plan vs total cost of best individual plan alternative.
 * Recommends downgrading if the savings exceed $10/mo.
 */
function evaluateTeamDowngrade(
  entry: UserToolEntry,
  toolName: string
): ToolRecommendation | null {
  const tool = TOOLS[entry.toolId];
  const currentPlan = getToolPlan(entry.toolId, entry.planId);

  if (!tool || !currentPlan) return null;

  // Check if this is actually a team/business tier
  const planNameLower = currentPlan.name.toLowerCase();
  const isTeamPlan =
    planNameLower.includes("team") ||
    planNameLower.includes("business") ||
    planNameLower.includes("enterprise");

  if (!isTeamPlan) return null;

  // Find the best individual alternative
  const individualPlans = tool.plans.filter(
    (p) =>
      !p.isCustom &&
      !p.isApiDirect &&
      p.id !== currentPlan.id &&
      !p.name.toLowerCase().includes("team") &&
      !p.name.toLowerCase().includes("business") &&
      !p.name.toLowerCase().includes("enterprise")
  );

  // Sort ascending by price, prefer cheapest paid plan
  const sorted = [...individualPlans].sort(
    (a, b) => a.pricePerUser - b.pricePerUser
  );
  const bestAlt = sorted.find((p) => p.pricePerUser > 0) || sorted[0];

  if (!bestAlt) return null;

  const currentTotal = currentPlan.pricePerUser * entry.seats;
  const altTotal = bestAlt.isPerUser
    ? bestAlt.pricePerUser * entry.seats
    : bestAlt.pricePerUser;
  const savings = currentTotal - altTotal;

  if (savings > 10) {
    return {
      toolId: entry.toolId,
      toolName,
      currentSpend: entry.monthlySpend,
      recommendedAction: "downgrade",
      recommendedPlan: bestAlt.name,
      reasoning: `You have ${entry.seats} seat${entry.seats === 1 ? "" : "s"} on the ${currentPlan.name} plan ($${currentPlan.pricePerUser}/user/mo). The ${bestAlt.name} plan ($${bestAlt.pricePerUser}/user/mo) gives you the same core features for $${savings}/mo less.`,
      monthlySavings: savings,
      credexRelevant: false,
    };
  }

  return null;
}

// ============================================================
// Paying for Pro When Free Tier Works
// If use case is general/documentation, spend is below $30/mo, 
// and there's a free plan available, recommend downgrading.
// ============================================================

/**
 * Flags users on paid plans with light use cases and spend < $30/mo,
 * suggesting they switch to the free tier if it adequately covers their needs.
 */
function evaluateFreeDowngrade(
  entry: UserToolEntry,
  toolName: string
): ToolRecommendation | null {
  const tool = TOOLS[entry.toolId];
  const currentPlan = getToolPlan(entry.toolId, entry.planId);

  if (!tool || !currentPlan) return null;
  if (currentPlan.pricePerUser === 0) return null;
  
  // Don't recommend free for users spending $30+/mo - they need higher limits
  if (entry.monthlySpend >= 30) return null;

  // Only flag for light use cases
  const lightUseCases = ["general", "documentation"];
  if (!lightUseCases.includes(entry.primaryUseCase)) return null;

  // Check if a free plan exists
  const freePlan = tool.plans.find(
    (p) => p.pricePerUser === 0 && !p.isApiDirect && !p.isCustom
  );

  if (!freePlan) return null;

  const savings = entry.monthlySpend;

  return {
    toolId: entry.toolId,
    toolName,
    currentSpend: entry.monthlySpend,
    recommendedAction: "downgrade",
    recommendedPlan: freePlan.name,
    reasoning: `You're using ${toolName} primarily for ${entry.primaryUseCase}. The ${freePlan.name} tier handles this use case well. Downgrading from ${currentPlan.name} ($${currentPlan.pricePerUser}/mo) saves you $${savings}/mo.`,
    monthlySavings: savings,
    credexRelevant: false,
  };
}

// ============================================================
// Overlapping Tools
// Checks for tools in the same category regardless of use case.
// Recommends dropping the pricier overlapping tool(s).
// ============================================================

/**
 * Identifies tools that fall into the same category (e.g., multiple IDE assistants).
 * Suggests consolidating to the cheapest tool in that category.
 */
function evaluateOverlaps(entries: UserToolEntry[]): ToolRecommendation[] {
  const overlapRecs: ToolRecommendation[] = [];
  const processed = new Set<string>();

  for (const entry of entries) {
    if (processed.has(entry.toolId)) continue;

    const tool = TOOLS[entry.toolId];
    if (!tool) continue;

    // Find other tools that share the same category or are explicitly listed in overlaps
    const overlapping = entries.filter((other) => {
      if (other.toolId === entry.toolId) return false;
      if (processed.has(other.toolId)) return false;
      const otherTool = TOOLS[other.toolId];
      if (!otherTool) return false;
      return tool.category === otherTool.category || tool.overlaps.includes(other.toolId);
    });

    if (overlapping.length === 0) continue;

    // Sort all overlapping tools by spend (most expensive first)
    const group = [entry, ...overlapping];
    const sorted = [...group].sort(
      (a, b) => b.monthlySpend - a.monthlySpend
    );

    // Keep the cheapest, recommend dropping the rest
    const toKeep = sorted[sorted.length - 1];
    const toDrop = sorted.slice(0, -1);

    for (const dropEntry of toDrop) {
      const dropTool = TOOLS[dropEntry.toolId];
      const keepTool = TOOLS[toKeep.toolId];

      if (!dropTool || !keepTool) continue;

      overlapRecs.push({
        toolId: dropEntry.toolId,
        toolName: dropTool.name,
        currentSpend: dropEntry.monthlySpend,
        recommendedAction: "drop",
        reasoning: `${dropTool.name} and ${keepTool.name} overlap significantly in the ${keepTool.category} category. You're already using ${keepTool.name} ($${toKeep.monthlySpend}/mo), so dropping ${dropTool.name} saves $${dropEntry.monthlySpend}/mo.`,
        monthlySavings: dropEntry.monthlySpend,
        credexRelevant: false,
      });

      processed.add(dropEntry.toolId);
    }

    processed.add(entry.toolId);
  }

  return overlapRecs;
}

// ============================================================
// Same Vendor Redundancy
// Detects if a user is paying for both a flat plan and API 
// usage from the same vendor (e.g., Claude Pro + Anthropic API).
// ============================================================

/**
 * Checks if the user is paying for both a subscription plan and direct API
 * usage from the same vendor, recommending consolidation to avoid double-paying.
 */
function evaluateVendorRedundancy(entries: UserToolEntry[]): ToolRecommendation[] {
  const redundancyRecs: ToolRecommendation[] = [];

  const hasClaudePro = entries.find(e => e.toolId === 'claude' && getToolPlan(e.toolId, e.planId)?.name.toLowerCase().includes('pro'));
  const hasAnthropicApi = entries.find(e => e.toolId === 'anthropic-api');
  
  if (hasClaudePro && hasAnthropicApi) {
    redundancyRecs.push({
      toolId: hasClaudePro.toolId,
      toolName: TOOLS[hasClaudePro.toolId]?.name || 'Claude',
      currentSpend: hasClaudePro.monthlySpend,
      recommendedAction: "drop",
      reasoning: `You're paying for both Claude Pro and Anthropic API direct. Claude Pro already includes API-equivalent usage. Consider consolidating to API-only if your usage is programmatic, or Pro-only if it's conversational.`,
      monthlySavings: hasClaudePro.monthlySpend,
      credexRelevant: false,
    });
  }

  const hasChatGptPlus = entries.find(e => e.toolId === 'chatgpt' && (getToolPlan(e.toolId, e.planId)?.name.toLowerCase().includes('plus') || getToolPlan(e.toolId, e.planId)?.name.toLowerCase().includes('pro')));
  const hasOpenAiApi = entries.find(e => e.toolId === 'openai-api');

  if (hasChatGptPlus && hasOpenAiApi) {
    redundancyRecs.push({
      toolId: hasChatGptPlus.toolId,
      toolName: TOOLS[hasChatGptPlus.toolId]?.name || 'ChatGPT',
      currentSpend: hasChatGptPlus.monthlySpend,
      recommendedAction: "drop",
      reasoning: `You're paying for both ChatGPT Plus/Pro and OpenAI API direct. ChatGPT subscriptions include conversational access that might overlap with your API usage. Consider consolidating to API-only if your usage is programmatic, or Plus/Pro-only if it's conversational.`,
      monthlySavings: hasChatGptPlus.monthlySpend,
      credexRelevant: false,
    });
  }

  return redundancyRecs;
}

// ============================================================
// Retail API Pricing - Suggest Credex Credits
// If user is paying retail token prices, Credex marketplace
// offers ~15-30% savings on bulk credits.
// ============================================================

/**
 * Suggests purchasing API credits through Credex to achieve 15-30% discounts 
 * when the user is paying retail prices for API usage.
 */
function evaluateApiDirect(
  entry: UserToolEntry,
  toolName: string
): ToolRecommendation {
  const credexSavingsRate = 0.2;
  const minSavingsRate = 0.15;
  const maxSavingsRate = 0.30;

  const savings = Math.round(entry.monthlySpend * credexSavingsRate * 100) / 100;
  const minSavings = Math.round(entry.monthlySpend * minSavingsRate * 100) / 100;
  const maxSavings = Math.round(entry.monthlySpend * maxSavingsRate * 100) / 100;

  return {
    toolId: entry.toolId,
    toolName,
    currentSpend: entry.monthlySpend,
    recommendedAction: "use-credex",
    reasoning: `Credex sources credits from companies that overforecast usage. Discounts typically range 15–30% off retail. We use a conservative 20% estimate. At your current spend of $${entry.monthlySpend}/mo, that's $${savings}/mo in savings.`,
    monthlySavings: savings,
    credexRelevant: true,
    credexSavingsRange: { min: minSavings, max: maxSavings },
  };
}

// ============================================================
// Fallback Summary (template-based, no AI needed)
// ============================================================

/**
 * Generates a plain text summary of the audit results, explicitly 
 * mentioning new rules if they fire.
 */
export function generateFallbackSummary(result: AuditResult): string {
  const toolCount = result.recommendations.length;
  const savingsTools = result.recommendations.filter(
    (r) => r.monthlySavings > 0
  );
  const credexTools = result.recommendations.filter((r) => r.credexRelevant);

  let summary = `Your team is spending $${result.totalMonthlySpend}/mo across ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}.`;

  if (savingsTools.length > 0) {
    summary += ` We found $${result.totalMonthlySavings}/mo in potential savings ($${result.totalAnnualSavings}/yr).`;

    const topSaving = [...savingsTools].sort(
      (a, b) => b.monthlySavings - a.monthlySavings
    )[0];
    summary += ` Your biggest opportunity is ${topSaving.toolName}, where you could save $${topSaving.monthlySavings}/mo.`;

    const hasSeatMismatch = savingsTools.some(r => r.reasoning.includes("team members. Remove"));
    const hasVendorRedundancy = savingsTools.some(r => r.reasoning.includes("consolidating to API-only"));
    
    if (hasSeatMismatch) {
      summary += ` We also noticed you are paying for more seats than you have actual team members.`;
    }
    if (hasVendorRedundancy) {
      summary += ` You are currently paying for both a subscription plan and direct API usage from the same vendor, which is redundant.`;
    }
  } else {
    summary += ` Your spending looks well-optimized - no significant savings found.`;
  }

  if (credexTools.length > 0) {
    summary += ` Consider Credex credits for your API usage to unlock additional discounts.`;
  }

  return summary;
}
