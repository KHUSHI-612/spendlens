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
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-credex-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-electric-400 font-medium">
                Free audit — no login required
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
              Stop Overpaying
              <br />
              <span className="gradient-text">for AI Tools</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up leading-relaxed">
              Audit your team&apos;s AI spending in 60 seconds. Get personalized
              recommendations and discover how much you can save.
            </p>

            <div className="animate-fade-in-up">
              <a href="#audit-form" className="btn-primary text-lg px-8 py-4">
                Start Free Audit →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Form Section */}
      <section
        id="audit-form"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        {isSubmitting ? (
          <div className="bg-gray-900 border border-gray-800 p-8 sm:p-12 rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-6" aria-label="Loading..." />
            <h2 className="text-2xl font-display font-semibold text-white mb-2">
              Running Audit...
            </h2>
            <p className="text-gray-300">
              Analyzing your stack against our pricing database.
            </p>
          </div>
        ) : (
          <SpendForm onSubmit={handleAuditSubmit} />
        )}
      </section>
    </div>
  );
}
