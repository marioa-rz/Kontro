# Kontro product requirements and coverage

This matrix is the product source of truth for the initial discovery. “Partial” means the foundation has a related primitive but not the complete Kontro workflow.

| Capability                                                                                                                                       | Foundation coverage    | Gap to close                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Daily, weekly, and monthly income                                                                                                                | Partial                | Add day/week summaries and consistent timezone boundaries.                                                          |
| Expense categories: cat, university, transport, food, supermarket, utilities, phone, personal, health, nail business, entertainment, emergencies | Covered for onboarding | Migration `011` creates the localized taxonomy independently for every new user.                                    |
| Nail-business income and expenses                                                                                                                | Partial                | Add business tags/views and profit reporting without building a second ledger.                                      |
| Cash, bank transfer, and card payments                                                                                                           | Covered for onboarding | New users receive Efectivo, Transferencia bancaria, Tarjeta de crédito, and Tarjeta de débito.                      |
| Credit-card debt, payments, and remaining balance                                                                                                | Partial                | Due/closing dates and invoices exist; add explicit statement payments and liability balance.                        |
| Debts to people, repayments, and outstanding balance                                                                                             | Missing                | Add counterparties, debt agreements, installments/payments, due dates, and status.                                  |
| Subscriptions and apps                                                                                                                           | Covered                | Validate recurrence, pause/cancel, and due-date calendar behavior.                                                  |
| Savings records and savings goal                                                                                                                 | Partial                | Keep contributions separate from expenses, optionally associate them with a goal, and add day/week/month summaries. |
| Debt and service payment calendar                                                                                                                | Missing                | Add due events, status, reminders, and a calendar/list view.                                                        |
| Daily, weekly, and monthly spending totals                                                                                                       | Partial                | Monthly exists; add reusable day/week aggregation and tests.                                                        |
| Available money after expenses                                                                                                                   | Partial                | Define cash accounts, transfers, savings, and debt-payment semantics.                                               |
| Monthly income/spending/debt/savings summary                                                                                                     | Partial                | Present the four dimensions separately and prevent double counting.                                                 |
| Charts showing highest spending                                                                                                                  | Covered                | Extend filters, accessible summaries, and category drill-down.                                                      |
| Editable income and savings categories                                                                                                           | Covered                | Users can create, rename, regroup, and delete categories while existing movements remain preserved.                 |
| Results-first dashboard                                                                                                                          | Covered                | Shows actual income by source, category budget balances, and credit-card payoff amounts without chart-first UI.     |

## Initial delivery slices

1. Foundation: public repository, attribution, project router, CI, branch policy, and product decisions.
2. Localization and taxonomy: Kontro branding, Spanish UI, GTQ, Guatemala timezone, and default categories.
3. Ledger semantics: accounts, transfers, available balance, and period aggregations.
4. Debts and calendar: credit-card payments, personal creditors, repayments, due dates, and reminders.
5. Insights: monthly summary, business view, accessible charts, exports, and anomaly-ready data.
6. AI learning track: assisted categorization or natural-language insights only after deterministic rules, privacy boundaries, and evaluation data exist.

## Accepted MVP product decisions

- Support multiple authenticated users, primarily two, while keeping every user's financial data private and independent. Shared household workspaces are out of scope.
- Use GTQ as the initial display and entry currency while preserving a path to multi-currency support.
- Prioritize manual entry. CSV import is a later delivery slice; direct bank integration is out of scope for the MVP.
- Record savings contributions by date and amount, optionally against a savings goal. Savings reduce spendable money but remain separate from expenses and consumption charts.
- Deliver in-app reminders first. Add calendar export (`.ics`) when the reminder model is stable; defer browser push notifications until their added permission and service-worker complexity is justified.
- Model nail-business activity with categories and tags in the shared ledger. Customer management, service booking, and inventory are out of scope for the MVP.

## Localization slice status

- Implemented: Kontro runtime branding, `es-GT` as the default locale, GTQ as the default currency, and `America/Guatemala` as the reporting timezone.
- Implemented: Guatemala-oriented categories and payment methods for newly created users through migration `011`.
- Implemented: complete Spanish (`es-GT`) copy for authentication, navigation, dashboard, transactions, categories, budgets, payments, goals, reports, settings, exports, and accessible daily-spending summaries.
- Implemented: editable income/savings categories and a results-first dashboard focused on real budget, income, and credit-card debt amounts.
- Implemented: versioned Spanish Supabase Auth templates for confirmation, recovery, magic-link, invitation, and email-change messages.
- Remaining: apply the versioned email templates to each hosted Supabase environment and replace the inherited temporary icon with a final Kontro visual identity.

## Privacy acceptance criteria

- Each person signs in with an independent Supabase Auth identity.
- A user can read, create, update, and delete only records owned by that same authenticated user.
- A user cannot discover another user's categories, transactions, payment methods, budgets, goals, debts, reminders, reports, or exports.
- Default categories and payment methods are created independently for each new user.
- Automated RLS tests use at least two authenticated users and prove both permitted self-access and denied cross-user access.
