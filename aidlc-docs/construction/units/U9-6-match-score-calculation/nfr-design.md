# NFR design: U9-6-match-score-calculation

## How NFRs are addressed

- Security is addressed by treating aggregate match scoring as a protected backend evaluation that consumes structured factor outputs and protected student data.
- Privacy is addressed by keeping factor inputs and aggregate results within protected recommendation boundaries until later visibility rules allow presentation.
- Performance is addressed by focusing on predictable aggregate evaluation timing and stable ranked outputs.
- Reliability is addressed through deterministic weighting, match-level classification, and duplicate-prevention expectations.
- Accessibility is addressed by requiring match levels and explanations to remain clearly representable.
- Maintainability is addressed by keeping aggregate scoring separate from matched-list presentation while reusing the approved rule-based weighting model.

## Tradeoffs

- Keeping aggregate scoring high-level preserves flexibility for later implementation, but later teams must document exact tie-breaks and profile-completeness inputs clearly.
- Preserving a dedicated profile-completeness component keeps alignment with the inception model, though it requires later teams to define completion indicators consistently across student profile units.

## Monitoring

- Later implementation should monitor missing factor inputs, duplicate aggregate evaluations, unusual score distributions, and ranking inconsistencies.
- Later matched-view units should confirm they consume the same aggregate score baseline rather than inventing alternate weighting models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Check that aggregate match scoring remains deterministic, explainable, protected, and separate from matched-list presentation.
- Check that protected factor data cannot leak through unauthorized aggregate outputs.
- Run `./scripts/aidlc-check.sh`.
