import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runAudit } from '@/lib/auditEngine';
import { AuditFormData } from '@/types';

export async function POST(request: Request) {
  try {
    const formData: AuditFormData = await request.json();

    if (!formData || !formData.tools || !Array.isArray(formData.tools)) {
      return NextResponse.json({ error: 'Invalid form data provided' }, { status: 400 });
    }

    // 1. Run the audit logic securely on the server
    const auditResult = runAudit(formData);

    // 2. Save the full result to the Supabase "audits" table
    const { data, error } = await supabase
      .from('audits')
      .insert([
        {
          id: auditResult.id,
          form_data: auditResult.formData,
          recommendations: auditResult.recommendations,
          total_monthly_spend: auditResult.totalMonthlySpend,
          total_monthly_savings: auditResult.totalMonthlySavings,
          total_annual_savings: auditResult.totalAnnualSavings,
          savings_tier: auditResult.savingsTier,
          ai_summary: auditResult.aiSummary || null,
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Even if DB fails, we can optionally return the ID so the user can see it locally, 
      // but returning 500 is more standard for API failure.
      return NextResponse.json({ error: 'Failed to save audit result to database' }, { status: 500 });
    }

    // 3. Return the UUID
    return NextResponse.json({ id: data.id }, { status: 200 });

  } catch (error) {
    console.error('Audit POST handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
