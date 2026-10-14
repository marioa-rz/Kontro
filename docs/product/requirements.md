# Kontro product requirements and coverage

This matrix is the product source of truth for the initial discovery. “Partial” means the foundation has a related primitive but not the complete Kontro workflow.

| Capability                                                                                                                                       | Foundation coverage | Gap to close                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------- |
| Daily, weekly, and monthly income                                                                                                                | Partial             | Add day/week summaries and consistent timezone boundaries.                                     |
| Expense categories: cat, university, transport, food, supermarket, utilities, phone, personal, health, nail business, entertainment, emergencies | Partial             | Categories are configurable; seed and localize the Kontro taxonomy.                            |
| Nail-business income and expenses                                                                                                                | Partial             | Add business tags/views and profit reporting without building a second ledger.                 |
| Cash, bank transfer, and card payments                                                                                                           | Partial             | Cash and credit cards exist; replace Brazil-specific Pix with a neutral bank-transfer concept. |
| Credit-card debt, payments, and remaining balance                                                                                                | Partial             | Due/closing dates and invoices exist; add explicit statement payments and liability balance.   |
| Debts to people, repayments, and outstanding balance                                                                                             | Missing             | Add counterparties, debt agreements, installments/payments, due dates, and status.             |
| Subscriptions and apps                                                                                                                           | Covered             | Validate recurrence, pause/cancel, and due-date calendar behavior.                             |
| Savings records and savings goal                                                                                                                 | Covered             | Clarify whether savings is a transfer, then add day/week/month summaries.                      |
| Debt and service payment calendar                                                                                                                | Missing             | Add due events, status, reminders, and a calendar/list view.                                   |
| Daily, weekly, and monthly spending totals                                                                                                       | Partial             | Monthly exists; add reusable day/week aggregation and tests.                                   |
| Available money after expenses                                                                                                                   | Partial             | Define cash accounts, transfers, savings, and debt-payment semantics.                          |
| Monthly income/spending/debt/savings summary                                                                                                     | Partial             | Present the four dimensions separately and prevent double counting.                            |
| Charts showing highest spending                                                                                                                  | Covered             | Extend filters, accessible summaries, and category drill-down.                                 |

## Initial delivery slices

1. Foundation: public repository, attribution, project router, CI, branch policy, and product decisions.
2. Localization and taxonomy: Kontro branding, Spanish UI, GTQ, Guatemala timezone, and default categories.
3. Ledger semantics: accounts, transfers, available balance, and period aggregations.
4. Debts and calendar: credit-card payments, personal creditors, repayments, due dates, and reminders.
5. Insights: monthly summary, business view, accessible charts, exports, and anomaly-ready data.
6. AI learning track: assisted categorization or natural-language insights only after deterministic rules, privacy boundaries, and evaluation data exist.

## Product decisions still required

- Single-user personal app or multi-user/family support.
- Primary currency and whether multi-currency is in scope.
- Manual entry only for the first release or CSV/bank import.
- Whether a savings movement leaves the spendable account or is only an allocation.
- Reminder channel: in-app first, email, push, or calendar integration.
- Whether nail-business reporting needs customers/services/inventory or only tagged income and expenses.
