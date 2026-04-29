# NFR design: U5-7-pass-fail-logic

## How NFRs are addressed

- Security is addressed by treating pass/fail classification as a protected backend decision step with audit-friendly handling of rule-sensitive inputs.
- Privacy is addressed by keeping pass/fail outcomes inside protected assessment boundaries and deferring outward visibility to later units.
- Performance is addressed by focusing on predictable classification timing and stable outcome states.
- Reliability is addressed through deterministic rule application, duplicate-prevention, and consistent use of scored-attempt data.
- Accessibility is addressed by requiring pass/fail outcomes and unavailable-classification states to remain representable clearly in later user-facing contexts.
- Maintainability is addressed by keeping pass/fail logic separate from raw scoring, history, and retake policy while reusing the shared exam-domain model.

## Tradeoffs

- Keeping pass/fail logic high-level preserves flexibility for later implementation, but later teams must document exact threshold formulas, review paths, and exception handling explicitly.
- Requiring explicit rule-based classification improves explainability and auditability, though it limits ad hoc overrides unless those are designed carefully later.

## Monitoring

- Later implementation should monitor missing classification inputs, failed outcome evaluations, duplicate-classification attempts, and unusual reclassification patterns.
- Later history, retake, and visibility units should confirm they consume the same classified-outcome baseline rather than inventing alternate pass/fail rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and exam-integrity baselines.
- Check that pass/fail logic remains deterministic, protected, traceable, and separate from score calculation and visibility behavior.
- Check that rule-sensitive inputs are not exposed through unauthorized paths.
- Run `./scripts/aidlc-check.sh`.
