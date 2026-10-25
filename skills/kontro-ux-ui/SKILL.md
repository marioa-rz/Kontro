---
name: kontro-ux-ui
description: Design or review Kontro user experiences, visual hierarchy, responsive layouts, accessible forms, dashboard density, and design-token changes. Use for UX/UI, mobile usability, color palettes, dashboard simplification, or accessibility work.
---

# Kontro UX/UI

Use this skill when a task changes how people understand, navigate, or visually scan Kontro.

## Before editing

1. Read `docs/architecture.md` and inspect the current screen on mobile and desktop.
2. Identify the user's primary decision on that screen. Put the information required for that decision first.
3. Reuse the existing component system, i18n helpers, and semantic design tokens.

## Product principles

- Prefer real currency amounts and plain-language status over abstract percentages.
- Use charts only when they reveal a pattern that rows, totals, or progress bars cannot explain faster.
- Apply progressive disclosure: show the common path first and advanced detail only when requested.
- Keep financial semantics stable: income is positive green, debt or overspending is destructive red, and the rose/pink brand palette frames the interface without changing those meanings.
- Design mobile-first. Primary actions and touch targets must be at least 44 by 44 CSS pixels.
- Every screen needs useful loading, empty, error, and success states.
- Do not encode meaning with color alone; pair it with labels and amounts.

## Implementation checks

- Keep business calculations in `lib/finance`, not React components.
- Use design tokens in `app/globals.css`; avoid one-off brand colors in components.
- Keep keyboard focus visible, labels associated with controls, and contrast readable in light and dark modes.
- Verify the smallest relevant component tests, then lint, type/build, and inspect mobile and desktop layouts before delivery.
