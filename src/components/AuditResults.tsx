"use client";

import React, { useState, useEffect } from 'react';
import { AuditResult, RecommendedAction } from '@/types';
import LeadCapture from './LeadCapture';

interface AuditResultsProps {
  result: AuditResult;
}

// Helper for card border colors based on recommendation
const getCardStyle = (action: RecommendedAction) => {
  switch (action) {
    case 'drop':
    case 'downgrade':
      return 'border-red-500/30 bg-red-950/20';
    case 'keep':
      return 'border-emerald-500/30 bg-emerald-950/20';
    case 'use-credex':
      return 'border-blue-500/30 bg-blue-950/20';
    case 'switch-plan':
      return 'border-yellow-500/30 bg-yellow-950/20';
    default:
      return 'border-gray-800 bg-gray-900';
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

const getActionColor = (action: RecommendedAction) => {
  switch (action) {
    case 'drop':
    case 'downgrade':
      return 'text-red-400 bg-red-500/10 border border-red-500/20';
    case 'keep':
      return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    case 'use-credex':
      return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
    case 'switch-plan':
      return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border border-gray-500/20';
  }
};

export default function AuditResults({ result }: AuditResultsProps) {
  const [copied, setCopied] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Automatically show modal after 5 seconds if not already shown/interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeadModalOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fade-in-up">
      
      {/* Top Actions: Share & Email */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-display font-bold text-white">Your Audit Results</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="px-5 py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            {copied ? 'Link Copied!' : 'Share Results'}
          </button>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Get Full Report via Email
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
        
        <h2 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-[0.2em] relative z-10">
          Potential Impact
        </h2>
        
        <div className="relative z-10">
          {result.totalMonthlySavings > 0 ? (
            <div className="mb-6">
              <span className="text-white text-4xl sm:text-6xl font-display font-bold block mb-4">
                You could save <span className="text-emerald-400">${result.totalMonthlySavings}</span>/month
              </span>
              <span className="text-gray-400 text-xl block font-medium">
                That is <span className="text-emerald-400 font-bold">${result.totalAnnualSavings}</span>/year in wasted spend.
              </span>
            </div>
          ) : (
            <div className="mb-6">
              <span className="text-white text-4xl sm:text-5xl font-display font-bold block mb-4">
                Your stack is well-optimized
              </span>
              <span className="text-gray-400 text-xl block font-medium">
                We found $0 in wasted spend. Great job managing your licenses!
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Conditionals */}
        {result.totalMonthlySavings > 500 && (
          <div className="mt-10 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-8 max-w-3xl mx-auto relative z-10 shadow-lg">
            <h3 className="text-emerald-400 font-bold text-xl mb-3 flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              High Volume Spend Detected
            </h3>
            <p className="text-emerald-100/70 mb-6 text-base leading-relaxed max-w-2xl mx-auto">
              Because your savings potential exceeds $500/month, you qualify for custom enterprise negotiation via Credex. We can handle the contract negotiations on your behalf and guarantee these savings.
            </p>
            <button 
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-8 py-3.5 rounded-xl w-full sm:w-auto transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
            >
              Claim Guaranteed Savings
            </button>
          </div>
        )}

        {result.totalMonthlySavings < 100 && result.totalMonthlySavings > 0 && (
          <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 max-w-2xl mx-auto relative z-10">
            <h3 className="text-white font-semibold text-lg mb-1">You&apos;re spending well!</h3>
            <p className="text-gray-400 text-sm">
              While we found a few minor optimizations, your overall stack is lean. Review the small tweaks below.
            </p>
          </div>
        )}
      </div>

      {/* Per-tool Cards */}
      <div className="pt-4">
        <h3 className="text-xl font-display font-semibold text-white mb-6 px-2">Tool Breakdown</h3>
        <div className="space-y-4">
          {result.recommendations.map((rec, idx) => (
            <div 
              key={idx} 
              className={`border p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center shadow-lg transition-colors ${getCardStyle(rec.recommendedAction)}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h4 className="text-xl font-bold text-white">{rec.toolName}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getActionColor(rec.recommendedAction)}`}>
                    {getActionLabel(rec.recommendedAction)}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
                  {rec.reasoning}
                </p>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-3 pt-6 border-t border-gray-800 md:border-t-0 md:pt-0 shrink-0 min-w-[180px]">
                <div className="text-left md:text-right">
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Current Spend</div>
                  <div className="text-lg font-semibold text-gray-300">${rec.currentSpend}/mo</div>
                </div>
                
                <div className="text-right">
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Potential Savings</div>
                  {rec.credexSavingsRange ? (
                    <div className="text-2xl font-bold text-emerald-400">
                      ${rec.credexSavingsRange.min} - ${rec.credexSavingsRange.max}
                      <span className="text-sm font-medium text-emerald-500/70 ml-1">/mo</span>
                    </div>
                  ) : (
                    <div className={`text-2xl font-bold ${rec.monthlySavings > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                      ${rec.monthlySavings}
                      <span className={`text-sm font-medium ml-1 ${rec.monthlySavings > 0 ? 'text-emerald-500/70' : 'text-gray-600'}`}>/mo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>

    <LeadCapture 
      isOpen={isLeadModalOpen} 
      onClose={() => setIsLeadModalOpen(false)} 
      auditId={result.id}
    />
  </div>
);
}
