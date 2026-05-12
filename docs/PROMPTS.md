# SpendLens Prompts Library

## AI Summary Prompt

### Model
Groq API - llama-3.3-70b-versatile
(OpenAI-compatible, free tier, same architecture as Anthropic integration)

### Prompt

```text
As a SaaS cost optimization expert, write a personalized executive summary for this AI stack audit.

STATS:
- Total Monthly Savings: $${result.totalMonthlySavings}
- Total Annual Savings: $${result.totalAnnualSavings}
- Savings Tier: ${result.savingsTier}

TOOL BREAKDOWN:
${toolDetails}

REQUIREMENTS:
- Length: Exactly ~100 words.
- Tone: Professional, authoritative, and direct.
- Format: Single paragraph.
- Focus on the "why" and the next big step.
- No emojis.
- Avoid generic advice; use the specific numbers provided.
```

### Why this prompt works
It provides strict structural constraints (exact word count and format) while grounding the AI in a high-authority "CFO" persona. This ensures the output is both data-driven and actionable without fluff.

### What didn't work
Implicit length constraints led to inconsistent results where the summary was either a single sentence or a long essay. Explicitly specifying the ~100-word count was necessary to maintain a consistent UI layout on the results page.

## Note on Model Choice

The assignment recommends Anthropic API. I used Groq (llama-3.3-70b-versatile) as a free alternative since Anthropic requires paid credits. 

Groq's API is fully OpenAI-compatible. Swapping back to Anthropic requires exactly two changes:
1. Change baseURL from https://api.groq.com/openai/v1 to https://api.anthropic.com
2. Change model name to claude-sonnet-4-6

The fallback logic, prompt structure, and everything else is identical.
