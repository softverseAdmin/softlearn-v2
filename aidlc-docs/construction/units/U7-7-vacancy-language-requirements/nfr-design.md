# NFR design: U7-7-vacancy-language-requirements

## How NFRs are addressed

- Security is addressed by requiring authenticated company-bound access and audit-friendly handling of language-requirement update attempts.
- Privacy is addressed by keeping vacancy language requirements in the company-owned vacancy domain and preserving controlled visibility for non-public vacancies.
- Performance is addressed by focusing on responsive requirement-management flows and predictable validation feedback.
- Reliability is addressed through stable language-requirement outcomes, shared-model integrity, and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear required-versus-preferred states and understandable minimum-level validation feedback.
- Maintainability is addressed by keeping language requirements separate from skill, location, and matching while reusing existing vacancy and language-model baselines.

## Tradeoffs

- Keeping language requirements high-level preserves flexibility for later implementation, but later teams must document exact language taxonomy, level translation, and priority behavior clearly.
- Enforcing shared structured language expectations improves matching consistency, though later authoring UX must make level selection intuitive enough for company users.

## Monitoring

- Later implementation should monitor invalid language references, malformed level combinations, duplicate requirement attempts, unauthorized edits, and unusual taxonomy-mismatch patterns.
- Later search and matching units should confirm they consume the same structured language baseline rather than inventing alternate vacancy-language models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and shared-language-model baselines.
- Check that vacancy language requirements remain protected, vacancy-linked, and separate from skill, location, and matching behavior.
- Check that foreign-company access and free-text-only language drift are excluded from the baseline.
- Run `./scripts/aidlc-check.sh`.
