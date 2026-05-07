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
// Pure logic — no AI, no external calls
// ============================================================

/**
 * Run a full spending audit on the user's AI tool stack.
 * Evaluates each tool against hardcoded rules and returns
 * recommendations with savings calculations.
 */
export function runAudit(formData: AuditFormData): AuditResult {
  const recommendations: ToolRecommendation[] = [];

  // Evaluate each tool individually (Rules 1, 2, 4)
  for (const entry of formData.tools) {
    const rec = evaluateTool(entry);
    recommendations.push(rec);
  }

  // Evaluate overlapping tools (Rule 3)
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

  const totalMonthlySpend = formData.tools.reduce(
    (sum, t) => sum + t.monthlySpend,
    0
  );
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  // Rule 5 & 6: Classify savings tier
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
// Per-Tool Evaluation (checks Rules 1, 2, 4)
// ============================================================

function evaluateTool(entry: UserToolEntry): ToolRecommendation {
  const tool = TOOLS[entry.toolId];
  const plan = getToolPlan(entry.toolId, entry.planId);
  const toolName = tool?.name ?? entry.toolId;

  if (!tool || !plan) {
    return {
      toolId: entry.toolId,
      toolName,
      currentSpend: entry.monthlySpend,
      recommendedAction: "keep",
      reasoning: "Unable to evaluate — tool or plan not found in our database.",
      monthlySavings: 0,
      credexRelevant: false,
    };
  }

  // Rule 4: API direct usage — recommend Credex credits
  if (plan.isApiDirect && entry.monthlySpend > 0) {
    return evaluateApiDirect(entry, tool.name);
  }

  // Rule 1: Small team on Team/Business plan — recommend downgrade
  const teamDowngrade = evaluateTeamDowngrade(entry, tool.name);
  if (teamDowngrade) return teamDowngrade;

  // Rule 2: Paying for Pro when Free tier would work
  const freeDowngrade = evaluateFreeDowngrade(entry, tool.name);
  if (freeDowngrade) return freeDowngrade;

  // No issues — tool is well-optimized
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
// Rule 1: Small Team on Team/Business Plan
// If seats < 3 and on a team/business tier, recommend
// switching to individual plans to save money.
// ============================================================

function evaluateTeamDowngrade(
  entry: UserToolEntry,
  toolName: string
): ToolRecommendation | null {
  const tool = TOOLS[entry.toolId];
  const currentPlan = getToolPlan(entry.toolId, entry.planId);

  if (!tool || !currentPlan) return null;

  // Only applies to per-user plans with fewer than 3 seats
  if (!currentPlan.isPerUser || entry.seats >= 3) return null;

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

  if (savings <= 0) return null;

  return {
    toolId: entry.toolId,
    toolName,
    currentSpend: entry.monthlySpend,
    recommendedAction: "downgrade",
    recommendedPlan: bestAlt.name,
    reasoning: `You have ${entry.seats} seat${entry.seats === 1 ? "" : "s"} on the ${currentPlan.name} plan ($${currentPlan.pricePerUser}/user/mo). With fewer than 3 users, the ${bestAlt.name} plan ($${bestAlt.pricePerUser}/user/mo) gives you the same core features for $${savings}/mo less.`,
    monthlySavings: savings,
    credexRelevant: false,
  };
}

// ============================================================
// Rule 2: Paying for Pro When Free Tier Works
// If use case is general/documentation (light use), and there's
// a free plan available, recommend downgrading.
// ============================================================

function evaluateFreeDowngrade(
  entry: UserToolEntry,
  toolName: string
): ToolRecommendation | null {
  const tool = TOOLS[entry.toolId];
  const currentPlan = getToolPlan(entry.toolId, entry.planId);

  if (!tool || !currentPlan) return null;
  if (currentPlan.pricePerUser === 0) return null;

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
// Rule 3: Overlapping Tools
// If two tools share overlapping features AND the user is using
// them for the same use case, recommend dropping the pricier one.
// ============================================================

function evaluateOverlaps(entries: UserToolEntry[]): ToolRecommendation[] {
  const overlapRecs: ToolRecommendation[] = [];
  const processed = new Set<string>();

  for (const entry of entries) {
    if (processed.has(entry.toolId)) continue;

    const tool = TOOLS[entry.toolId];
    if (!tool) continue;

    // Find other tools that overlap AND share the same primary use case
    const overlapping = entries.filter(
      (other) =>
        other.toolId !== entry.toolId &&
        tool.overlaps.includes(other.toolId) &&
        other.primaryUseCase === entry.primaryUseCase &&
        !processed.has(other.toolId)
    );

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
        reasoning: `${dropTool.name} and ${keepTool.name} overlap significantly for ${dropEntry.primaryUseCase}. You're already using ${keepTool.name} ($${toKeep.monthlySpend}/mo), so dropping ${dropTool.name} saves $${dropEntry.monthlySpend}/mo.`,
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
// Rule 4: Retail API Pricing — Suggest Credex Credits
// If user is paying retail token prices, Credex marketplace
// offers ~20% savings on bulk credits.
// ============================================================

function evaluateApiDirect(
  entry: UserToolEntry,
  toolName: string
): ToolRecommendation {
  const credexSavingsRate = 0.2;
  const savings = Math.round(entry.monthlySpend * credexSavingsRate * 100) / 100;

  return {
    toolId: entry.toolId,
    toolName,
    currentSpend: entry.monthlySpend,
    recommendedAction: "use-credex",
    reasoning: `You're paying retail prices for ${toolName} ($${entry.monthlySpend}/mo). Credex offers discounted AI credits at roughly 20% off retail. That's $${savings}/mo in savings on the same usage.`,
    monthlySavings: savings,
    credexRelevant: true,
  };
}

// ============================================================
// Fallback Summary (template-based, no AI needed)
// ============================================================

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
  } else {
    summary += ` Your spending looks well-optimized — no significant savings found.`;
  }

  if (credexTools.length > 0) {
    summary += ` Consider Credex credits for your API usage to unlock additional discounts.`;
  }

  return summary;
}
