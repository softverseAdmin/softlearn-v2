# NFR design: U9-2-course-completion-matching

## How NFRs are addressed

- Security is addressed by treating course-completion matching as a protected backend evaluation using structured student learning and vacancy data.
- Privacy is addressed by keeping student learning evidence protected and deferring outward visibility to later approved matched-view units.
- Performance is addressed by focusing on predictable factor-level evaluation timing.
- Reliability is addressed through deterministic relevance comparison rules and duplicate-prevention expectations.
- Accessibility is addressed by requiring relevant-learning and missing-evidence outputs to remain clearly representable.
- Maintainability is addressed by keeping course-completion matching separate from other factors and aggregate scoring while reusing the shared learning baseline.

## Tradeoffs

- Keeping learning-match rules high-level preserves flexibility for later implementation, but later teams must document exact relevance mapping behavior clearly.
- Reusing protected learning evidence improves explainability and consistency, though later teams may need richer mapping conventions for complex roles.

## Monitoring

- Later implementation should monitor missing completion evidence, duplicate factor evaluations, unsupported relevance mappings, and unusual low-evidence patterns.
- Later aggregate-score and matched-view units should confirm they consume the same learning-fit baseline rather than inventing alternate course-completion logic.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Check that course-completion matching remains deterministic, explainable, protected, and separate from other factors and aggregate scoring.
- Check that protected learning data cannot leak through unauthorized factor outputs.
- Run `./scripts/aidlc-check.sh`.
