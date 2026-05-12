# Technical Reflection - SpendLens

## 1. Architectural Decisions: Deterministic vs. Generative
The core of SpendLens is a deterministic rules engine (`auditEngine.ts`). We deliberately avoided using LLMs for the primary savings calculation. This decision ensures that the tool is ultra-fast, 100% reproducible, and easy to unit test. AI (Groq/Llama 3) is used only as a "post-processor" to weave the findings into a human-readable executive summary, ensuring we get the "wow" factor of AI without the brittleness of non-deterministic math.

## 2. Security & Data Integrity
Since we capture sensitive financial data (spending amounts), we implemented a "Public Read/Insert Only" policy via Supabase Row Level Security (RLS). 
*   Audits are stored with a UUID and are public-read to allow for viral sharing.
*   Leads are strictly insert-only from the client; no one can query the `leads` table from the browser, protecting user emails.
*   We strip identifiers (like company name) from the public shareable URL to ensure privacy while allowing for collaborative review.

## 3. Performance Optimization (Lighthouse 90+)
To achieve high performance on mobile and desktop, we implemented:
*   **Compact Command Center Architecture**: Optimized typography and spacing to provide high information density without visual clutter.
*   **Aggressive Code Splitting**: Used `next/dynamic` for the `SpendForm` and `LeadCapture` modal, reducing the initial JS bundle by ~40%.
*   **Paint Performance**: Simplified the design system by removing expensive `backdrop-blur` and heavy shadow effects that were causing high CPU usage during scrolling.
*   **Font Strategy**: Optimized loading of Inter and Outfit fonts to only essential weights with `display: swap`.

## 4. Accessibility (A11y)
The application achieved an A11y score of 90+ by:
*   Ensuring every icon button and interactive element has a clear `aria-label`.
*   Maintaining a high-contrast color palette (using `text-gray-300` minimum on dark backgrounds).
*   Implementing semantic HTML structure (`<main>`, `<nav>`, `<h1>` hierarchy) for screen reader compatibility.
*   Adding `role` attributes and descriptive titles to all SVG icons.

## 5. User-Centric Design: The "Value First" Loop
The biggest design trade-off was removing the signup wall. By showing the audit results *before* asking for an email, we establish immediate credibility. The UI is designed as a "Command Center" rather than a simple form, using geometric grid patterns and bold, widescreen typography to mirror the high-end developer tools (like Cursor) that we are auditing.

---

## Assignment Reflection Questions

### 1. Hardest Bug
The most frustrating bug surfaced on Day 2 when I was integrating Supabase. I had my `audits` table set up and could insert records locally, but once I pushed to production, the `POST /api/audit` request kept failing with a `403 Forbidden` error. I initially hypothesized it was an environment variable issue-maybe my `SUPABASE_SERVICE_ROLE_KEY` wasn't being picked up by Vercel. I tried re-deploying, double-checking the Vercel dashboard, and even hardcoding keys (temporarily) to no avail.

The breakthrough came when I looked at the Row Level Security (RLS) logs. I realized I had enabled RLS but hadn't created an explicit policy for anonymous inserts. Because SpendLens has no login wall (a core design decision), every user is technically "anon." I then discovered that my logic was trying to `SELECT` the record immediately after insertion to return the UUID to the frontend. In Supabase, an `INSERT` policy doesn't automatically grant `SELECT` permissions. I had to implement a dual-policy system: one allowing anyone to `INSERT` and another allowing anyone to `SELECT` if they knew the specific UUID. This taught me that "serverless" doesn't mean "zero-config security"-you have to think about the data lifecycle even for simple CRUD operations.

### 2. Decision Reversed Mid-Week
Mid-week, I made the call to rip out the Anthropic Claude integration in favor of Groq (Llama 3). I initially chose Anthropic because it's the industry standard for "smart" long-form reasoning, and the assignment specifically recommended it. I spent hours prompt-engineering the executive summary to get that "finance-director-in-a-hurry" tone.

However, I hit a wall when I realized Anthropic doesn't have a free tier for API credits-you have to prepay. As a student builder, I wanted this tool to be truly free to run and deploy. I switched to Groq because they offer a massive free tier for Llama 3.3-70b through their LPU architecture. The learning here was about "API optionality." Because I had built the `summary` route using a standard OpenAI-compatible interface, the switch took less than 15 minutes. It reinforced the value of using standard libraries (like the `openai` SDK) rather than vendor-specific SDKs. It also made the tool significantly faster-Groq’s inference is near-instant, which improved the "time-to-value" for the user.

### 3. What I'd Build in Week 2
If I had another week, the first thing I’d build is an **Upgrade ROI Calculator**. During my user research, the biggest headache voiced wasn't just "what am I spending," but "should I upgrade to Enterprise to get SSO and better security?" I’d build a logic layer that checks how often a team is hitting the "Pro" limits (like context windows or seat counts) and tells them exactly when the productivity gain of Enterprise outweighs the $3,000/mo price jump.

I’d also expand our **Tool Coverage**. Right now, we’re heavy on dev tools (Cursor, Claude), but marketing agencies run on a totally different stack-Midjourney, Jasper, and HeyGen. I’d build a dedicated "Agency Audit" mode. Additionally, I want to add a **Benchmark Mode**. It would aggregate all the anon data we’ve collected to tell a founder: "You're spending $400/dev/mo on AI, while the average Seed-stage startup spends $150." Finally, I’d build an **Embeddable Savings Widget**. Imagine a tech blogger writing about "The Best AI Tools" and dropping in a SpendLens widget where readers can calculate their own savings without leaving the page.

### 4. How I Used AI Tools
I built 90% of SpendLens inside Cursor using Claude 3.5 Sonnet. I trusted the AI completely for the "heavy lifting" of the UI-generating the complex Tailwind grid layouts for the results page, scaffolding the Next.js API routes, and writing the boilerplate for the Supabase client. It’s incredibly good at "structural" code where the patterns are well-documented.

However, I absolutely did **NOT** trust it for the core audit engine logic or pricing data. AI is notoriously bad at "current events" like pricing changes. For example, at one point, Claude generated a pricing function for Claude 3.5 Sonnet that used old token prices from six months ago. If I hadn't manually verified every single rule in `lib/tools.ts` against the official vendor pages, the tool would have been giving founders incorrect financial advice. Another instance where it failed was in the `auditEngine.test.ts`-it wrote tests that passed by "mocking" the wrong behavior, essentially creating a circular logic loop where the test was just confirming the AI's own misunderstanding. I learned that AI is a great co-pilot, but for anything involving money or math, you have to be the pilot.

### 5. Self-Ratings
*   **Discipline: 9/10** - I treated the 72-hour window like a real sprint. I kept a meticulous `DEVLOG.md` and didn't let "feature creep" push me into building a login system we didn't need.
*   **Code Quality: 8/10** - The core engine is pure, functional, and 100% covered by unit tests. The UI code got a bit messy toward the end of the "polish" phase, but it's all typed and modular.
*   **Design Sense: 10/10** - I’m genuinely proud of the "Quiet Luxury" aesthetic. Moving from a standard white-background SaaS look to a high-density, monochromatic dark mode made the tool feel like a professional command center.
*   **Problem Solving: 9/10** - Navigating the production build errors (the `critters` plugin bug) and the API credit hurdle required quick thinking and deep-diving into documentation.
*   **Entrepreneurial Thinking: 10/10** - The decision to kill the signup wall was purely entrepreneurial. I prioritized "distribution" and "virality" over "user tracking," which is exactly what an MVP needs to survive.
