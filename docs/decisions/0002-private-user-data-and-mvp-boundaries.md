# ADR 0002: Keep user finances private and define the MVP boundaries

- Status: Accepted
- Date: 2026-10-13

## Context

Kontro will initially be used mainly by two people. Their finances must remain private and independent rather than forming a shared household ledger. The MVP also needs clear boundaries for currency, data entry, savings, reminders, and nail-business activity.

These decisions affect persisted data, Row Level Security, financial totals, and the primary user workflow, so they must be recorded before feature implementation.

## Decision

- Give each person an independent Supabase Auth account and scope all user-owned records to that identity.
- Do not add household, workspace, membership, invitation, or shared-ledger concepts to the MVP.
- Use GTQ initially while keeping currency explicit enough for later evolution.
- Use manual transaction entry first and defer CSV import until the core ledger is stable.
- Represent each savings contribution with an amount and date and allow an optional savings-goal association. Savings reduce spendable money but are not expenses.
- Ship in-app reminders first. Calendar export is the next-lowest-complexity channel; browser push is deferred.
- Represent nail-business income and expenses with categories and tags rather than a separate ledger or full business-management module.

## Data-isolation invariant

Every exposed user-owned row must carry an owner ID derived from the authenticated user. RLS policies must restrict reads and writes to that owner. References between user-owned rows must reject cross-user ownership, and automated tests must exercise at least two users.

Application filters are not a security boundary. They improve query clarity, but PostgreSQL RLS remains responsible for enforcing isolation even if application code is incorrect.

## Financial reporting invariant

Period summaries must report income, expenses, debt payments, and savings separately. Spendable money may subtract savings contributions, but expense totals and consumption charts must not include them.

## Consequences

- Two people can use the same deployment safely without seeing one another's records.
- The first schema remains simpler because it does not need organizations, memberships, invitations, or shared ownership.
- Shared household budgets would require a future ADR and a migration rather than an implicit relaxation of current RLS policies.
- Savings reports require dated contributions as well as goal totals; updating only a goal balance is insufficient.
- Calendar export can be added without notification permissions, while push notifications remain a later progressive enhancement.
