import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AuditResult } from '@/types';

// Initialize OpenAI client configured for Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Deterministic fallback if the AI fails
 */
function generateFallbackSummary(result: AuditResult): string {
  const savings = result.totalMonthlySavings;
  const toolCount = result.recommendations.length;
  
  if (savings > 500) {
    return `Your audit revealed significant waste in your stack. With $${savings}/month in potential savings across ${toolCount} tools, you are a prime candidate for enterprise-level negotiation. We recommend immediate action on high-cost overlaps to reclaim your budget.`;
  } else if (savings > 0) {
    return `We found several opportunities to lean out your AI spend. By optimizing your ${toolCount} tool subscriptions, you could save approximately $${savings} per month. Most of these involve downgrading underutilized tiers or switching to more cost-effective alternatives.`;
  } else {
    return `Great job! Your current AI stack is perfectly optimized. We found zero wasted spend across your ${toolCount} tools. Keep maintaining this lean approach to ensure your margins remain healthy as you scale.`;
  }
}

export async function POST(request: Request) {
  try {
    const result: AuditResult = await request.json();

    if (!result || !result.recommendations) {
      return NextResponse.json({ summary: 'No audit data provided' }, { status: 400 });
    }

    // Prepare context for the AI
    const toolDetails = result.recommendations
      .map(r => `- ${r.toolName}: Current $${r.currentSpend}/mo. Action: ${r.recommendedAction}. Saving: $${r.monthlySavings}/mo. Reason: ${r.reasoning}`)
      .join('\n');

    const prompt = `
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
    `;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a CFO-level SaaS consultant. You provide high-impact, data-driven executive summaries for software audits.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      const summary = response.choices[0]?.message?.content?.trim();

      if (!summary) {
        throw new Error('AI returned empty response');
      }

      return NextResponse.json({ summary }, { status: 200 });

    } catch (aiError) {
      console.error('Groq API Error:', aiError);
      // Fallback to deterministic summary if AI fails
      return NextResponse.json({ summary: generateFallbackSummary(result) }, { status: 200 });
    }

  } catch (error) {
    console.error('Summary API Error:', error);
    // Never throw, return a generic fallback as a last resort
    return NextResponse.json({ 
      summary: 'Your audit is complete. We found potential optimizations in your AI stack that could reduce your monthly burn. Review the breakdown below for specific tool-by-tool recommendations.' 
    }, { status: 200 });
  }
}
