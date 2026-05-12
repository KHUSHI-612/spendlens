# Tests - SpendLens

## Automated Test Suite

We use **Jest** and **ts-jest** to verify the core logic of the SpendLens Audit Engine. Our tests focus on the deterministic rules that calculate savings, ensuring accuracy without the need for live API calls.

### Test Coverage

The following 8 core scenarios are verified on every commit:

1.  **Seat Mismatch**: Verifies that paying for more seats than the team size triggers a "Remove seats" recommendation.
2.  **Team Plan Downgrade**: Ensures small teams on "Team" or "Business" plans are correctly prompted to downgrade to "Pro" when it's more cost-effective.
3.  **Free Tier Opportunity**: Validates that light use cases (general/documentation) on paid plans trigger a downgrade to the Free tier.
4.  **Tool Overlap**: Checks that holding multiple IDE assistants (e.g., Cursor + Copilot) triggers a "drop" recommendation for the more expensive tool.
5.  **Vendor Redundancy**: Detects redundant subscriptions like Claude Pro + Anthropic API direct usage.
6.  **Credex Relevance**: Ensures high API spend ($500+) is correctly flagged as relevant for the Credex marketplace.
7.  **High Savings Classification**: Verifies that total monthly savings > $500 correctly assigns the "High" savings tier.
8.  **Optimized Stack**: Confirms that a perfectly optimized stack (all free tiers) results in zero savings and a "Low" savings tier.

## Continuous Integration (CI)

We use **GitHub Actions** to automatically run the full test suite and a production build on every push to the `main` branch. This ensures that no logic changes break existing audit rules or cause build failures.

**To run tests locally:**
```bash
npm test
```
