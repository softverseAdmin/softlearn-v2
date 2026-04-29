# NFR design: U9-4-language-level-matching

## How NFRs are addressed

- Security is addressed by treating language-level matching as a protected backend evaluation using structured student and vacancy language data.
- Privacy is addressed by keeping student language evidence protected and deferring outward visibility to later approved matched-view units.
- Performance is addressed by focusing on predictable factor-level evaluation timing.
- Reliability is addressed through deterministic threshold comparison rules and duplicate-prevention expectations.
- Accessibility is addressed by requiring language-fit outputs to remain clearly representable.
- Maintainability is addressed by keeping language-level matching separate from other factors and aggregate scoring while reusing the shared language model.

## Tradeoffs

- Keeping language-match rules high-level preserves flexibility for later implementation, but later teams must document exact threshold semantics and multi-language behavior clearly.
- Using a shared structured language model improves explainability and consistency, though it may require later normalization rules for edge cases.

## Monitoring

- Later implementation should monitor malformed level comparisons, missing language data, duplicate factor evaluations, and unusual threshold-gap patterns.
- Later aggregate-score and matched-view units should confirm they consume the same language-fit baseline rather than inventing alternate language logic.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Check that language-level matching remains deterministic, explainable, protected, and separate from other factors and aggregate scoring.
- Check that protected student language data cannot leak through unauthorized factor outputs.
- Run `./scripts/aidlc-check.sh`.
