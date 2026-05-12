"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AuditResult, RecommendedAction } from '@/types';

const LeadCapture = dynamic(() => import('./LeadCapture'), {
  ssr: false,
});

interface AuditResultsProps {
  result: AuditResult;
}

// Helper for card colors based on recommendation
const getActionStyles = (action: RecommendedAction) => {
  switch (action) {
    case 'drop':
    case 'downgrade':
      return {
        border: 'border-l-red-500 border-red-500/10',
        bg: 'bg-red-950/10',
        text: 'text-red-400',
        tag: 'text-red-400 bg-red-500/10 border-red-500/20'
      };
    case 'keep':
      return {
        border: 'border-l-emerald-500 border-emerald-500/10',
        bg: 'bg-emerald-950/10',
        text: 'text-emerald-400',
        tag: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      };
    case 'use-credex':
      return {
        border: 'border-l-blue-500 border-blue-500/10',
        bg: 'bg-blue-950/10',
        text: 'text-blue-400',
        tag: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      };
    case 'switch-plan':
      return {
        border: 'border-l-yellow-500 border-yellow-500/10',
        bg: 'bg-yellow-950/10',
        text: 'text-yellow-400',
        tag: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      };
    default:
      return {
        border: 'border-l-gray-500 border-gray-800',
        bg: 'bg-gray-900',
        text: 'text-gray-400',
        tag: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      };
  }
};

const getActionLabel = (action: RecommendedAction) => {
  switch (action) {
    case 'drop': return 'Drop Tool';
    case 'downgrade': return 'Downgrade Plan';
    case 'keep': return 'Keep Plan';
    case 'switch-plan': return 'Switch Plan';
    case 'use-credex': return 'Use Credex API';
    default: return 'Review';
  }
};

export default function AuditResults({ result }: AuditResultsProps) {
  const [copied, setCopied] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(result.aiSummary || null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(!result.aiSummary);

  useEffect(() => {
    // Fetch AI summary if not provided
    if (!result.aiSummary) {
      const fetchSummary = async () => {
        try {
          const res = await fetch('/api/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
          });
          if (res.ok) {
            const data = await res.json();
            setSummary(data.summary);
          }
        } catch (error) {
          console.error('Failed to fetch summary:', error);
        } finally {
          setIsSummaryLoading(false);
        }
      };
      fetchSummary();
    }
  }, [result, result.id, result.aiSummary]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12 md:space-y-20 w-full animate-fade-in-up pb-24" role="region" aria-label="Audit Results Report">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-12 border-b border-white/10 pb-10">
        <div className="w-full lg:w-auto">
          <div className="flex items-center justify-between lg:justify-start gap-6 mb-3">
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter">Audit Report</h1>
            <Link 
              href="/" 
              className="lg:hidden text-[11px] font-black text-blue-400 uppercase tracking-widest border border-blue-400/30 px-4 py-2 rounded-xl bg-blue-400/5 active:scale-95 transition-all"
              aria-label="Start a new audit"
            >
              ← New
            </Link>
          </div>
          <p className="text-gray-400 text-sm md:text-lg font-bold uppercase tracking-[0.4em]">Audit ID: {result.id.slice(0, 12)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <Link 
            href="/" 
            className="hidden lg:flex px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xl font-black rounded-2xl transition-all items-center gap-3 active:scale-95 shadow-xl"
            aria-label="Start a new audit"
          >
            ← New Audit
          </Link>
          <button 
            onClick={handleShare}
            className="flex-1 lg:flex-none px-8 md:px-12 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-lg md:text-xl font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
            aria-label="Share audit results link"
          >
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="flex-1 lg:flex-none px-10 md:px-16 py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg md:text-xl font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-95 uppercase tracking-widest"
            aria-label="View the full expert report"
          >
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Full Report
          </button>
        </div>
      </div>
 
      {/* Hero Savings View */}
      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-12 md:py-16 px-12 md:px-20 text-center shadow-2xl relative overflow-hidden group">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />
        
        {result.totalMonthlySavings > 0 ? (
          <div className="relative z-10 animate-fade-in">
            <h2 className="text-gray-400 text-[10px] md:text-xs font-black mb-6 md:mb-8 uppercase tracking-[0.4em] md:tracking-[0.6em]">Total Monthly Savings Found</h2>
            <div className="flex flex-col items-center">
              <div className="relative inline-block mb-6">
                <span className="text-white text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter drop-shadow-[0_0_40px_rgba(16,185,129,0.25)] leading-none">
                  <span className="text-emerald-400">$</span>{result.totalMonthlySavings}
                </span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 md:px-10 py-2 md:py-3 rounded-full mb-0 italic">
                <span className="text-emerald-400 text-sm md:text-lg font-bold tracking-tight">
                  That&apos;s <span className="underline decoration-2 underline-offset-4">${result.totalAnnualSavings}</span> per year.
                </span>
              </div>
            </div>
            
            {result.totalMonthlySavings > 500 && (
              <div className="mt-12 bg-emerald-950/20 border border-emerald-500/10 rounded-[2rem] p-10 w-full backdrop-blur-md">
                <h3 className="text-emerald-400 font-black text-xl md:text-2xl mb-4 flex items-center justify-center gap-4 uppercase tracking-widest">
                  <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Enterprise Opportunity
                </h3>
                <p className="text-emerald-100/70 mb-8 text-lg leading-relaxed max-w-3xl mx-auto">
                  Your spend profile qualifies for high-volume contract negotiation. Credex can guarantee these savings.
                </p>
                <button 
                  onClick={() => setIsLeadModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 text-lg uppercase tracking-widest"
                >
                  Unlock with Credex
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 animate-fade-in py-8 md:py-12">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
              <svg aria-hidden="true" className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Your Stack is Optimized</h2>
            <p className="text-gray-300 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
              We couldn&apos;t find any immediate waste. You are already spending well!
            </p>
          </div>
        )}
      </div>
 
      {/* AI Intelligence Feed */}
      <div className="relative">
        <div className="relative bg-[#0d1117] rounded-[2rem] p-10 md:p-16 border border-white/5 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] -mr-48 -mt-48 rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 md:mb-12 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <svg aria-hidden="true" className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Executive Analysis</h2>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-1.5 bg-gray-900 border border-white/10 rounded-full w-fit shadow-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Intelligence Active</span>
            </div>
          </div>
          
          {isSummaryLoading ? (
            <div className="space-y-6 animate-pulse relative z-10" aria-label="Loading analysis...">
              <div className="h-5 bg-white/5 rounded w-full" />
              <div className="h-5 bg-white/5 rounded w-11/12" />
              <div className="h-5 bg-white/5 rounded w-10/12" />
            </div>
          ) : (
            <div className="relative z-10 border-l-2 border-white/10 pl-8 md:pl-12">
              <p className="text-gray-200 text-lg md:text-2xl leading-relaxed italic font-medium tracking-tight whitespace-pre-line opacity-90">
                &quot;{summary || "Our AI is currently cross-referencing your tool stack with vendor pricing APIs to identify optimization gaps and feature overlaps."}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
 
      {/* Tool Breakdown Grid */}
      <div className="space-y-10 md:space-y-16">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">Tool Breakdown</h3>
          <span className="text-gray-400 text-xs md:text-lg font-bold uppercase tracking-[0.3em]">{result.recommendations.length} Tools Analyzed</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" role="list">
          {result.recommendations.map((rec, idx) => {
            const styles = getActionStyles(rec.recommendedAction);
            return (
              <div 
                key={idx} 
                role="listitem"
                className={`border-l-8 ${styles.border} ${styles.bg} border-y border-r border-white/5 p-8 md:p-14 rounded-[2.5rem] flex flex-col gap-8 md:gap-10 items-start shadow-2xl group hover:bg-white/[0.08] transition-all duration-500`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
                    <h4 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{rec.toolName}</h4>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border ${styles.tag}`}>
                      {getActionLabel(rec.recommendedAction)}
                    </span>
                  </div>
                  
                  <p className="text-gray-200 text-lg md:text-2xl leading-relaxed font-bold tracking-tight mb-10 md:mb-12">
                    {rec.reasoning}
                  </p>
                </div>
 
                <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 w-full pt-10 border-t border-white/10">
                  <div className="text-left">
                    <div className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] mb-2">Current Spend</div>
                    <div className="text-3xl md:text-5xl font-black text-white tracking-tighter">${rec.currentSpend}<span className="text-xs font-bold opacity-30 ml-2">/MO</span></div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] mb-2">Potential Savings</div>
                    {rec.credexSavingsRange ? (
                      <div className="text-3xl md:text-5xl font-black text-emerald-400 tracking-tighter">
                        ${rec.credexSavingsRange.min}-${rec.credexSavingsRange.max}<span className="text-xs font-bold opacity-50 ml-2">/MO</span>
                      </div>
                    ) : (
                      <div className={`text-3xl md:text-5xl font-black ${rec.monthlySavings > 0 ? 'text-emerald-400' : 'text-gray-500'} tracking-tighter`}>
                        ${rec.monthlySavings}<span className="text-xs font-bold opacity-50 ml-2">/MO</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
 
      <LeadCapture 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)} 
        auditId={result.id}
        savingsAmount={result.totalMonthlySavings}
      />
    </div>
  );
}
