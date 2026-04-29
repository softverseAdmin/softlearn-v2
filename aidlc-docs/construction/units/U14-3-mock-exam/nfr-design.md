# NFR design: U14-3-mock-exam

## How NFRs are addressed

- Security is addressed by requiring authenticated, role-appropriate handling tied to existing authorization and session baselines.
- Privacy is addressed by keeping mock exam within approved visibility, consent, and company-boundary rules where applicable.
- Performance is addressed by focusing on predictable workflow handling, lightweight aggregation where possible, and no unnecessary external dependencies.
- Reliability is addressed through deterministic rules, stable outcomes, and explicit audit or history behavior where the workflow changes state.
- Accessibility is addressed by requiring clear later representation of protected states, outcomes, and empty or restricted conditions.
- Maintainability is addressed by keeping this unit narrow and reusing shared platform baselines instead of redefining adjacent domain logic.

## Tradeoffs

- Keeping this unit narrow improves clarity and reviewability, but later teams must connect adjacent workflows without bypassing the boundaries defined here.
- Reusing shared authorization, API, and lifecycle baselines improves consistency, though later implementation must still document final data shapes carefully.

## Monitoring

- Later implementation should monitor unauthorized access attempts, policy violations, invalid state changes, and missing audit evidence related to this unit.
- Adjacent units should confirm they consume the records, summaries, or transitions defined here instead of inventing conflicting behavior.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and adjacent domain baselines listed in the functional design.
- Check that the unit remains deterministic, auditable, and scoped correctly.
- Check that access, privacy, and relationship boundaries are preserved.
- Run `./scripts/aidlc-check.sh`.
