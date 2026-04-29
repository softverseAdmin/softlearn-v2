# NFR requirements: U6-5-readiness-score-calculation

## Security

- Readiness-score calculation must run in a protected, auditable context.
- Source learning and exam evidence plus readiness factors must not be exposed through unauthorized access paths.

## Privacy

- Readiness scoring must respect the protected nature of student learning and exam evidence.
- Downstream sharing of readiness outcomes must not bypass later privacy and visibility controls.

## Performance

- Readiness-score evaluation should complete responsively enough to support understandable student guidance and downstream workflows.
- The evaluation path should avoid unstable delays that make readiness state ambiguous.

## Reliability

- The same eligible evidence set and rule configuration should produce the same readiness outcome.
- Conflicting readiness records or inconsistent reevaluation for the same evidence should be prevented.

## Accessibility

- Later user-facing communication of readiness outcomes and explanations should be based on clear, structured scoring states.
- Failure and unavailable-readiness outcomes should be representable understandably without exposing protected internals.

## Maintainability

- Readiness scoring should build on the shared learning, exam, privacy, explainability, and audit baselines.
- The unit should stay focused on deterministic readiness calculation rather than absorbing company-visibility rules or full match scoring logic.
