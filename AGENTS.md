# Kontro agent router

This file is the project map. Keep it short: load only the skill that matches the requested work, plus a second skill only when the task crosses a real boundary.

## Always apply

- Preserve the original MIT license and attribution to Dragg.
- Never commit secrets, production data, Supabase keys, OAuth secrets, or local environment files.
- Work on a short-lived branch and use a pull request for changes to `main`.
- Announce each completed phase and close with a short learning note that defines the important technical terms used.
- Inspect the current implementation before changing it. Keep business rules out of UI components.
- Verify the smallest relevant checks before claiming completion; record any check that could not run.
- Code, durable technical documentation, commits, issues, and pull requests use English. User-facing explanations may use Spanish.

## Route by task

| Request signal                                                                        | Read and follow                         |
| ------------------------------------------------------------------------------------- | --------------------------------------- |
| Requirements, scope, user stories, roadmap, prioritization, acceptance criteria       | `skills/kontro-product/SKILL.md`        |
| Income, expenses, debts, savings, balances, cards, categories, financial calculations | `skills/kontro-finance-domain/SKILL.md` |
| PostgreSQL schema, Supabase Auth, migrations, RLS, RPCs, indexes, data privacy        | `skills/kontro-supabase-data/SKILL.md`  |
| Next.js route, React UI, Server Action, form, chart, accessibility, i18n              | `skills/kontro-nextjs-feature/SKILL.md` |
| Tests, regression checks, CI failures, quality gates, review readiness                | `skills/kontro-quality/SKILL.md`        |
| Git, branches, commits, pull requests, releases, Vercel or environment promotion      | `skills/kontro-delivery/SKILL.md`       |

## Cross-boundary routing

- For a finance feature, read `kontro-product`, then `kontro-finance-domain`, and add either `kontro-supabase-data` or `kontro-nextjs-feature` only for the layer being changed.
- For a full-stack feature, read the product and finance skills first, then the data and Next.js skills. Read the quality and delivery skills only when validating or publishing.
- For a database-only hardening task, read only `kontro-supabase-data` and `kontro-quality`.
- Do not preload every skill “just in case.”

## Source of truth

- Product coverage and gaps: `docs/product/requirements.md`
- Architecture: `docs/architecture.md`
- Database: `docs/database.md`
- Security expectations: `docs/security.md`
- Contribution workflow: `CONTRIBUTING.md`
- Architecture decisions: `docs/decisions/`
