# NFR requirements: U5-6-score-calculation

## Security

- Score calculation must run in a protected, auditable context.
- Evaluation logic and correctness-sensitive inputs must not be exposed through unauthorized access paths.

## Privacy

- Raw submitted answers and evaluated score data must remain protected student assessment data.
- Downstream use of scores must not bypass later visibility and consent controls.

## Performance

- Score evaluation should complete responsively enough to support a timely protected assessment workflow.
- The evaluation path should avoid unstable delays that make attempt state ambiguous.

## Reliability

- The same eligible attempt data should produce the same score outcome.
- Conflicting score records or repeated inconsistent evaluations for the same finalized attempt should be prevented.

## Accessibility

- Later student-facing or admin-facing communication of score outcomes should be based on clear, structured evaluation states.
- Failure outcomes should be representable understandably without exposing protected evaluation internals.

## Maintainability

- Score calculation should build on the shared exam-domain, security, and audit baselines.
- The unit should stay focused on evaluation logic rather than absorbing pass/fail policy, history presentation, or retake governance.
