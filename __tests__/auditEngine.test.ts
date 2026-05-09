import { runAudit } from "@/lib/auditEngine";
import { AuditFormData, UserToolEntry } from "@/types";

jest.mock("uuid", () => ({
  v4: () => "test-uuid",
}));

describe("SpendLens Audit Engine", () => {
  // Test 1: When seats (5) > teamSize (3) → recommendation for that tool has monthlySavings > 0
  test("seat mismatch recommendation when seats > teamSize", () => {
    const formData: AuditFormData = {
      teamSize: 3,
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-teams",
          seats: 5,
          monthlySpend: 200, // 5 * 40
          primaryUseCase: "code-completion",
        },
      ],
    };

    const result = runAudit(formData);
    const rec = result.recommendations.find((r) => r.toolId === "cursor");
    expect(rec).toBeDefined();
    expect(rec?.monthlySavings).toBeGreaterThan(0);
    expect(rec?.reasoning).toContain("Remove 2 seats");
  });

  // Test 2: When user has 2 seats on Cursor Teams plan ($40/seat = $80) → downgrade recommendation fires, savings > 0
  test("team plan downgrade for small team", () => {
    const formData: AuditFormData = {
      teamSize: 2,
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-teams",
          seats: 2,
          monthlySpend: 80,
          primaryUseCase: "code-completion",
        },
      ],
    };

    const result = runAudit(formData);
    const rec = result.recommendations.find((r) => r.toolId === "cursor");
    expect(rec).toBeDefined();
    expect(rec?.recommendedAction).toBe("downgrade");
    expect(rec?.monthlySavings).toBeGreaterThan(0);
    expect(rec?.recommendedPlan).toBe("Pro");
  });

  // Test 3: When user has Claude Pro plan, primaryUseCase = "general", monthlySpend = $20 → free tier downgrade recommended
  test("free tier downgrade for light use case", () => {
    const formData: AuditFormData = {
      teamSize: 1,
      tools: [
        {
          toolId: "claude",
          planId: "claude-pro",
          seats: 1,
          monthlySpend: 20,
          primaryUseCase: "general",
        },
      ],
    };

    const result = runAudit(formData);
    const rec = result.recommendations.find((r) => r.toolId === "claude");
    expect(rec).toBeDefined();
    expect(rec?.recommendedAction).toBe("downgrade");
    expect(rec?.recommendedPlan).toBe("Free");
    expect(rec?.monthlySavings).toBe(20);
  });

  // Test 4: When user has both Cursor Pro and GitHub Copilot Pro in stack → one of them gets a "drop" recommendation
  test("tool overlap recommendation for IDE assistants", () => {
    const formData: AuditFormData = {
      teamSize: 1,
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-pro",
          seats: 1,
          monthlySpend: 20,
          primaryUseCase: "code-completion",
        },
        {
          toolId: "github-copilot",
          planId: "copilot-pro",
          seats: 1,
          monthlySpend: 10,
          primaryUseCase: "code-completion",
        },
      ],
    };

    const result = runAudit(formData);
    const cursorRec = result.recommendations.find((r) => r.toolId === "cursor");
    const copilotRec = result.recommendations.find((r) => r.toolId === "github-copilot");

    // In overlap logic, the more expensive one (Cursor Pro $20) should be dropped
    expect(cursorRec?.recommendedAction).toBe("drop");
    expect(cursorRec?.monthlySavings).toBe(20);
    expect(copilotRec?.recommendedAction).toBe("keep");
  });

  // Test 5: When user has Claude Pro + Anthropic API direct both in stack → redundancy recommendation fires
  test("vendor redundancy recommendation for Claude + Anthropic API", () => {
    const formData: AuditFormData = {
      teamSize: 1,
      tools: [
        {
          toolId: "claude",
          planId: "claude-pro",
          seats: 1,
          monthlySpend: 20,
          primaryUseCase: "chat-debug",
        },
        {
          toolId: "anthropic-api",
          planId: "anthropic-api-direct",
          seats: 1,
          monthlySpend: 50,
          primaryUseCase: "api-integration",
        },
      ],
    };

    const result = runAudit(formData);
    const claudeRec = result.recommendations.find((r) => r.toolId === "claude");
    expect(claudeRec?.recommendedAction).toBe("drop");
    expect(claudeRec?.reasoning).toContain("API-equivalent usage");
  });

  // Test 6: When user has Anthropic API direct with monthlySpend = $500 → credexRelevant is true on that recommendation
  test("Credex relevance for high API spend", () => {
    const formData: AuditFormData = {
      teamSize: 1,
      tools: [
        {
          toolId: "anthropic-api",
          planId: "anthropic-api-direct",
          seats: 1,
          monthlySpend: 500,
          primaryUseCase: "api-integration",
        },
      ],
    };

    const result = runAudit(formData);
    const rec = result.recommendations.find((r) => r.toolId === "anthropic-api");
    expect(rec?.credexRelevant).toBe(true);
    expect(rec?.recommendedAction).toBe("use-credex");
  });

  // Test 7: When totalMonthlySavings > 500 → savingsTier equals "high"
  test("high savings tier classification", () => {
    const formData: AuditFormData = {
      teamSize: 1,
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-ultra",
          seats: 4,
          monthlySpend: 800, // 4 * 200
          primaryUseCase: "code-completion",
        },
      ],
    };
    // Result: 4 seats vs team size 1 = 3 excess seats = $600 savings
    const result = runAudit(formData);
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.savingsTier).toBe("high");
  });

  // Test 8: When all tools are on free plans → savingsTier equals "low" and totalMonthlySavings equals 0
  test("low savings tier for optimized stack", () => {
    const formData: AuditFormData = {
      teamSize: 1,
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-hobby",
          seats: 1,
          monthlySpend: 0,
          primaryUseCase: "code-completion",
        },
        {
          toolId: "claude",
          planId: "claude-free",
          seats: 1,
          monthlySpend: 0,
          primaryUseCase: "general",
        },
      ],
    };

    const result = runAudit(formData);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsTier).toBe("low");
  });
});
