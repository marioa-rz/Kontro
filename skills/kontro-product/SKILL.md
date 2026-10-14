---
name: kontro-product
description: Turn Kontro product ideas into scoped requirements, acceptance criteria, and an incremental roadmap. Use for discovery, prioritization, user stories, or deciding what a finance feature must do before implementation.
---

# Kontro product design

Read `docs/product/requirements.md` before changing scope or status.

For each proposed capability:

1. State the user problem and the observable outcome.
2. Define acceptance criteria with concrete examples, including empty, error, and boundary states.
3. Separate MVP behavior from later automation or AI enhancements.
4. Identify effects on transactions, reports, privacy, migrations, and historical data.
5. Update the requirements matrix when the implemented coverage changes.

Prefer a small vertical slice that the user can run and learn from. Ask for a product decision only when different answers would change persisted data, accounting semantics, privacy, or the primary workflow.

Do not encode financial rules in a UI mockup. Route those decisions through `skills/kontro-finance-domain/SKILL.md`.
