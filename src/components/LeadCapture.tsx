"use client";

import React, { useState } from 'react';
import { LeadInput } from '@/types';

interface LeadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string;
  savingsAmount: number;
}

export default function LeadCapture({ isOpen, onClose, auditId, savingsAmount }: LeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (website) {
      console.warn("Spam detected");
      setSubmitted(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: LeadInput = {
        email,
        company: companyName || undefined,
        role: role || undefined,
        auditId,
        savingsAmount,
        website, // Pass honeypot for server-side check
      };

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg glass-card-elevated overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 sm:p-10">
          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  Get the Full Report
                </h2>
                <p className="text-gray-200">
                  Enter your details to receive a detailed breakdown of your savings and a custom optimization plan.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Lead capture form">
                {/* Honeypot - Hidden */}
                <div className="hidden">
                  <label htmlFor="website-honeypot">Website</label>
                  <input
                    id="website-honeypot"
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5 ml-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-200 mb-1.5 ml-1">
                      Company Name
                    </label>
                    <input
                      id="company"
                      type="text"
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-200 mb-1.5 ml-1">
                      Role
                    </label>
                    <input
                      id="role"
                      type="text"
                      placeholder="CTO / Founder"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm mt-2 ml-1" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                  aria-label={loading ? "Submitting..." : "Send my detailed report"}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Loading..." />
                  ) : (
                    <>
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Send My Report
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8" role="status">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <svg aria-hidden="true" className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-3">
                Report Sent
              </h2>
              <p className="text-gray-200 mb-8 max-w-xs mx-auto">
                Check your inbox. We have sent the detailed audit report and next steps to {email}.
              </p>
              <button
                onClick={onClose}
                className="btn-secondary w-full"
                aria-label="Return to audit results"
              >
                Return to Audit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
