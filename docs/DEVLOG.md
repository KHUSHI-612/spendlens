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
- Build LeadCapture.tsx modal + /api/lead route.
- Add Resend email confirmation for captured leads.
- Build /api/summary route with Groq for AI-generated executive summaries.
- Add Open Graph meta tags to /audit/[id] for rich link previews.
- Write 5 automated tests for the audit engine.
- Set up GitHub Actions CI pipeline.
