# NFR requirements: U5-7-pass-fail-logic

## Security

- Pass/fail classification must run in a protected, auditable context.
- Outcome rules and classification-sensitive inputs must not be exposed through unauthorized access paths.

## Privacy

- Pass/fail outcomes are protected student assessment data and must respect later visibility and consent controls.
- Downstream use of pass/fail outcomes must not bypass later privacy-aware result-sharing rules.

## Performance

- Pass/fail classification should complete responsively enough to keep scored-attempt state understandable.
- The classification path should avoid unstable delays that make final outcome state ambiguous.

## Reliability

- The same eligible scored attempt and rule set should produce the same pass/fail outcome.
- Conflicting outcome records or inconsistent reclassification for the same scored attempt should be prevented.

## Accessibility

- Later user-facing communication of pass/fail outcomes should be based on clear, structured result states.
- Failure and unavailable-classification outcomes should be representable understandably without exposing protected rule internals.

## Maintainability

- Pass/fail logic should build on the shared exam-domain, security, and audit baselines.
- The unit should stay focused on outcome classification rather than absorbing score calculation, history presentation, or retake-governance logic.
