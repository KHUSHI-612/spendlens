import { Tool, ToolId } from "@/types";

// ============================================================
// AI Tool Database - Plans & Pricing
// All pricing verified on 2025-05-07 from official sources
// See docs/PRICING_DATA.md for source URLs
// ============================================================

export const TOOLS: Record<string, Tool> = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    icon: "CR",
    category: "ide-assistant",
    overlaps: ["github-copilot", "windsurf"],
    plans: [
      {
        id: "cursor-hobby",
        name: "Hobby",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Limited agent requests", "Limited tab completions"],
      },
      {
        id: "cursor-pro",
        name: "Pro",
        pricePerUser: 20,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Unlimited completions", "500 fast premium requests"],
      },
      {
        id: "cursor-pro-plus",
        name: "Pro+",
        pricePerUser: 60,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "More premium requests", "Priority access"],
      },
      {
        id: "cursor-ultra",
        name: "Ultra",
        pricePerUser: 200,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro+", "Highest limits", "Priority support"],
      },
      {
        id: "cursor-teams",
        name: "Teams (Business)",
        pricePerUser: 40,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "Admin dashboard", "Centralized billing", "Usage analytics"],
      },
      {
        id: "cursor-enterprise",
        name: "Enterprise",
        pricePerUser: 0,
        isPerUser: true,
        isCustom: true,
        isApiDirect: false,
        features: ["Everything in Teams", "Custom contracts", "SSO", "Dedicated support"],
      },
    ],
  },

  "github-copilot": {
    id: "github-copilot",
    name: "GitHub Copilot",
    icon: "GH",
    category: "ide-assistant",
    overlaps: ["cursor", "windsurf"],
    plans: [
      {
        id: "copilot-free",
        name: "Free",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["50 agent/chat requests/mo", "2000 completions/mo"],
      },
      {
        id: "copilot-pro",
        name: "Pro",
        pricePerUser: 10,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Unlimited completions", "Chat in IDE", "CLI assistance"],
      },
      {
        id: "copilot-pro-plus",
        name: "Pro+",
        pricePerUser: 39,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "Higher limits", "Advanced models"],
      },
      {
        id: "copilot-business",
        name: "Business",
        pricePerUser: 19,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "Org-wide policies", "Audit logs"],
      },
      {
        id: "copilot-enterprise",
        name: "Enterprise",
        pricePerUser: 39,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Business", "Codebase-aware chat", "Fine-tuned models"],
      },
    ],
  },

  claude: {
    id: "claude",
    name: "Claude",
    icon: "CL",
    category: "chat-assistant",
    overlaps: ["chatgpt"],
    plans: [
      {
        id: "claude-free",
        name: "Free",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Basic access", "Limited messages"],
      },
      {
        id: "claude-pro",
        name: "Pro",
        pricePerUser: 20,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["5x more usage", "Priority access", "Claude Sonnet & Opus"],
      },
      {
        id: "claude-max",
        name: "Max",
        pricePerUser: 100,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["20x usage", "Extended thinking", "Priority access"],
      },
      {
        id: "claude-team-standard",
        name: "Team Standard",
        pricePerUser: 25,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "Team workspace", "Admin controls"],
      },
      {
        id: "claude-team-premium",
        name: "Team Premium",
        pricePerUser: 125,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Max", "Team workspace", "Higher limits"],
      },
      {
        id: "claude-enterprise",
        name: "Enterprise",
        pricePerUser: 20,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["$20/seat + usage at API rates", "SSO/SCIM", "Audit logs"],
      },
    ],
  },

  "anthropic-api": {
    id: "anthropic-api",
    name: "Anthropic API",
    icon: "AA",
    category: "api-direct",
    overlaps: ["openai-api"],
    plans: [
      {
        id: "anthropic-api-direct",
        name: "Direct Usage",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
        features: [
          "Opus 4.7: $5/$25 per MTok",
          "Sonnet 4.6: $3/$15 per MTok",
          "Haiku 4.5: $1/$5 per MTok",
        ],
      },
    ],
  },

  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "GP",
    category: "chat-assistant",
    overlaps: ["claude"],
    plans: [
      {
        id: "chatgpt-free",
        name: "Free",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Basic access", "Limited messages"],
      },
      {
        id: "chatgpt-go",
        name: "Go",
        pricePerUser: 5,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Basic GPT access", "Higher limits than Free"],
      },
      {
        id: "chatgpt-plus",
        name: "Plus",
        pricePerUser: 24,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["GPT-4o", "DALL·E", "Advanced data analysis", "GPTs"],
      },
      {
        id: "chatgpt-pro",
        name: "Pro",
        pricePerUser: 128,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Unlimited GPT-4o", "o1 pro mode", "Highest limits"],
      },
      {
        id: "chatgpt-business",
        name: "Business",
        pricePerUser: 22,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["ChatGPT + Codex", "Admin console", "Shared workspace"],
      },
      {
        id: "chatgpt-enterprise",
        name: "Enterprise",
        pricePerUser: 0,
        isPerUser: true,
        isCustom: true,
        isApiDirect: false,
        features: ["Unlimited GPT-4o", "SSO", "Advanced security", "Analytics"],
      },
    ],
  },

  "openai-api": {
    id: "openai-api",
    name: "OpenAI API",
    icon: "OA",
    category: "api-direct",
    overlaps: ["anthropic-api"],
    plans: [
      {
        id: "openai-api-direct",
        name: "Direct Usage",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
        features: [
          "GPT-5.5: $5/$30 per MTok",
          "GPT-5.4: $2.50/$15 per MTok",
          "GPT-5.4 mini: $0.75/$4.50 per MTok",
          "Batch: 50% discount",
        ],
      },
    ],
  },

  gemini: {
    id: "gemini",
    name: "Gemini",
    icon: "GM",
    category: "api-direct",
    overlaps: [],
    plans: [
      {
        id: "gemini-free",
        name: "Free Tier",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Most models available", "Lower rate limits", "Data used to improve products"],
      },
      {
        id: "gemini-api",
        name: "Paid API",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
        features: [
          "2.5 Pro: $1.25/$10 per MTok",
          "2.5 Flash: $0.30/$2.50 per MTok",
          "2.5 Flash-Lite: $0.10/$0.40 per MTok",
          "Higher limits, data not used for training",
        ],
      },
    ],
  },

  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    icon: "WS",
    category: "ide-assistant",
    overlaps: ["cursor", "github-copilot"],
    plans: [
      {
        id: "windsurf-free",
        name: "Free",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        features: ["Limited quotas", "Basic completions"],
      },
      {
        id: "windsurf-pro",
        name: "Pro",
        pricePerUser: 20,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Unlimited completions", "Advanced AI flows", "Cascade"],
      },
      {
        id: "windsurf-max",
        name: "Max",
        pricePerUser: 200,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "Highest limits", "Priority support"],
      },
      {
        id: "windsurf-teams",
        name: "Teams",
        pricePerUser: 40,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        features: ["Everything in Pro", "Team management", "Centralized billing"],
      },
      {
        id: "windsurf-enterprise",
        name: "Enterprise",
        pricePerUser: 0,
        isPerUser: true,
        isCustom: true,
        isApiDirect: false,
        features: ["Custom contracts", "SSO", "Dedicated support"],
      },
    ],
  },
};

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
