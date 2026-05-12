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
    <div className="space-y-4 w-full animate-fade-in-up pb-12" role="region" aria-label="Audit Results Report">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 border-b border-white/10 pb-2">
        <div className="w-full lg:w-auto">
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter">Audit Report</h1>
            <Link 
              href="/" 
              className="lg:hidden text-[11px] font-black text-blue-400 uppercase tracking-widest border border-blue-400/30 px-4 py-2 rounded-xl bg-blue-400/5 active:scale-95 transition-all"
              aria-label="Start a new audit"
            >
              ← New
            </Link>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">ID: {result.id.slice(0, 8)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <Link 
            href="/" 
            className="hidden lg:flex px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-black rounded-lg transition-all items-center gap-2 active:scale-95"
            aria-label="Start a new audit"
          >
            ← New Audit
          </Link>
          <button 
            onClick={handleShare}
            className="flex-1 lg:flex-none px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black rounded transition-all flex items-center justify-center gap-2 active:scale-95"
            aria-label="Share audit results link"
          >
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="flex-1 lg:flex-none px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest"
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
      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-4 md:py-5 px-4 md:px-6 text-center shadow-2xl relative overflow-hidden group">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px] bg-emerald-500/5 blur-[40px] pointer-events-none rounded-full" />
        
        {result.totalMonthlySavings > 0 ? (
          <div className="relative z-10 animate-fade-in">
            <h2 className="text-gray-400 text-[10px] font-black mb-1.5 uppercase tracking-[0.3em]">Total Monthly Savings</h2>
            <div className="flex flex-col items-center">
              <div className="relative inline-block mb-1.5">
                <span className="text-white text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] leading-none">
                  <span className="text-emerald-400">$</span>{result.totalMonthlySavings}
                </span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-1.5 rounded-full mb-0">
                <span className="text-emerald-400 text-sm md:text-base font-black tracking-tight">
                  That&apos;s <span className="underline decoration-2 underline-offset-4">${result.totalAnnualSavings}</span>/year.
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
        <div className="relative bg-[#0d1117] rounded-lg p-4 md:p-6 border border-white/5 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-500/5 blur-[40px] -mr-15 -mt-15 rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <svg aria-hidden="true" className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h2 className="text-base font-black text-white tracking-tight uppercase">Executive Analysis</h2>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-1.5 bg-gray-900 border border-white/10 rounded-full w-fit shadow-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Intelligence Active</span>
            </div>
          </div>
          
          {isSummaryLoading ? (
            <div className="space-y-2.5 animate-pulse relative z-10" aria-label="Loading analysis...">
              <div className="h-2.5 bg-white/5 rounded w-full" />
              <div className="h-2.5 bg-white/5 rounded w-11/12" />
            </div>
          ) : (
            <div className="relative z-10 border-l-2 border-white/10 pl-4 md:pl-6">
              <p className="text-gray-200 text-sm md:text-base leading-relaxed italic font-bold tracking-tight whitespace-pre-line opacity-95">
                &quot;{summary || "Our AI is currently cross-referencing your tool stack with vendor pricing APIs to identify optimization gaps and feature overlaps."}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
 
      {/* Tool Breakdown Grid */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">Tool Breakdown</h3>
          <span className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">{result.recommendations.length} Analyzed</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" role="list">
          {result.recommendations.map((rec, idx) => {
            const styles = getActionStyles(rec.recommendedAction);
            return (
              <div 
                key={idx} 
                role="listitem"
                className={`border-l-2 ${styles.border} ${styles.bg} border-y border-r border-white/5 p-4 md:p-6 rounded-lg flex flex-col gap-3 md:gap-4 items-start shadow-2xl group hover:bg-white/[0.08] transition-all duration-500`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-3 mb-1 md:mb-2">
                    <h4 className="text-lg md:text-xl font-black text-white tracking-tighter">{rec.toolName}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles.tag}`}>
                      {getActionLabel(rec.recommendedAction)}
                    </span>
                  </div>
                  
                  <p className="text-gray-200 text-xs md:text-sm leading-relaxed font-bold tracking-tight mb-3 md:mb-4">
                    {rec.reasoning}
                  </p>
                </div>
 
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full pt-3 border-t border-white/10">
                  <div className="text-left">
                    <div className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Current</div>
                    <div className="text-lg md:text-xl font-black text-white tracking-tighter">${rec.currentSpend}<span className="text-[8px] font-bold opacity-30 ml-1">/MO</span></div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Savings</div>
                    {rec.credexSavingsRange ? (
                      <div className="text-lg md:text-xl font-black text-emerald-400 tracking-tighter">
                        ${rec.credexSavingsRange.min}-${rec.credexSavingsRange.max}<span className="text-[8px] font-bold opacity-50 ml-1">/MO</span>
                      </div>
                    ) : (
                      <div className={`text-lg md:text-xl font-black ${rec.monthlySavings > 0 ? 'text-emerald-400' : 'text-gray-500'} tracking-tighter`}>
                        ${rec.monthlySavings}<span className="text-[8px] font-bold opacity-50 ml-1">/MO</span>
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
