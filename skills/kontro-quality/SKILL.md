---
name: kontro-quality
description: Verify Kontro changes with risk-based tests, static checks, build validation, and concise evidence. Use before a pull request, release, or claim that work is complete.
---

# Kontro quality gates

Choose checks by affected risk, then run the full required gate before a pull request:

```bash
corepack pnpm run lint
corepack pnpm run test:coverage
corepack pnpm run build
```

Also run focused tests while iterating. Use Playwright for changed critical journeys and validate Supabase migrations locally when schema or RLS changes.

If Turbopack cannot build because the execution environment forbids its helper port, record that limitation and use `corepack pnpm exec next build --webpack` as a compiler/type/build fallback. Do not describe the fallback as proof that Turbopack itself works.

Report exact commands, pass/fail counts, relevant warnings, and anything not executed. A failure must be reproduced and understood before changing code.
