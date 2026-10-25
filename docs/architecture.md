# Architecture

Kontro is a Next.js App Router application backed by Supabase Auth and Supabase Postgres. It uses Dragg as its MIT-licensed foundation and currently targets Next.js 16, React 19, Node.js 24, pnpm 10, Tailwind CSS 4, shadcn/ui primitives, Recharts, and Vitest.

## Application flow

- Public users land on `/` and sign in with Google OAuth or email/password through Supabase Auth.
- Supabase SSR clients live in `lib/supabase/server.ts`, `lib/supabase/client.ts`, and `lib/supabase/proxy.ts`.
- `proxy.ts` refreshes Supabase session cookies for app requests.
- Authenticated routes are wrapped by `AppShell`, which verifies Supabase claims and user data before rendering.
- Finance reads are centralized in `lib/finance/transactions.ts` and supporting modules under `lib/finance/`.
- Mutations use Server Actions in `app/transactions/actions.ts` and `app/goals/actions.ts`.
- Server Actions validate input with Zod and then call server-side finance functions.
- Client components receive already-scoped data and trigger Server Actions for writes.

## Routes

- `/`: Google OAuth and email/password login screen. Authenticated users are redirected to `/dashboard`.
- `/auth/callback`: Supabase OAuth and email recovery code exchange with guarded same-origin redirect handling.
- `/auth/update-password`: password update screen for authenticated recovery sessions.
- `/dashboard`: summary cards, transaction form, category-budget balances, credit-card payoff progress, income by source, latest transactions, and quick actions.
- `/transactions`: transaction list with update/delete flows.
- `/transactions/new`: focused new transaction flow.
- `/categories`: category management with icons, groups, and monthly limits.
- `/budgets`: amount-first budget totals, group progress, and category budget progress.
- `/payments`: payment methods, credit limits, due payments, and subscription management.
- `/goals`: goals with target/current amounts, funding, deadlines, colors, and icons.
- `/reports`: monthly reports, net worth progression, and transaction exports.
- `/settings`: read-only OAuth profile information and user preferences UI.

## Finance model

- Kontro supports multiple authenticated people without shared financial workspaces. Every user-owned aggregate and row is scoped to one Supabase Auth user, and RLS is the database-level isolation boundary.
- Transactions are income, expense, or saving records.
- A saving record is not an expense. It contributes to savings progress and reduces spendable money in cash-flow summaries without inflating consumption totals.
- Expenses can be split into installments; each occurrence is stored as its own transaction and grouped by shared installment metadata.
- Installment deletion supports single, selected-and-following, and full-group scopes. Installment prepayment preserves the original transaction dates and writes `advanced_to_month` metadata so payment/invoice views move the obligation without changing purchase competence.
- Monthly subscriptions are represented by future transaction rows whose `notes` start with `subscription`. There is no explicit paid/unpaid column, so scoped subscription deletion removes the selected occurrence and matching future rows while preserving earlier history.
- Paused subscription rows use `subscription paused` notes and are hidden from transaction/payment views while remaining available to subscription overview logic.
- Categories belong to one authenticated user and are grouped by Needs, Wants, Savings, or Income.
- Categories can include emoji icons and monthly limits.
- The dashboard prioritizes actual currency amounts. Budget and debt calculations live in `lib/finance/`, while React components only render prepared progress data.
- Payment methods belong to one authenticated user. Cash-type methods are protected defaults; the legacy Pix type remains supported for migrated data.
- Credit cards support `credit_limit`, `due_day`, and `closing_day`. Invoice rows are calculated in `lib/finance/credit-card-invoices.ts` for display and planning.
- Payment method usage is calculated in `lib/finance/payment-method-overview.ts`.
- Goals are stored separately from transactions and support create, edit, fund, and delete operations.
- The Kontro savings slice must make goal funding and dated savings contributions consistent so progress and period summaries cannot diverge.
- Reports aggregate transactions by financial month, including credit card due-month behavior.

## UI conventions

- Use shadcn/ui primitives for dialogs, inputs, selects, cards, and destructive confirmations.
- Desktop dialogs should use 50vw by 50vh, except the new transaction dialog.
- Visible strings must use `lib/i18n.tsx`.
- Currency formatting lives in `lib/i18n/currency.ts` and `lib/i18n-currency.ts`.
- The default regional context is `es-GT`, GTQ, and `America/Guatemala`. Browser storage reads legacy Dragg preference keys once for upgrade compatibility and writes Kontro keys going forward.
- Current financial day/month boundaries come from `lib/datetime/guatemala.ts`, so server execution in UTC and clients in other timezones still agree on Kontro's Guatemala business date.
- Theme, language, toast, Vercel Analytics, and Speed Insights are configured in `app/layout.tsx`.

## Quality and delivery

- Linting uses ESLint 9 with Next.js core web vitals and TypeScript rules.
- Tests use Vitest with 100% coverage thresholds.
- GitHub Actions run CodeQL first, then lint, coverage, and build.
- Production Vercel deployment runs after successful checks on `main`.
