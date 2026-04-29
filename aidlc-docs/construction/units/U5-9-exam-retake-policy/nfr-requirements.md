# NFR requirements: U5-9-exam-retake-policy

## Security

- Retake eligibility evaluation must run in a protected, auditable context.
- Eligibility rules and attempt-history inputs must not be exposed through unauthorized access paths.

## Privacy

- Retake-policy decisions rely on protected student assessment history and must respect privacy and consent rules.
- Downstream use of retake-policy outcomes must not bypass later visibility controls.

## Performance

- Retake eligibility evaluation should complete responsively enough to keep exam-access decisions understandable.
- The decision path should avoid unstable delays that make access state ambiguous.

## Reliability

- The same student, exam, attempt history, and rule set should produce the same retake outcome.
- Conflicting eligibility decisions or inconsistent reevaluation for the same conditions should be prevented.

## Accessibility

- Later user-facing communication of retake eligibility outcomes should be based on clear, structured decision states.
- Ineligible or unavailable outcomes should be representable understandably without exposing protected rule internals.

## Maintainability

- Retake policy should build on the shared exam-domain, security, privacy, and audit baselines.
- The unit should stay focused on eligibility policy rather than absorbing history presentation, score calculation, or company-facing visibility logic.
