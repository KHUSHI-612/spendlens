# SpendLens — AI Tool Spending Audit

SpendLens is a free web app that audits AI tool spending for startup engineering teams. It analyzes your stack (Cursor, Copilot, Claude, ChatGPT, etc.), detects plan mismatches and tool overlaps, and surfaces exact dollar savings . Built for engineering managers and founders who are spending $500–$5,000/mo on AI tools and have no idea if they're getting value.

> **🔗 Live:** [https://spendlens.vercel.app](https://spendlens.vercel.app)

---

## Screenshots

<!-- TODO: Add 3+ screenshots after UI is complete -->
<!-- ![Landing Page](docs/screenshots/landing.png) -->
<!-- ![Audit Results](docs/screenshots/results.png) -->
<!-- ![Mobile View](docs/screenshots/mobile.png) -->

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Install & Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/spendlens.git
cd spendlens
npm install
cp .env.local.example .env.local   # fill in your API keys
npm run dev                        # → http://localhost:3000
```

### Run Tests

```bash
npm test
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or connect the GitHub repo to [Vercel Dashboard](https://vercel.com) for auto-deploys.

---

## Decisions — 5 Trade-offs I Made

### 1. Pure logic audit engine vs. LLM-powered analysis
**Chose:** Hardcoded rules in `auditEngine.ts` with zero AI.
**Why:** Deterministic results are testable, reproducible, and free. An LLM might give more nuanced advice, but it would add latency, cost ~$0.01/audit, and make testing nearly impossible. The rules cover the 80% case. Claude is used only for a 100-word summary enhancement — the audit works perfectly without it.

### 2. No authentication — email captured after value is shown
**Chose:** No login wall. Full results shown before asking for email.
**Why:** Every login wall kills conversion. The user needs to trust the tool before giving us their email. By showing $X in savings first, the email capture becomes a natural next step ("Save my report") rather than a gate. This also means the form can be shared virally without friction.
**Trade-off:** We can't track returning users or build profiles. Worth it for a lead-gen tool.

### 3. JSONB columns for form data and recommendations in Supabase
**Chose:** Store entire audit payload as JSONB rather than normalized tables.
**Why:** An audit is a point-in-time snapshot. If tool pricing changes next week, existing audits should still show the original analysis. Normalizing into `tool_entries`, `recommendations`, etc. would add 4 tables and complex joins for no practical benefit. The downside: can't do SQL queries like "how many users are on Cursor Business." For an MVP, that's fine — we can parse JSONB in application code or migrate later.

### 4. Client-side localStorage for form persistence vs. server-side drafts
**Chose:** `localStorage` saves form state on every keystroke.
**Why:** Zero backend calls during form filling. No auth needed. User closes tab, comes back, form is intact. Server-side drafts would require session management and add complexity.
**Trade-off:** No cross-device sync. A user can't start on phone and finish on laptop. Acceptable for a tool that takes 60 seconds.

### 5. Tailwind CSS v3 instead of v4
**Chose:** Tailwind v3 (stable) over v4 (newer).
**Why:** v4 has breaking changes in config format and plugin API. Next.js 14 has better-tested compatibility with v3. The glassmorphism utilities, custom animations, and dark theme all work reliably. Upgrading to v4 later is straightforward but not worth the risk for a deadline-driven project.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: nav, fonts, meta tags
│   ├── page.tsx                # Landing page with hero + audit form
│   ├── globals.css             # Design system (Tailwind + custom utilities)
│   ├── audit/[id]/page.tsx     # Shareable audit results page
│   └── api/
│       ├── audit/route.ts      # POST: run audit  |  GET: fetch by ID
│       ├── summary/route.ts    # POST: Anthropic Claude AI summary
│       └── lead/route.ts       # POST: email capture + Resend email
├── components/
│   ├── SpendForm.tsx           # Interactive multi-tool spending form
│   ├── AuditResults.tsx        # Results cards + savings display
│   ├── LeadCapture.tsx         # Email capture (post-results)
│   └── ShareButton.tsx         # Shareable URL + social buttons
├── lib/
│   ├── auditEngine.ts          # Core audit logic (pure functions, no AI)
│   ├── tools.ts                # Tool & plan pricing database
│   └── supabase.ts             # Supabase client
└── types/
    └── index.ts                # TypeScript interfaces

__tests__/
└── auditEngine.test.ts         # 8 unit tests for audit engine

docs/                           # Assignment documentation
├── PRICING_DATA.md
├── ARCHITECTURE.md
├── DEVLOG.md
├── REFLECTION.md
├── TESTS.md
├── PROMPTS.md
├── GTM.md
├── ECONOMICS.md
├── USER_INTERVIEWS.md
├── LANDING_COPY.md
└── METRICS.md
```

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Server components for OG tags, API routes collocated, Vercel-native |
| Language | TypeScript | Type safety across form data → engine → API → DB |
| Styling | Tailwind CSS v3 | Rapid iteration, design tokens, dark mode built-in |
| Database | Supabase (PostgreSQL) | Free tier, instant setup, JSONB support, Row Level Security |
| AI Summary | Anthropic Claude Sonnet | Best instruction-following for constrained 100-word summaries |
| Email | Resend | Developer-first API, generous free tier, React email templates |
| Testing | Jest + ts-jest | Standard, fast, good TypeScript support |
| CI/CD | GitHub Actions | Free for public repos, runs on every push |
| Hosting | Vercel | Zero-config Next.js deploys, preview URLs, edge network |

## License

MIT

---

Built for the [Credex](https://credex.rocks) internship assignment.
