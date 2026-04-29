# NFR design: U7-6-vacancy-skill-tags

## How NFRs are addressed

- Security is addressed by requiring authenticated company-bound access and audit-friendly handling of skill-requirement update attempts.
- Privacy is addressed by keeping vacancy skill tags in the company-owned vacancy domain and preserving controlled visibility for non-public vacancies.
- Performance is addressed by focusing on responsive requirement-management flows and predictable validation feedback.
- Reliability is addressed through stable skill-requirement outcomes, shared-taxonomy integrity, and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear required-versus-preferred states and understandable validation feedback.
- Maintainability is addressed by keeping skill tags separate from language, location, and matching while reusing existing vacancy and taxonomy baselines.

## Tradeoffs

- Keeping skill requirements high-level preserves flexibility for later implementation, but later teams must document exact proficiency, weight, and taxonomy-management behavior clearly.
- Enforcing shared structured skills improves matching consistency, though later authoring UX must make taxonomy selection easy enough for company users.

## Monitoring

- Later implementation should monitor invalid skill references, duplicate requirement attempts, unauthorized edits, and unusual taxonomy-mismatch patterns.
- Later search and matching units should confirm they consume the same structured skill baseline rather than inventing alternate vacancy-skill models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and taxonomy baselines.
- Check that vacancy skill tags remain protected, vacancy-linked, and separate from language, location, and matching behavior.
- Check that foreign-company access and free-text-only skill drift are excluded from the baseline.
- Run `./scripts/aidlc-check.sh`.
