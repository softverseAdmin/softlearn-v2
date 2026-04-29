# NFR design: U7-3-vacancy-delete

## How NFRs are addressed

- Security is addressed by requiring authenticated company-bound access and audit-friendly handling of vacancy-removal attempts.
- Privacy is addressed by keeping vacancy deletion in the company-owned domain and preserving controlled internal record behavior.
- Performance is addressed by focusing on responsive removal actions and predictable confirmation feedback.
- Reliability is addressed through stable removal outcomes, preserved company-link integrity, and prevention of conflicting active states.
- Accessibility is addressed by requiring clear confirmation structure and understandable removal and blocked-state feedback.
- Maintainability is addressed by keeping vacancy deletion separate from listing, requirement tags, applications, and matching while reusing existing company and route baselines.

## Tradeoffs

- Keeping vacancy removal high-level preserves flexibility for later implementation, but later teams must document exact soft-delete, archive, or recovery behavior clearly.
- Enforcing controlled vacancy withdrawal improves auditability, though later workflows must define how removal interacts with applications and notifications explicitly.

## Monitoring

- Later implementation should monitor failed vacancy-removal validations, unauthorized delete attempts, cross-company access attempts, and unusual repeat-delete patterns.
- Later listing, detail, and search units should confirm they consume the same active-versus-removed vacancy baseline rather than inventing alternate availability states.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, routing, and company-boundary baselines.
- Check that vacancy deletion remains protected, company-owned, and separate from listing, detail, and requirement-tag behavior.
- Check that student and foreign-company access are excluded from removal behavior.
- Run `./scripts/aidlc-check.sh`.
