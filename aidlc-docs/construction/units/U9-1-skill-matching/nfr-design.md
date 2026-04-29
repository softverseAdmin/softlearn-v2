# NFR design: U9-1-skill-matching

## How NFRs are addressed

- Security is addressed by treating skill matching as a protected backend evaluation using structured student and vacancy data.
- Privacy is addressed by keeping student skill data protected and deferring outward visibility to later approved matched-view units.
- Performance is addressed by focusing on predictable factor-level evaluation timing.
- Reliability is addressed through deterministic required-versus-preferred comparison rules and duplicate-prevention expectations.
- Accessibility is addressed by requiring matched-skill and missing-skill outputs to remain clearly representable.
- Maintainability is addressed by keeping skill matching separate from other factors and aggregate scoring while reusing the shared skill taxonomy.

## Tradeoffs

- Keeping skill-matching rules high-level preserves flexibility for later implementation, but later teams must document exact partial-credit and taxonomy-equivalence behavior clearly.
- Using a shared structured taxonomy improves explainability and consistency, though it may require later taxonomy-governance refinement for edge cases.

## Monitoring

- Later implementation should monitor invalid taxonomy references, missing required-skill comparisons, duplicate factor evaluations, and unusual mismatch patterns.
- Later aggregate-score and matched-view units should confirm they consume the same skill-match baseline rather than inventing alternate skill-fit logic.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Check that skill matching remains deterministic, explainable, protected, and separate from other factors and aggregate scoring.
- Check that hidden student skill data cannot leak through unauthorized factor outputs.
- Run `./scripts/aidlc-check.sh`.
