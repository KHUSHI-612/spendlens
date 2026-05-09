// ============================================================
// SpendLens Type Definitions
// ============================================================

/** Supported AI tool identifiers */
export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

/** Primary use case categories */
export type UseCase =
  | "code-completion"
  | "chat-debug"
  | "code-review"
  | "documentation"
  | "api-integration"
  | "general";

/** Tool category classification */
export type ToolCategory = "ide-assistant" | "chat-assistant" | "api-direct";

/** Recommended action for a tool */
export type RecommendedAction =
  | "keep"
  | "downgrade"
  | "switch-plan"
  | "drop"
  | "use-credex";

/** Savings tier classification */
export type SavingsTier = "high" | "moderate" | "low";

// ============================================================
// Tool & Plan Definitions
// ============================================================

/** A specific plan/tier for a tool */
export interface ToolPlan {
  id: string;
  name: string;
  pricePerUser: number; // $/user/month, 0 for free tiers
  isPerUser: boolean; // true = per-seat pricing
  isCustom: boolean; // enterprise/custom pricing (user enters manually)
  isApiDirect: boolean; // direct API usage (user enters actual spend)
  features: string[];
}

/** Full tool definition with plans and overlap info */
export interface Tool {
  id: ToolId;
  name: string;
  icon: string; // emoji icon for display
  category: ToolCategory;
  plans: ToolPlan[];
  overlaps: ToolId[]; // tools with significant feature overlap
}

// ============================================================
// Form Data (User Input)
// ============================================================

/** User's entry for a single tool they're paying for */
export interface UserToolEntry {
  toolId: ToolId;
  planId: string;
  monthlySpend: number; // actual monthly spend (manual input)
  seats: number; // number of seats/users
  primaryUseCase: UseCase;
}

/** Complete form state submitted by the user */
export interface AuditFormData {
  tools: UserToolEntry[];
  teamSize: number;
  companyName?: string;
}

// ============================================================
// Audit Results (Output)
// ============================================================

/** Recommendation for a single tool */
export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentSpend: number;
  recommendedAction: RecommendedAction;
  recommendedPlan?: string;
  reasoning: string;
  monthlySavings: number;
  credexRelevant: boolean;
  credexSavingsRange?: { min: number; max: number };
}

/** Complete audit result */
export interface AuditResult {
  id: string;
  createdAt: string;
  formData: AuditFormData;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary?: string;
  savingsTier: SavingsTier;
}

// ============================================================
// API / Database Types
// ============================================================

/** Supabase audit row */
export interface AuditRow {
  id: string;
  created_at: string;
  form_data: AuditFormData;
  recommendations: ToolRecommendation[];
  total_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  ai_summary: string | null;
  savings_tier: SavingsTier;
}

/** Supabase lead row */
export interface LeadRow {
  id: string;
  created_at: string;
  audit_id: string;
  email: string;
  company: string | null;
  role: string | null;
  savings_amount: number | null;
}

/** Lead capture form input */
export interface LeadInput {
  email: string;
  companyName?: string;
  role?: string;
  auditId: string;
  savingsAmount?: number;
  website?: string; // Honeypot
}
