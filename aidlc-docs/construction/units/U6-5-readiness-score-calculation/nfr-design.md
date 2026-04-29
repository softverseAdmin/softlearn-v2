# NFR design: U6-5-readiness-score-calculation

## How NFRs are addressed

- Security is addressed by treating readiness-score calculation as a protected backend action with audit-friendly handling of evidence-sensitive inputs and derived factors.
- Privacy is addressed by keeping source evidence and derived readiness outcomes inside protected assessment and learning boundaries unless later visibility rules allow sharing.
- Performance is addressed by focusing on predictable evaluation timing and stable readiness outcomes.
- Reliability is addressed through deterministic rule application, duplicate-prevention, and consistent use of protected source summaries.
- Accessibility is addressed by requiring readiness outcomes and explanation factors to remain representable clearly in later user-facing contexts.
- Maintainability is addressed by keeping readiness scoring separate from company-visibility rules and full vacancy matching while reusing the rule-based matching baseline.

## Tradeoffs

- Keeping readiness scoring high-level preserves flexibility for later implementation, but later teams must document exact weights, factor bands, and explanation text rules explicitly.
- Requiring rule-based explainable scoring improves trust and auditability, though it constrains later teams from introducing opaque ranking logic under this baseline.

## Monitoring

- Later implementation should monitor failed readiness evaluations, missing evidence inputs, duplicate-calculation attempts, and unusual score-distribution patterns.
- Later matching and visibility units should confirm they consume the same readiness baseline rather than inventing alternate hidden readiness models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, privacy, and rule-based matching baselines.
- Check that readiness scoring remains deterministic, explainable, protected, and separate from company-visibility rules and full match logic.
- Check that hidden source evidence cannot leak through readiness outputs beyond allowed contexts.
- Run `./scripts/aidlc-check.sh`.
