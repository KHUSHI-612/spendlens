# Architecture — SpendLens

## Known Limitation — Resend Email

Resend free tier only sends to the account owner's email until a custom domain is verified. For this demo, email delivery is functional but scoped to verified addresses.

Production fix: verify a custom domain in Resend dashboard (requires owning a domain). The email template, API route, and lead capture logic are all production-ready — only the domain verification step is pending.
