# NFR design: U7-1-vacancy-create

## How NFRs are addressed

- Security is addressed by requiring authenticated company-bound access and audit-friendly handling of vacancy-creation attempts.
- Privacy is addressed by keeping vacancy creation in the company-owned domain and preserving controlled draft visibility.
- Performance is addressed by focusing on responsive company authoring flows and predictable validation feedback.
- Reliability is addressed through stable vacancy creation outcomes, company-link integrity, and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear form structure and understandable validation and created-state feedback.
- Maintainability is addressed by keeping vacancy creation separate from editing, requirement tags, listing, and matching while reusing existing company and route baselines.

## Tradeoffs

- Keeping vacancy definition high-level preserves flexibility for later implementation, but later teams must document exact metadata and publication-state fields clearly.
- Enforcing company-owned draft creation improves control and auditability, though later publication workflows must be defined explicitly.

## Monitoring

- Later implementation should monitor failed vacancy validations, unauthorized authoring attempts, cross-company access attempts, and unusual duplicate-creation patterns.
- Later listing, detail, and matching units should confirm they consume the same vacancy baseline rather than inventing alternate vacancy identities or visibility rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, routing, and company-boundary baselines.
- Check that vacancy creation remains protected, company-owned, and separate from editing, listing, and requirement-tag behavior.
- Check that student and foreign-company access are excluded from authoring behavior.
- Run `./scripts/aidlc-check.sh`.
