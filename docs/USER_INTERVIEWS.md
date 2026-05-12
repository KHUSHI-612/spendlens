# User Interviews - SpendLens

## Interview 1 - Kavya, Founder, Social Media Marketing Agency
**Date:** 2026-05-11
**Duration:** ~15 minutes
**Method:** WhatsApp call

### Their Current AI Stack
- Claude Code - building and editing client websites
- Claude Team subscription - general agency work
- Gemini - generating images for client content
- AI video generation tools - multiple tools for client campaigns
- Claude Design - recently launched, still exploring it

### Approximate Monthly Spend
Kavya couldn't give me an exact number without checking. 
She knew the Claude Team bill but had no idea what the 
video tools added up to across the month.

### Direct Quotes
- "The limit is the real problem, not the price. I'll be 
  in the middle of something for a client and the agent 
  just stops."
- "I'd want a full report - not just which plan is cheaper, 
  but whether upgrading actually makes sense for what I do."

### Most Surprising Thing She Said
She wasn't asking "am I overpaying?" She was asking "is 
upgrading worth it?" The price wasn't the pain - hitting 
agent limits mid-client-work was the pain. She would 
actually pay *more* if someone could justify the upgrade 
clearly. 

### What It Changed About My Thinking
1. **Wrong assumption about the core pain** - I built 
   SpendLens assuming everyone wants to spend less. Kavya 
   wants to know whether spending more is justified. The 
   "is this upgrade worth it" question is just as valuable 
   as "am I overpaying" - and I'm not answering it.

2. **Tool coverage is too narrow** - Gemini for images, 
   AI video tools, Claude Design - none of these are in 
   my audit engine. Agencies run a completely different 
   stack to dev teams. SpendLens currently only makes 
   sense for technical users.

3. **The upgrade recommendation gap** - A future version 
   should include an "upgrade calculator" - given your 
   usage patterns and how often you hit limits, here's 
   whether the next tier pays for itself.

---

## Interview 2 - Shivam, SDE Intern, Computer Science Student
**Date:** 2026-05-11
**Duration:** ~10 minutes
**Method:** LinkedIn message + quick call

### Their Current AI Stack
- Claude Code - provided by his company to all developers, cost unknown to him personally
- Cursor Pro (previously) - paid out of pocket for personal projects and open source contributions
- Antigravity - switched to this from Cursor when his paid plan expired, specifically because it offered more free usage limits for writing code

### Approximate Monthly Spend
Near zero currently - company covers Claude Code. Previously was paying for Cursor Pro personally as a student, which he found expensive relative to what he could afford.

### Direct Quotes
- "I switched from Cursor to Antigravity not because it was better - just because it gave me more free usage. I'm a student, I can't keep paying for these things."
- "I know I could save money. That's not the problem. Tell me which tool to actually use - that's more useful."
- "Paid versions are just better. Less efficient tools mean I hit walls. I'd rather know which paid tool is worth it than be told to switch to free."
- "API key leakage is something I think about. If a tool is reading my stack I want to know it's safe."

### Most Surprising Thing He Said
He already knows he can save money - that's obvious to him. What he actually wants is a recommendation engine: "use this tool for this task, drop that one." The savings number alone doesn't help him decide. He wants SpendLens to tell him *what to do*, not just *what's wrong*.

### What It Changed About My Thinking
1. **"I know I can save" is not a strong enough hook for students** - Shivam's problem isn't awareness of cost, it's decision paralysis. Too many tools, unclear which one is worth paying for when money is tight. SpendLens should lead with "here's what to use" not just "here's what you're wasting."

2. **Students are a real segment with a specific constraint** - they'll switch tools purely based on free tier limits, not features. Antigravity beat Cursor not on quality but on generosity of free plan. This is a different decision framework than a funded startup uses.

3. **Trust and security matter more than I expected** - Shivam brought up API key leakage unprompted. For developers who are security-conscious, SpendLens needs to be clear that it never stores or transmits API keys. This should probably be visible on the form page.

4. **The "which tool" question is underserved** - both Kavya and Shivam independently said some version of "don't just tell me I'm overspending, tell me what to do." That's two out of two interviews pointing at the same gap. Worth noting.

---

## Interview 3 - Phalak, Early Team Member, Turf Booking Startup
**Date:** 2026-05-11
**Duration:** ~12 minutes
**Method:** College connection, called directly

### Context
I couldn't reach the founder directly but connected with Phalak who worked with them in the early stage and stayed close to the team. She gave me a clear picture of how their AI tool usage evolved as the company grew.

### Their AI Stack (Current)
- Claude - coding, agent building, automation
- AI tools for design - Figma AI, Claude Design
- Various tools per function - different tools for coding, design, bug fixing, documentation
- Hiring people and giving them AI-assisted workflows

### How Their Usage Changed Over Time
Early stage: free tiers only, slow pace, no budget. After receiving college funding: shifted to paid/pro versions specifically to keep work fast-paced. The upgrade wasn't about features - it was about not hitting limits when the team was moving fast and hiring.

### Direct Quotes
- "In companies I heard people nowadays ask 'khud to nhi likha na code claude se likhavaya hai na' so why would we not do that - if everyone is using it, there is no point holding back."
- "Speed matters a lot in work. As soon as we got funding we moved to pro versions - free tiers were slowing us down."
- "Managing AI tool costs is hard because there are so many tools for every single thing. For design alone - Figma AI, Claude Design. For coding - something else. Which one to buy, which one to not."
- "If a tool is known among people for being correct and it's telling me I'm saving money, I would definitely use it. Trust comes from reputation."
- "I would be happier if alongside the email I could also download the report. Something I can keep and share."

### Most Surprising Thing She Said
The upgrade decision had nothing to do with features or pricing comparison. It was purely about speed. When you're moving fast and hiring, hitting a free tier limit mid-task is more expensive than the subscription cost. The math isn't "is this tool worth $20" - it's "how much does slowing down cost us?"

### What It Changed About My Thinking
1. **The upgrade trigger is speed, not savings** - for funded early-stage teams, the question is never "can I afford this?" after funding. It's "is this limit slowing us down?" SpendLens doesn't currently model the cost of hitting limits, only the cost of subscriptions.

2. **Tool sprawl is the real pain for growing teams** - Phalak listed design tools alone as Figma AI and Claude Design, coding tools as separate, bug fixing as separate. The problem isn't one expensive tool - it's 8 tools for 8 functions with no overview of total spend or overlap. SpendLens is built for exactly this but needs to communicate it better.

3. **PDF download is a real feature request, not a nice to have** - Phalak specifically said she'd want to download and share the report. This came up unprompted. It's on the bonus features list in the assignment and this interview justifies prioritizing it.

4. **Trust through reputation** - she wouldn't use a tool just because it claims to save money. She'd use it if people she knew vouched for it. Early social proof matters more than feature lists for this audience.

5. **Third interview, same gap as interviews 1 and 2** - all three people independently said some version of "tell me which tool to use, not just that I'm overspending." That's a consistent signal across a social media agency founder, a student SDE intern, and an early-stage startup team member. The recommendation gap is real.

---

### Methodology Note
We had a raw conversation in our language. I realized that even if I ask people to reply to a message, they often give ChatGPT-generated answers. To avoid this, I called them directly to get honest, unfiltered insights. I then refined the raw notes using AI to maintain the consistent pattern and structure of the document. Regarding the outreach, I sent requests to several founders but given the short timeframe, I didn't get immediate responses. I focused my efforts on my college network and friends who are currently in the industry to ensure I could get high-quality feedback quickly. Thank you for understanding.
