# NFR design: U2-6-student-profile-experience

## How NFRs are addressed

- Security is addressed by authenticated self-service ownership and protected-write validation for experience records.
- Privacy is addressed by treating student experience as protected student data and limiting this unit to the student’s own management flow.
- Performance is addressed by keeping the experience-management scope narrow and feature-local.
- Reliability is addressed through stable handling of malformed entries, date validation, and predictable add/remove/update outcomes.
- Accessibility is addressed by requiring understandable entry structure, validation feedback, and empty-state behavior.
- Maintainability is addressed by keeping experience as a separate profile subdomain aligned with the shared frontend and authorization baselines.

## Tradeoffs

- Structured experience records improve reuse across the product, but they require more explicit validation than a single free-text summary.
- Keeping experience state mostly local to the feature reduces shared-state complexity, though later profile-summary views may need a carefully scoped derived view.
- Deferring richer proof or employer-verification behavior keeps this unit reviewable, but later evidence workflows may need dedicated units.

## Monitoring

- Later implementation should monitor failed experience updates, repeated validation errors, and unexpected entry-deletion failures.
- Later privacy reviews should confirm company/admin access to student experience is policy-gated and auditable where required.
- Later profile-detail units should confirm they extend this baseline without overlapping record ownership.

## Testing approach

- Review the unit against the requirements, data-model, security, RBAC, frontend foundation, routing, state, and layout baselines.
- Check that experience management remains structured, self-service, and separate from resume, privacy, and company-review units.
- Confirm validation and protected-access behavior are documented clearly.
- Run `./scripts/aidlc-check.sh`.
