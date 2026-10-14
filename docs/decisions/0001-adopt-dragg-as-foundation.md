# ADR 0001: Adopt Dragg as Kontro's foundation

- Status: Accepted
- Date: 2026-10-13

## Context

Kontro needs a professional but learnable web foundation for personal income, expenses, savings, debts, payment schedules, reports, and charts. The preferred learning path includes TypeScript, Supabase, Vercel, GitHub branches, and pull requests.

## Decision

Use [Dragg](https://github.com/fsousac/Dragg) as the upstream foundation and maintain Kontro as a public personal fork. Preserve the original MIT license and full Git history.

Dragg already provides Next.js, React, TypeScript, Supabase Auth/Postgres/RLS, Server Actions, Zod validation, finance modules, categories, payment methods, credit-card dates, subscriptions, goals, reports, Recharts, Vitest, Playwright, and GitHub Actions. This minimizes commodity setup while leaving meaningful domain work for debts, payment calendars, period summaries, localization, and business-specific reporting.

## Alternatives considered

| Candidate              | Domain coverage | Stack fit                   | Maturity              | Adaptation cost | License  |
| ---------------------- | --------------- | --------------------------- | --------------------- | --------------- | -------- |
| Dragg                  | High            | Excellent                   | Early                 | Low             | MIT      |
| Actual Budget          | High            | Low for Supabase/Vercel     | Excellent             | High            | MIT      |
| Firefly III            | Very high       | Low for the requested stack | Excellent             | High            | AGPL-3.0 |
| Daily Expenses Tracker | Medium          | Excellent                   | Early                 | Medium          | MIT      |
| Maybe                  | High            | Low and archived upstream   | Discontinued upstream | High            | AGPL-3.0 |

The Daily Expenses Tracker was not selected because its published setup disables Row Level Security. Financial data isolation is a baseline requirement, not an optional enhancement.

## Consequences

- We inherit a useful architecture, tests, and security controls instead of starting from zero.
- We must audit rather than blindly trust a young upstream project with a small community.
- Some current concepts are Brazil-specific (`Pix`, LGPD) and need Guatemalan/neutral product language without weakening privacy.
- Debt accounting and cash-flow semantics require explicit domain work to avoid double counting.
- Upstream changes can be reviewed and selectively merged through the fork relationship.

## References

- [GitHub repository best practices](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
