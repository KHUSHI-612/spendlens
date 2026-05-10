"use client";

import React, { useState, useEffect } from 'react';
import { AuditResult, RecommendedAction } from '@/types';
import LeadCapture from './LeadCapture';

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
        tag: 'text-red-400 bg-red-500/10 border-red-500/20'
      };
    case 'keep':
      return {
        border: 'border-l-emerald-500 border-emerald-500/10',
        bg: 'bg-emerald-950/10',
        tag: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      };
    case 'use-credex':
      return {
        border: 'border-l-blue-500 border-blue-500/10',
        bg: 'bg-blue-950/10',
        tag: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      };
    case 'switch-plan':
      return {
        border: 'border-l-yellow-500 border-yellow-500/10',
        bg: 'bg-yellow-950/10',
        tag: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      };
    default:
      return {
        border: 'border-l-gray-500 border-gray-800',
        bg: 'bg-gray-900',
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
    // Automatically show modal after 8 seconds
    const timer = setTimeout(() => {
      setIsLeadModalOpen(true);
    }, 8000);

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

    return () => clearTimeout(timer);
  }, [result, result.id, result.aiSummary]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12 w-full px-8 md:px-16 lg:px-24 animate-fade-in-up pb-24">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-10 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Audit Report</h1>
          <p className="text-gray-500 text-base mt-1 font-bold uppercase tracking-widest">Audit ID: {result.id.slice(0, 12)}</p>
        </div>
        <div className="flex items-center gap-4 pb-1">
          <button 
            onClick={handleShare}
            className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-lg font-bold rounded-2xl transition-all flex items-center gap-3 active:scale-95 shadow-xl"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            {copied ? 'Link Copied!' : 'Share Results'}
          </button>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg font-black rounded-2xl transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 uppercase tracking-widest"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Full Report
          </button>
        </div>
      </div>

      {/* High-Impact Hero Section */}
      <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-10 md:py-16 px-12 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
        
        {result.totalMonthlySavings > 0 ? (
          <div className="relative z-10 animate-fade-in">
            <h2 className="text-gray-500 text-[10px] md:text-xs font-black mb-6 uppercase tracking-[0.5em]">
              TOTAL MONTHLY SAVINGS FOUND
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative inline-block mb-4">
                <span className="text-white text-7xl md:text-8xl font-black tracking-tighter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] leading-none">
                  <span className="text-emerald-400">$</span>{result.totalMonthlySavings}
                </span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-2.5 rounded-full mb-8">
                <span className="text-emerald-400 text-lg md:text-xl font-bold italic">
                  That&apos;s <span className="font-black underline underline-offset-4 decoration-2">${result.totalAnnualSavings}</span> per year.
                </span>
              </div>
            </div>
            
            {result.totalMonthlySavings > 500 && (
              <div className="mt-8 bg-emerald-950/20 border border-emerald-500/10 rounded-3xl p-8 w-full max-w-3xl mx-auto backdrop-blur-md">
                <h3 className="text-emerald-400 font-black text-xl mb-3 flex items-center justify-center gap-3 uppercase tracking-wider">
                  <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Qualifies for Enterprise Savings
                </h3>
                <p className="text-emerald-100/60 mb-6 text-base leading-relaxed max-w-xl mx-auto">
                  Your spend profile qualifies for high-volume contract negotiation. Credex can guarantee these savings through managed procurement.
                </p>
                <button 
                  onClick={() => setIsLeadModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-3.5 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 text-lg uppercase tracking-widest"
                >
                  Claim Guaranteed Savings
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 py-12 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
              <svg aria-hidden="true" className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-white text-5xl md:text-6xl font-black tracking-tight mb-4">
              Stack Optimized
            </h2>
            <p className="text-gray-400 text-xl max-w-xl mx-auto font-medium">
              We found $0 in wasted spend. Your tool selection and licensing are currently perfect.
            </p>
          </div>
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="relative group">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 rounded-[3rem] opacity-30 group-hover:opacity-50 transition-opacity blur-[4px]" />
        <div className="relative bg-gray-950 rounded-[3rem] p-12 md:p-14 border border-white/5 overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <svg aria-hidden="true" className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">Executive Analysis</h3>
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Intelligence Active</span>
            </div>
          </div>
          
          {isSummaryLoading ? (
            <div className="space-y-6 animate-pulse relative z-10">
              <div className="h-5 bg-white/5 rounded w-full" />
              <div className="h-5 bg-white/5 rounded w-5/6" />
              <div className="h-5 bg-white/5 rounded w-4/6" />
            </div>
          ) : (
            <div className="relative z-10">
              <p className="text-gray-200 text-xl md:text-2xl leading-relaxed font-medium max-w-5xl italic opacity-90 border-l-4 border-blue-500/30 pl-8">
                &quot;{summary || "Our AI is currently cross-referencing your tool stack with vendor pricing APIs to identify optimization gaps and feature overlaps. Review the detailed tool breakdown below for immediate executive action items."}&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Per-tool Cards Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-2xl font-black text-white tracking-tight">Tool Breakdown</h3>
          <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">{result.recommendations.length} Tools Analyzed</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {result.recommendations.map((rec, idx) => {
            const styles = getActionStyles(rec.recommendedAction);
            return (
              <div 
                key={idx} 
                className={`border-l-4 ${styles.border} ${styles.bg} border-y border-r border-white/5 p-8 md:p-10 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center shadow-lg backdrop-blur-sm group hover:bg-white/[0.08] transition-all`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h4 className="text-2xl font-black text-white tracking-tighter">{rec.toolName}</h4>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-md ${styles.tag}`}>
                      {getActionLabel(rec.recommendedAction)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-4xl font-medium">
                    {rec.reasoning}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-8 md:gap-4 pt-6 border-t border-white/5 md:border-t-0 md:pt-0 shrink-0 min-w-[240px]">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Current Spend</div>
                    <div className="text-xl font-black text-white">${rec.currentSpend}<span className="text-[10px] font-bold opacity-30 ml-1">/MO</span></div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Potential Savings</div>
                    {rec.credexSavingsRange ? (
                      <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                        ${rec.credexSavingsRange.min} - ${rec.credexSavingsRange.max}
                        <span className="text-[10px] font-bold text-emerald-500/40 ml-1 tracking-widest">/MO</span>
                      </div>
                    ) : (
                      <div className={`text-3xl font-black ${rec.monthlySavings > 0 ? 'text-emerald-400' : 'text-gray-700'}`}>
                        ${rec.monthlySavings}
                        <span className={`text-[10px] font-bold ml-1 tracking-widest ${rec.monthlySavings > 0 ? 'text-emerald-500/40' : 'text-gray-800'}`}>/MO</span>
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
