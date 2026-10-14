---
name: kontro-finance-domain
description: Model and implement Kontro's personal-finance rules for transactions, categories, debts, cards, savings, balances, and summaries. Use when behavior changes financial totals or obligations.
---

# Kontro finance domain

Read `docs/product/requirements.md` and the finance model in `docs/architecture.md`. Read `docs/database.md` when persistence is involved.

Keep these concepts distinct:

- Income and expense describe economic activity.
- Transfers move money between owned accounts and must not inflate income or expense.
- A credit-card purchase is an expense and creates a liability; paying the card reduces cash and liability without counting the expense twice.
- A personal debt records principal, counterparty, due dates, repayments, and outstanding balance.
- Savings may reduce available cash, but it is not consumption. Reports must label cash flow, spending, debt payments, and savings separately.

For every calculation, define:

- included transaction kinds and statuses;
- date basis (transaction date, due date, or payment date);
- timezone and period boundaries;
- currency and rounding rule;
- treatment of deleted, future, installment, and recurring records.

Put reusable rules in `lib/finance/` and cover them with table-driven tests. UI code may format results but must not redefine the calculation.

Do not silently change historical meaning. If a new rule changes existing totals, document the migration/backfill strategy and the before/after example.
