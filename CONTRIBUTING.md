# Contributing to Kontro

Kontro uses GitHub Flow: `main` is always releasable and all work reaches it through a focused pull request from a short-lived branch. This keeps a solo project professional without the overhead of a permanent integration branch.

## Language

Use English for code, comments, commits, issues, pull requests, and durable technical documentation. Product translations and learning conversations may use Spanish.

## Branches

Create a branch from an up-to-date `main`:

```text
feat/add-personal-debt-ledger
fix/card-payment-double-counting
chore/configure-repository
docs/explain-rls
refactor/extract-period-summary
```

Do not push directly to `main`. Keep branches short-lived and delete them after merge.

## Commits

Use focused Conventional Commits:

```text
feat: add personal debt repayment flow
fix: prevent card payments from duplicating expenses
docs: record the debt accounting decision
test: cover weekly income boundaries
chore: configure Dependabot
```

## Engineering standards

- Keep finance rules in `lib/finance/`, not in React components.
- Validate Server Action input with Zod and verify ownership before every mutation.
- Add forward-only migrations under `supabase/migrations` and preserve RLS isolation.
- Reuse accessible UI primitives and the existing i18n and formatting helpers.
- Add tests that prove behavior, especially period boundaries and balance calculations.
- Never commit secrets, production data, `.env.local`, access tokens, or service-role credentials.

## Pull requests

Before opening a pull request, run:

```bash
corepack pnpm run lint
corepack pnpm run test:coverage
corepack pnpm run build
```

The pull request must explain the user problem, solution, test evidence, risk, and any migration/RLS impact. Include screenshots for visible changes. Keep the diff focused enough to review and revert safely.

Use squash merge by default. Require passing status checks and resolved review conversations on `main`. An approving review is recommended when another collaborator is available; do not make solo development impossible by requiring the author to self-approve.

## Releases

Use semantic versioning. Keep early releases pre-1.0 until the ledger semantics, migration path, security review, and recovery workflow are stable.
