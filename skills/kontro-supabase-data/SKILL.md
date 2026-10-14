---
name: kontro-supabase-data
description: Design safe Supabase/PostgreSQL changes for Kontro, including migrations, Auth, Row Level Security, RPCs, indexes, and privacy boundaries. Use whenever persisted finance data or database access changes.
---

# Kontro Supabase data work

Read `docs/database.md`, `docs/security.md`, and only the migrations relevant to the tables being changed.

- Add forward-only, reproducible SQL migrations under `supabase/migrations`; never edit an applied migration to change production behavior.
- Every user-owned row needs an explicit owner, RLS enabled, and operation-specific policies using the authenticated user ID.
- Validate ownership for foreign keys such as category and payment method. Use constraints or triggers when the invariant must survive every client.
- Keep privileged functions in a non-exposed schema, set a safe `search_path`, minimize grants, and use atomic RPCs for balance-changing operations.
- Add indexes for real access paths, usually starting with `user_id` plus the relevant date or status column.
- Use `numeric`, not floating point, for money. Define currency and rounding outside display code.
- Never place a service-role key in browser code or use `user_metadata` for authorization.
- Plan data migration and rollback/recovery before destructive schema changes.

Verify migration order, RLS isolation for two different users, relevant constraints/RPCs, and generated TypeScript types when the project adds them.
