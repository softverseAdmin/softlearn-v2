# NFR design: U9-3-exam-score-matching

## How NFRs are addressed

- Security is addressed by treating exam-score matching as a protected backend evaluation using structured student exam and vacancy data.
- Privacy is addressed by keeping student exam evidence protected and deferring outward visibility to later approved matched-view units.
- Performance is addressed by focusing on predictable factor-level evaluation timing.
- Reliability is addressed through deterministic relevance comparison rules and duplicate-prevention expectations.
- Accessibility is addressed by requiring relevant-exam and missing-evidence outputs to remain clearly representable.
- Maintainability is addressed by keeping exam-score matching separate from other factors and aggregate scoring while reusing the shared exam baseline.

## Tradeoffs

- Keeping exam-match rules high-level preserves flexibility for later implementation, but later teams must document exact relevance mapping and score-band behavior clearly.
- Reusing protected exam evidence improves explainability and consistency, though later teams may need richer mapping conventions for different assessment types.

## Monitoring

- Later implementation should monitor missing exam evidence, duplicate factor evaluations, unsupported relevance mappings, and unusual low-evidence patterns.
- Later aggregate-score and matched-view units should confirm they consume the same exam-fit baseline rather than inventing alternate exam-matching logic.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Check that exam-score matching remains deterministic, explainable, protected, and separate from other factors and aggregate scoring.
- Check that protected exam data cannot leak through unauthorized factor outputs.
- Run `./scripts/aidlc-check.sh`.
