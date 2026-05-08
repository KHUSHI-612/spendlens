import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuditResults from '@/components/AuditResults';
import { AuditResult } from '@/types';

// Opt out of static rendering for dynamic ID fetching
export const dynamic = 'force-dynamic';

export default async function AuditPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch the audit from Supabase using the service role client
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Failed to fetch audit:', error);
    notFound(); // Triggers Next.js 404 page
  }

  // Reconstruct the AuditResult object for the UI component
  const auditResult: AuditResult = {
    id: data.id,
    createdAt: data.created_at,
    formData: data.form_data,
    recommendations: data.recommendations,
    totalMonthlySpend: Number(data.total_monthly_spend),
    totalMonthlySavings: Number(data.total_monthly_savings),
    totalAnnualSavings: Number(data.total_annual_savings),
    savingsTier: data.savings_tier,
    aiSummary: data.ai_summary,
  };

  return (
    <div className="min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <AuditResults result={auditResult} />
    </div>
  );
}
