# Reflection — SpendLens

## Technical Trade-offs

I hit Resend's free tier domain restriction. In production this is solved by domain verification. I documented it rather than hiding it. The lead capture logic itself is fully functional and production-ready; only the third-party delivery service requires a verified domain to send to external users.
