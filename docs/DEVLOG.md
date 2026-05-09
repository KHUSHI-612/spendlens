# Development Log — SpendLens

## Day 1 — 2025-05-07

**Hours worked:** 3

**What I did:**
- Initialized Next.js 14 project with TypeScript and Tailwind CSS.
- Defined core types and data structures for the audit system.
- Populated the tools database with verified pricing for 8 major AI tools.
- Implemented the full Audit Engine logic with 6 deterministic rules (team downgrade, overlaps, free tier, Credex API, etc.).
- Created the initial premium dark-mode landing page layout.
- Set up environment variable structure and GitHub repository.
- Deployed initial skeleton to Vercel.

**What I learned:**
- Deterministic logic for tool overlaps requires a clear mapping of primary use cases to avoid false positives.
- Keeping the audit engine pure makes it extremely easy to test and verify without API costs.

**Blockers / what I'm stuck on:**
- None currently. Moving to form development next.

**Plan for tomorrow:**
- Build the SpendForm component to capture user tool data.
- Implement localStorage persistence for the form.
- Start building the Results UI.

## Day 2 — 2026-05-08

**Hours worked:** 3.5

**What I did:**
- Built SpendForm.tsx with localStorage persistence and dynamic spend calculation.
- Built AuditResults.tsx with conditional Credex CTA (shows prominently when savings exceed $500/month, shows "You're spending well" for savings under $100).
- Set up Supabase tables (audits + leads) with Row Level Security policies.
- Built /api/audit route that runs the audit engine server-side, saves the full result to Supabase, and returns a UUID.
- Built /audit/[id] shareable results page that fetches audit data from Supabase and renders per-tool recommendation cards with color-coded actions.
- Wired everything end to end: form submits, audit runs on the server, results are persisted, and the URL is shareable.
- Fixed Vercel build errors and configured environment variables for production deployment.

**What I learned:**
- Next.js App Router API routes handle POST differently than Pages Router. Must use NextResponse.json() and export named HTTP method functions.
- Supabase RLS policies need to be set explicitly. Without them, inserts fail silently even with the service role key when RLS is enabled on the table.
- localStorage hydration can cause React mismatch errors in Next.js due to server-side rendering. Fixed with an isLoaded state flag that delays rendering until the client has loaded persisted data.
- Vercel pre-renders API routes during build time, so environment variables must be present in the Vercel dashboard before building, not just in local .env.

**Blockers / what I'm stuck on:**
- Vercel deployment initially failed because the build process pre-renders server components and API routes at compile time. Since the Supabase environment variables were not yet configured in the Vercel dashboard, the createClient() call threw "supabaseUrl is required" during the build step. Resolved by adding all environment variables to Vercel project settings and redeploying.

**Plan for tomorrow:**
- Write 5 automated tests for the audit engine.
- Set up GitHub Actions CI pipeline.

## Day 3 — 2026-05-09

**Hours worked:** 2

**What I did:**
- Built LeadCapture.tsx modal with honeypot spam protection and premium dark-mode styling.
- Implemented /api/lead route with rate limiting (1 submission per hour per email) and Supabase integration.
- Integrated Resend for automated email reports and lead notifications.
- Built /api/summary route using Groq (llama-3.3-70b-versatile) for AI-generated executive summaries with deterministic fallback logic.
- Implemented dynamic Open Graph metadata and Twitter card tags for shareable audit results.
- Hardened privacy by stripping sensitive company identifiers from public audit result views.

**What I learned:**
- Resend's free tier has strict security requirements for non-verified domains, which impacts end-to-end testing with external email addresses.
- Rate limiting at the API level is essential for protecting database integrity and preventing notification spam.
- Standardizing on an OpenAI-compatible SDK for Groq makes switching AI providers trivial.

**Known Limitation — Resend Email**
Resend free tier only sends to the account owner's email until a custom domain is verified. For this demo, email delivery is functional but scoped to verified addresses. Production fix: verify a custom domain in Resend dashboard. The email template, API route, and lead capture logic are all production-ready.
