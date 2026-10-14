---
name: kontro-nextjs-feature
description: Build Kontro features in Next.js and React using the project's Server Action, validation, component, accessibility, chart, and internationalization conventions.
---

# Kontro Next.js feature work

Read `docs/architecture.md` and inspect the nearest route, action, component, and test before editing.

- Prefer Server Components. Add a Client Component only for browser state or interaction.
- Keep reads and finance rules in `lib/finance/`; keep mutations in validated Server Actions.
- Treat all client input as untrusted. Parse with Zod, authenticate, verify ownership, mutate, then revalidate the smallest affected path.
- Reuse existing shadcn/Radix primitives and design tokens. Preserve keyboard support, focus behavior, labels, contrast, loading, empty, and error states.
- Put every visible string through the existing i18n layer. Format currency and dates with the shared helpers.
- Charts need a textual summary or accessible equivalent and must not rely on color alone.
- Avoid exposing private data through client bundles, URLs, logs, analytics, or error messages.

Implement the smallest vertical slice and add tests at the lowest layer that proves the behavior. Add an end-to-end test only for a critical user journey.
