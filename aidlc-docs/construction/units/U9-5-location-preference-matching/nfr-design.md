# NFR design: U9-5-location-preference-matching

## How NFRs are addressed

- Security is addressed by treating location-preference matching as a protected backend evaluation using structured student and vacancy location data.
- Privacy is addressed by keeping student preference evidence protected and deferring outward visibility to later approved matched-view units.
- Performance is addressed by focusing on predictable factor-level evaluation timing.
- Reliability is addressed through deterministic compatibility comparison rules and duplicate-prevention expectations.
- Accessibility is addressed by requiring location-fit outputs to remain clearly representable.
- Maintainability is addressed by keeping location-preference matching separate from other factors and aggregate scoring while reusing the structured location baseline.

## Tradeoffs

- Keeping location-match rules high-level preserves flexibility for later implementation, but later teams must document exact remote, hybrid, and relocation compatibility semantics clearly.
- Using structured work-style inputs improves explainability and consistency, though it may require later normalization rules for edge cases.

## Monitoring

- Later implementation should monitor malformed location comparisons, missing preference data, duplicate factor evaluations, and unusual mismatch patterns.
- Later aggregate-score and matched-view units should confirm they consume the same location-fit baseline rather than inventing alternate location logic.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Check that location-preference matching remains deterministic, explainable, protected, and separate from other factors and aggregate scoring.
- Check that protected student preference data cannot leak through unauthorized factor outputs.
- Run `./scripts/aidlc-check.sh`.
