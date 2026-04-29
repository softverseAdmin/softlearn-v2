# NFR design: U7-8-vacancy-location-settings

## How NFRs are addressed

- Security is addressed by requiring authenticated company-bound access and audit-friendly handling of location-setting update attempts.
- Privacy is addressed by keeping vacancy location settings in the company-owned vacancy domain and preserving controlled visibility for non-public vacancies.
- Performance is addressed by focusing on responsive requirement-management flows and predictable validation feedback.
- Reliability is addressed through stable location-setting outcomes, structured work-style integrity, and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear location and work-style states and understandable validation feedback.
- Maintainability is addressed by keeping location settings separate from skill, language, and matching while reusing existing vacancy baselines.

## Tradeoffs

- Keeping location settings high-level preserves flexibility for later implementation, but later teams must document exact remote, hybrid, relocation, and multi-location rules clearly.
- Enforcing structured location settings improves search and matching consistency, though later authoring UX must make complex work-style combinations understandable enough for company users.

## Monitoring

- Later implementation should monitor malformed location combinations, duplicate setting attempts, unauthorized edits, and unusual work-style conflict patterns.
- Later search and matching units should confirm they consume the same structured location baseline rather than inventing alternate vacancy-location models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that vacancy location settings remain protected, vacancy-linked, and separate from skill, language, and matching behavior.
- Check that foreign-company access and free-text-only location drift are excluded from the baseline.
- Run `./scripts/aidlc-check.sh`.
