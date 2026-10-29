# Database Notes

Database changes live in `supabase/migrations`.

## Current tables

The current committed schema defines these Supabase tables:

- `profiles`
- `categories`
- `payment_methods`
- `transactions`
- `monthly_budgets`
- `goals`
- `personal_debts`
- `personal_debt_payments`
- `privacy_requests`

## Current migrations

- `001_init.sql`: creates the finance schema, indexes, initial RLS policies, profile/category/payment-method defaults, and the initial auth user seed trigger.
- `002_security_lgpd_hardening.sql`: adds `updated_at` and `deleted_at` columns, moves helper functions into the private schema, adds privacy requests, hardens grants and RLS policies, validates transaction ownership references, and adds LGPD-oriented comments.
- `005_add_installment_group_metadata.sql`: adds stable installment grouping metadata and an authenticated-user scoped installment group index.
- `006_add_installment_prepayment_metadata.sql`: adds installment prepayment metadata and an authenticated-user scoped prepayment month index.
- `010_stop_writing_plaintext_profile_pii.sql`: stops the signup trigger from writing plaintext `profiles.name`/`email` (application-layer encryption now owns these fields, see `lib/crypto/field-encryption.ts`), and drops the now-unused `transactions_user_id_notes_idx` partial index.
- `011_localize_guatemala_defaults.sql`: replaces the signup defaults for future users with Kontro's Guatemala-oriented categories and payment methods. It deliberately does not rename or overwrite existing user-owned data.
- `012_goal_contributions_and_personal_debts.sql`: links savings transactions to goals and records each contribution atomically with the goal balance update.
- `013_add_personal_debts.sql`: adds owner-scoped personal debts and payments plus an atomic, balance-capped payment RPC.
- `014_add_service_category_flag.sql`: adds an explicit service flag to categories, backfills known service categories, and updates onboarding defaults.

## What belongs in the repository

The repository should include:

- schema migrations
- table constraints
- indexes
- RLS policies
- trigger/function definitions required to run the app
- seed/default data that does not contain private user information

The repository must not include:

- Supabase service-role keys
- OAuth client secrets
- `.env.local`
- production database URLs
- dumps with real user data
- access tokens or refresh tokens

## Profile fields used by the app

- `id`
- `email` — application-layer encrypted (`lib/crypto/field-encryption.ts`), never plaintext at rest. Distinct from `auth.users.email`, which Supabase Auth manages and is unaffected.
- `name` — application-layer encrypted (`lib/crypto/field-encryption.ts`), never plaintext at rest.
- `created_at`
- `updated_at`
- `deleted_at`

`private.handle_new_user()` no longer writes plaintext `name`/`email` into `profiles` (see migrations `010` and `011`). `lib/auth/encrypted-profile.ts` fills them in, encrypted, on the user's next authenticated request.

## Category fields used by the app

- `id`
- `user_id`
- `name`
- `icon`
- `group_type`
- `is_default`
- `is_service` — marks expense categories whose movements appear as services due
- `monthly_limit`
- `created_at`
- `updated_at`
- `deleted_at`

## Payment method fields used by the app

- `id`
- `user_id`
- `name`
- `type`
- `credit_limit`
- `due_day`
- `closing_day`
- `created_at`
- `updated_at`
- `deleted_at`

The application has backward-compatible fallbacks for older environments that do not have all optional payment-method fields. The current committed schema includes credit-card limit and due/closing day support, but does not define an `is_default` column for payment methods.

## Transaction fields used by the app

- `id`
- `user_id`
- `amount`
- `category_id`
- `date`
- `description` — application-layer encrypted with a deterministic IV (`lib/crypto/field-encryption.ts`) so equality lookups (subscription grouping) still work; never plaintext at rest.
- `kind`
- `installment_group_id`
- `installment_number`
- `installment_total`
- `advanced_to_month`
- `advanced_at`
- `notes` — application-layer encrypted (`lib/crypto/field-encryption.ts`), random IV; never plaintext at rest.
- `goal_id` — optional goal funded by a saving transaction.
- `personal_debt_id` — optional personal debt paid by an expense transaction.
- `payment_method_id`
- `created_at`
- `updated_at`
- `deleted_at`

Installments and subscriptions are modeled as multiple transaction rows. Installment rows from the same original purchase share `installment_group_id`, use 1-based `installment_number`, and store the original purchase count in `installment_total`. Installment groups are still user-owned transaction rows and must always be queried with the authenticated user's scope.

Installment prepayment uses `advanced_to_month` and `advanced_at`. The original transaction `date`, category, payment method, and installment metadata are preserved for auditability. Payment and invoice views use `advanced_to_month` as the payment context so advanced installments appear in the target month and no longer appear as future obligations.

Subscription rows use `notes` values beginning with `subscription`; paused subscriptions use `subscription paused`. Since `notes` is stored encrypted, this prefix check happens in application code against the decrypted value (`lib/finance/transactions.ts`), not as a SQL `LIKE` predicate.

## Monthly budget fields in the schema

- `id`
- `user_id`
- `month`
- `income`
- `needs_limit`
- `wants_limit`
- `savings_limit`
- `created_at`
- `updated_at`
- `deleted_at`

The current UI calculates 50/30/20 budget data from transactions and category limits. The `monthly_budgets` table is available in the schema for persisted monthly budget plans.

## Goal fields used by the app

- `id`
- `user_id`
- `name`
- `icon`
- `target_amount`
- `current_amount`
- `deadline`
- `color`
- `created_at`
- `updated_at`
- `deleted_at`

`lib/finance/transactions.ts` calls `record_goal_contribution` when adding funds. The RPC locks the goal, caps the amount to the remaining target, inserts the linked saving transaction, and updates the goal atomically.
Goals are created with zero progress, and editing goal metadata never changes progress. All progress changes therefore go through the contribution RPC and remain linked to the savings ledger.

Personal debt repayments are written only through `record_personal_debt_payment`. Authenticated clients have read-only access to repayment rows; the security-definer RPC caps the amount and creates the linked expense transaction in the same database operation. The transaction owner trigger validates category, payment method, goal, and personal-debt references against `transactions.user_id`.

## Privacy request fields in the schema

- `id`
- `user_id`
- `request_type`
- `status`
- `details`
- `response`
- `requested_at`
- `resolved_at`
- `updated_at`

The table supports LGPD workflows for access, export, correction, deletion, consent, and support requests.

## Database functions and triggers

- `private.handle_new_user()` creates a profile, default categories, and default payment methods after Supabase Auth user creation.
- `private.touch_updated_at()` keeps `updated_at` current on updates.
- `private.validate_transaction_owner_refs()` prevents transactions from referencing categories or payment methods owned by another user.
- `on_auth_user_created` runs after inserts on `auth.users`.

Email/password signups and Google OAuth signups both insert users into `auth.users`, so both flows use the same `on_auth_user_created` onboarding trigger. Do not duplicate default profile, category, or payment-method setup in frontend code.

Migration `011` changes only the onboarding function used for future signups. Existing categories and payment methods remain untouched because they are user-owned financial records. A future opt-in migration assistant can map older defaults without silently changing personal data.

## Applying migrations

Preferred:

```bash
supabase db push
```

Fallback:

Apply the SQL files in `supabase/migrations` through the Supabase SQL editor.

## Security requirements

- Kontro is multi-user but not collaborative: each authenticated user owns a private, independent financial dataset.
- Keep RLS enabled on exposed user-owned tables.
- Force RLS where the current migrations force it.
- Policies should restrict rows by the authenticated user's ID and should be operation-specific when possible.
- Test every new user-owned table with two authenticated identities and prove that cross-user reads and writes fail.
- Do not grant broad public write access.
- Keep unauthenticated `anon` access revoked for user-owned finance data.
- Do not expose service-role credentials to the application frontend.
- Keep privileged helper functions out of exposed schemas.
