---
name: kontro-delivery
description: Deliver Kontro changes through GitHub branches, Conventional Commits, pull requests, protected-main checks, releases, and Vercel promotion. Use for repository or deployment workflow tasks.
---

# Kontro delivery

Read `CONTRIBUTING.md` and the relevant workflow files under `.github/workflows/`.

- Branch from current `main` using `feat/`, `fix/`, `chore/`, `docs/`, or `refactor/` plus a short kebab-case topic.
- Keep commits focused and use Conventional Commits.
- Push the branch and open a pull request with purpose, scope, evidence, screenshots for UI work, migration/RLS notes, and rollback considerations.
- Do not push directly to `main`. Merge only after required checks and resolved conversations.
- Prefer squash merge for a focused feature branch unless preserving multiple commits has clear historical value.
- Tag releases with semantic versioning after the default branch is green.
- Treat Vercel as the web runtime and Supabase as an independent stateful dependency. Apply reviewed migrations before promoting code that requires them.
- Never place deployment tokens or Supabase secrets in the repository; use GitHub environments and encrypted secrets.

Before publishing, follow `skills/kontro-quality/SKILL.md`. After creating a pull request, link it to its issue or explain why no issue was needed.
