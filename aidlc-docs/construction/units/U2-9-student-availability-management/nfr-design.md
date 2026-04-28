# NFR design: U2-9-student-availability-management

## How NFRs are addressed

- Security is addressed by authenticated self-service ownership and protected-write validation for availability records.
- Privacy is addressed by treating student availability as protected student data and limiting this unit to the student’s own management flow.
- Performance is addressed by keeping availability-management scope narrow and feature-local.
- Reliability is addressed through stable handling of malformed scheduling input, conflicting values, and predictable availability presence indicators.
- Accessibility is addressed by requiring understandable readiness and availability controls, validation feedback, and clear empty-state behavior.
- Maintainability is addressed by keeping availability separate from later interview scheduling and privacy-policy detail while aligning it with the shared frontend and authorization baselines.

## Tradeoffs

- Structured availability records improve reuse across the product, but they require more explicit validation than a single free-text availability note.
- Keeping availability state mostly local to the feature reduces shared-state complexity, though later cross-route summaries may need a carefully scoped derived view.
- Deferring real scheduling and calendar integration keeps this unit reviewable, but later interview workflows must complete those operational details explicitly.

## Monitoring

- Later implementation should monitor failed availability updates, repeated validation errors, and mismatches between stored availability state and profile-completeness indicators.
- Later privacy reviews should confirm company/admin access to student availability is policy-gated and auditable where required.
- Later scheduling units should confirm they consume this baseline without redefining ownership or duplicating availability logic.

## Testing approach

- Review the unit against the data-model, security, matching, RBAC, frontend foundation, routing, state, and layout baselines.
- Check that availability management remains structured, self-service, and separate from interview scheduling and privacy-policy logic.
- Check that profile-completeness and readiness expectations are documented clearly.
- Run `./scripts/aidlc-check.sh`.
