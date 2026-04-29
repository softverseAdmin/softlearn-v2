# NFR requirements: U9-3-exam-score-matching

## Security

- Exam-score matching must run in a protected, auditable context.
- Student exam data and vacancy context data must not be exposed through unauthorized access paths.

## Privacy

- Exam-score matching must respect the protected nature of student assessment evidence.
- Downstream sharing of exam-match outcomes must not bypass later visibility controls.

## Performance

- Exam-score matching should complete responsively enough to support later aggregate matching workflows.
- The comparison path should avoid unstable delays that make factor-level state ambiguous.

## Reliability

- The same exam evidence and vacancy context should produce the same exam-score-match outcome.
- Conflicting exam-match records for the same comparison context should be prevented.

## Accessibility

- Later user-facing communication of relevant exam strengths and gaps should be based on clear, structured factor outputs.
- Missing-evidence and partial-fit states should be representable understandably.

## Maintainability

- Exam-score matching should build on the shared exam, explainability, privacy, and audit baselines.
- The unit should stay focused on this exam factor rather than absorbing other match factors or aggregate scoring.
