## Summary

Describe the user problem, what changed, and why this is the smallest useful solution.

## Acceptance Criteria

- [ ] The requested behavior is observable and covered.
- [ ] Empty, error, and boundary states were considered.

## Type of Change

- [ ] Bug fix
- [ ] Feature
- [ ] Documentation
- [ ] Security hardening
- [ ] Database migration
- [ ] Refactor
- [ ] Chore / tooling

## Testing

- [ ] `corepack pnpm run lint`
- [ ] `corepack pnpm run test:coverage`
- [ ] `corepack pnpm run build`
- [ ] `corepack pnpm run security:audit` when dependencies changed
- [ ] Manual testing completed

## Supabase / Database

- [ ] No database changes
- [ ] Migration added under `supabase/migrations`
- [ ] RLS impact reviewed

## Security Checklist

- [ ] No secrets committed
- [ ] Server Action inputs are validated
- [ ] User-owned records are scoped by authenticated user ID
- [ ] `user_metadata` is not used for authorization decisions

## Notes

Add screenshots, migration/rollback notes, risks, or reviewer context here.

## Learning Note

Name the main engineering concept this PR demonstrates and explain it in one or two sentences.
