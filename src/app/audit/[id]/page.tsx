import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuditResults from '@/components/AuditResults';
import { AuditResult } from '@/types';

// Opt out of static rendering for dynamic ID fetching
export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

/**
 * Dynamic Open Graph metadata for social sharing
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('audits')
    .select('total_monthly_savings, recommendations')
    .eq('id', params.id)
    .single();

  if (!data) return { title: 'Audit Not Found — SpendLens' };

  const savings = Number(data.total_monthly_savings);
  const topRecs = data.recommendations
    .slice(0, 2)
    .map((r: any) => r.toolName)
    .join(' and ');

  const title = `I could save $${savings}/month on AI tools — SpendLens`;
  const description = data.recommendations.length > 0 
    ? `My SpendLens audit found $${savings}/month in potential savings. Top optimizations for ${topRecs}.`
    : `I just audited my AI stack on SpendLens and found my subscriptions are perfectly optimized!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { id } = params;

  // Fetch the audit from Supabase
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Failed to fetch audit:', error);
    notFound();
  }

  // Strip sensitive info from public view
  const formData = { ...data.form_data };
  delete formData.companyName; // Remove company name if it exists

  const auditResult: AuditResult = {
    id: data.id,
    createdAt: data.created_at,
    formData,
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
