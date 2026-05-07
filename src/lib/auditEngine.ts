import {
  AuditFormData,
  AuditResult,
  SavingsTier,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// SpendLens Audit Engine
// Pure logic — no AI, no external calls
// Rules will be implemented incrementally
// ============================================================

/**
 * Run a full spending audit on the user's AI tool stack.
 * Returns recommendations, savings calculations, and tier classification.
 */
export function runAudit(formData: AuditFormData): AuditResult {
  const totalMonthlySpend = formData.tools.reduce(
    (sum, t) => sum + t.monthlySpend,
    0
  );

  // TODO: Implement audit rules
  // Rule 1: Small team on Team plan → recommend downgrade
  // Rule 2: Paying for Pro when Free works → flag it
  // Rule 3: Overlapping tools → recommend dropping one
  // Rule 4: Retail API pricing → surface Credex credits
  // Rule 5: Savings > $500/mo → show Credex CTA
  // Rule 6: Savings < $100/mo → show "spending well"

  const totalMonthlySavings = 0;
  const totalAnnualSavings = 0;

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
    recommendations: [],
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier,
  };
}

/**
 * Fallback summary when Anthropic API is unavailable.
 */
export function generateFallbackSummary(result: AuditResult): string {
  const toolCount = result.recommendations.length;
  return `Your team is spending $${result.totalMonthlySpend}/mo across ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}. Detailed analysis coming soon.`;
}
