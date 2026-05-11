# Unit Economics - SpendLens / Credex

This document outlines the core economic model connecting the SpendLens free audit tool to the Credex enterprise procurement platform.

## Baseline Assumptions

- **Average AI tool spend per startup:** $500 - $2,000 / mo
- **Credex discount offered:** 20% - 30% off retail pricing
- **Average deal size (ARR) if converted to Credex:** $2,000 / yr
- **Audit-to-Consultation Conversion Rate:** 5% - 10% (Midpoint: 7.5%)
- **Consultation-to-Purchase Conversion Rate:** 20% - 30% (Midpoint: 25%)

---

## 1. Value of a Converted Lead

A converted lead represents a successful purchase of Credex services.

- **Value of a new customer:** $2,000 ARR
- **Expected Value of a Consultation:** $2,000 × 25% close rate = **$500**
- **Expected Value of a SpendLens Audit:** $500 × 7.5% conversion rate = **$37.50**

Every time a user completes an audit on SpendLens, it generates **$37.50** in expected pipeline value for Credex.

---

## 2. Customer Acquisition Cost (CAC) by Channel

Based on the zero-budget GTM strategy, the hard CAC for initial channels is $0, meaning infinite ROI on early distribution.

| Channel | Estimated CAC | Strategy |
| :--- | :--- | :--- |
| **Founder / Twitter / X** | $0 | Organic sharing of audit results and transparent metrics |
| **Indie Hackers / Reddit** | $0 | "Build in public" posts driving high-intent traffic |
| **Hacker News** | $0 | Direct Show HN launch emphasizing "no login required" |
| **Viral Loop (Shareable URLs)** | $0 | Built-in product mechanics; K-factor drives organic traffic |
| **Credex Existing Base** | $0 | Email campaigns to existing users to drive expansion revenue |

*Note: Even if paid acquisition is introduced later, a CAC of up to $10-$15 per audit would remain highly profitable given the $37.50 expected value.*

---

## 3. Profitability Thresholds

Because organic CAC is $0, the model is inherently profitable from day one. However, to evaluate performance and potential paid channels, we look at the break-even metrics.

Assuming a future paid channel yields an audit for **$20**:
- Break-even requires: `$20 = $2,000 × (Audit -> Consult Rate) × 25%`
- Break-even Audit -> Consult Rate: **4.0%**

As long as SpendLens converts at least **4.0%** of audits into consultations, acquiring users at $20 per audit remains profitable. At the estimated 7.5% rate, the model is highly scalable.

---

## 4. Path to $1M ARR in 18 Months

To reach $1,000,000 in Annual Recurring Revenue within 18 months, Credex needs **500 customers** (at $2,000 ARR each).

**What has to be true:**
- **Purchases Needed:** 500
- **Consultations Needed:** 2,000 *(assuming 25% close rate)*
- **Audits Needed:** 26,666 *(assuming 7.5% conversion to consultation)*

**Monthly Run Rate Required (over 18 months):**
- ~1,481 Audits per month
- ~50 Audits per day

At a 10% viral share rate (users sharing their results publicly), generating 50 audits per day requires just ~5 organic shared URLs daily. This is a highly achievable velocity for a free, high-utility tool.

---

## 5. Economic Breakdown

| Metric | Conservative | Midpoint | Aggressive |
| :--- | :--- | :--- | :--- |
| **Avg. AI Spend / mo** | $500 | $1,250 | $2,000 |
| **Potential Savings (25%)** | $125 | $312 | $500 |
| **Credex ARR per Customer** | $2,000 | $2,000 | $2,000 |
| **Audit -> Consult Rate** | 5.0% | 7.5% | 10.0% |
| **Consult -> Purchase Rate** | 20.0% | 25.0% | 30.0% |
| **Expected Value per Audit** | $20.00 | $37.50 | $60.00 |
| **Audits Needed for $1M ARR** | 50,000 | 26,666 | 16,666 |
| **Monthly Audits Needed (18mo)** | 2,777 | 1,481 | 925 |
