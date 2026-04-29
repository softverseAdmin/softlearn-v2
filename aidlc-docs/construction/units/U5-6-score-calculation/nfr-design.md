# NFR design: U5-6-score-calculation

## How NFRs are addressed

- Security is addressed by treating score calculation as a protected backend action with audit-friendly handling of evaluation-sensitive inputs.
- Privacy is addressed by keeping raw answers and score outcomes inside protected assessment boundaries and deferring outward visibility to later units.
- Performance is addressed by focusing on predictable evaluation timing and stable scored-attempt outcomes.
- Reliability is addressed through deterministic evaluation expectations, duplicate-prevention, and consistent use of submitted-attempt data.
- Accessibility is addressed by requiring score outcomes and failure states to remain representable clearly in later user-facing contexts.
- Maintainability is addressed by keeping score calculation separate from pass/fail, history, and retake logic while reusing the shared exam-domain model.

## Tradeoffs

- Keeping score calculation high-level preserves flexibility for later implementation, but later teams must document exact weighting, partial-credit, and manual-review rules explicitly.
- Requiring deterministic evaluation improves explainability and auditability, though it constrains later teams from introducing opaque or ad hoc scoring behavior.

## Monitoring

- Later implementation should monitor failed scoring evaluations, missing scorable inputs, duplicate-scoring attempts, and unusual recalculation patterns.
- Later pass/fail, history, and readiness units should confirm they consume the same scored-attempt baseline rather than inventing alternate evaluation rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and exam-integrity baselines.
- Check that score calculation remains deterministic, protected, traceable, and separate from pass/fail and results behavior.
- Check that score-sensitive inputs are not exposed through unauthorized paths.
- Run `./scripts/aidlc-check.sh`.
