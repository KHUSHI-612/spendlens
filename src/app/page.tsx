"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SpendForm from "@/components/SpendForm";
import { AuditFormData } from "@/types";

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuditSubmit = async (formData: AuditFormData) => {
    setIsSubmitting(true);
    try {
      // POST the form data to /api/audit to run it securely and save it
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save audit result");
      }

      const data = await response.json();
      if (!data.id) throw new Error("No ID returned from server");

      // Redirect to /audit/[id]
      router.push(`/audit/${data.id}`);
    } catch (error) {
      console.error("Audit submission failed:", error);
      alert("Failed to run the audit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 pb-12 bg-black overflow-hidden z-0">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md border border-electric-500/30 bg-electric-500/10 mb-6 animate-fade-in">
            <svg className="w-4 h-4 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
            </svg>
            <span className="text-[10px] font-bold text-electric-400 uppercase tracking-[0.2em]">
              The Independent AI Tool Audit Platform
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-4 animate-fade-in-up">
            Cut through <span className="text-electric-500">AI hype.</span><br />
            Find what actually works.
          </h1>
          
          <p className="text-xl md:text-3xl text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in-up leading-relaxed font-bold tracking-tight">
            Free audit of your entire AI stack.<br />
            No login. No fluff. Just the numbers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up mt-0">
            <button
              onClick={() => document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-electric-500 hover:bg-electric-600 text-white text-lg font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-1"
            >
              Start Free Audit →
            </button>
          </div>
        </div>
      </section>

      {/* Logo Ticker Section */}
      <div className="py-12 overflow-hidden relative border-y border-white/5 bg-black min-h-[180px]">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] animate-fade-in">
            AUDITING TOOLS FROM LEADING AI PROVIDERS
          </p>
        </div>
        
        <div className="relative flex overflow-hidden">
          <div className="flex whitespace-nowrap animate-ticker-scroll py-4 will-change-transform">
            {[
              { name: "ChatGPT", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
              { name: "Claude", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
              { name: "Gemini", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
              { name: "Cursor", color: "text-white border-white/20 bg-white/10" },
              { name: "GitHub Copilot", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
              { name: "Windsurf", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" },
              { name: "OpenAI API", color: "text-green-400 border-green-400/30 bg-green-400/10" },
              { name: "Anthropic API", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
              // Repeat 2
              { name: "ChatGPT", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
              { name: "Claude", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
              { name: "Gemini", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
              { name: "Cursor", color: "text-white border-white/20 bg-white/10" },
              { name: "GitHub Copilot", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
              { name: "Windsurf", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" },
              { name: "OpenAI API", color: "text-green-400 border-green-400/30 bg-green-400/10" },
              { name: "Anthropic API", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
              // Repeat 3
              { name: "ChatGPT", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
              { name: "Claude", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
              { name: "Gemini", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
              { name: "Cursor", color: "text-white border-white/20 bg-white/10" },
              { name: "GitHub Copilot", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
              { name: "Windsurf", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" },
              { name: "OpenAI API", color: "text-green-400 border-green-400/30 bg-green-400/10" },
              { name: "Anthropic API", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
              // Repeat 4
              { name: "ChatGPT", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
              { name: "Claude", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
              { name: "Gemini", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
              { name: "Cursor", color: "text-white border-white/20 bg-white/10" },
              { name: "GitHub Copilot", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
              { name: "Windsurf", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" },
              { name: "OpenAI API", color: "text-green-400 border-green-400/30 bg-green-400/10" },
              { name: "Anthropic API", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" }
            ].map((tool, i) => (
              <div key={i} className="mx-6">
                <div className={`rounded-full border px-8 py-3 ${tool.color} font-bold text-base cursor-default transition-transform hover:scale-105 duration-300`}>
                  {tool.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx global>{`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker-scroll {
            animation: ticker-scroll 40s linear infinite;
          }
        `}</style>
      </div>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-black">
        <div className="w-full px-8 md:px-12 lg:px-16">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-8">
              Every dollar, zero waste.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We audit your entire AI infrastructure to find exactly where you&apos;re overpaying.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[
              {
                title: "Ghost Seats",
                description: "Identify licenses that are active but haven't been touched in 30 days. Reclaim thousands in unused subscriptions.",
                icon: (
                  <svg className="w-6 h-6 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              {
                title: "API Over-provisioning",
                description: "Find high-cost API keys with zero usage limits. Our audit catches potential runaway costs before they hit your bill.",
                icon: (
                  <svg className="w-6 h-6 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                )
              },
              {
                title: "Duplicate Tooling",
                description: "Teams often buy the same tools in silos. We map your entire stack to eliminate overlapping feature sets.",
                icon: (
                  <svg className="w-6 h-6 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: "Tier Misalignment",
                description: "Are you on an Enterprise plan but only using Pro features? We find the right tier for your actual usage volume.",
                icon: (
                  <svg className="w-6 h-6 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                title: "Real-Time Price Tracking",
                description: "AI tool pricing changes constantly. SpendLens monitors vendor pricing updates so recommendations are always current.",
                icon: (
                  <svg className="w-6 h-6 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Zero Vendor Bias",
                description: "We don't take money from AI vendors. Every recommendation is based purely on your usage and actual pricing data.",
                icon: (
                  <svg className="w-6 h-6 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div key={i} className="min-h-[220px] border border-white/10 border-t-2 border-t-electric-500/40 bg-white/5 rounded-3xl p-8 shadow-lg shadow-black/40 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 group">
                <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-electric-500/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-300 text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Form Section */}
      <section id="audit-form" className="py-24 bg-black relative">
        {/* Divider Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="w-full relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
              Audit Your Stack.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Enter your tools below. Get your savings report in 60 seconds.
            </p>
          </div>
          {isSubmitting ? (
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 border-4 border-electric-500/30 border-t-electric-500 rounded-full animate-spin mb-6" />
              <h2 className="text-2xl font-black text-white mb-2 italic">Running Audit...</h2>
              <p className="text-gray-400">Analyzing your stack against our pricing database.</p>
            </div>
          ) : (
            <SpendForm onSubmit={handleAuditSubmit} />
          )}
        </div>
      </section>
    </div>
  );
}
