# NFR design: U7-2-vacancy-edit

## How NFRs are addressed

- Security is addressed by requiring authenticated company-bound access and audit-friendly handling of vacancy-update attempts.
- Privacy is addressed by keeping vacancy editing in the company-owned domain and preserving controlled visibility changes.
- Performance is addressed by focusing on responsive company management flows and predictable validation feedback.
- Reliability is addressed through stable vacancy-update outcomes, preserved vacancy identity, and unauthorized-update prevention.
- Accessibility is addressed by requiring clear form structure and understandable validation and updated-state feedback.
- Maintainability is addressed by keeping vacancy editing separate from deletion, requirement tags, listing, and matching while reusing existing company and route baselines.

## Tradeoffs

- Keeping vacancy updates high-level preserves flexibility for later implementation, but later teams must document exact editable fields, revision history, and publication-state interactions clearly.
- Enforcing company-owned controlled editing improves auditability, though later publication and moderation workflows must be defined explicitly.

## Monitoring

- Later implementation should monitor failed vacancy-update validations, unauthorized edit attempts, cross-company access attempts, and unusual repeated-update patterns.
- Later listing, detail, and matching units should confirm they consume the same updated vacancy baseline rather than inventing alternate vacancy states.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, routing, and company-boundary baselines.
- Check that vacancy editing remains protected, company-owned, and separate from deletion, listing, and requirement-tag behavior.
- Check that student and foreign-company access are excluded from authoring behavior.
- Run `./scripts/aidlc-check.sh`.
