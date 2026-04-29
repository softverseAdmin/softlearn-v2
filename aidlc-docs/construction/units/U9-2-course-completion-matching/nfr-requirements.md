# NFR requirements: U9-2-course-completion-matching

## Security

- Course-completion matching must run in a protected, auditable context.
- Student learning data and vacancy context data must not be exposed through unauthorized access paths.

## Privacy

- Course-completion matching must respect the protected nature of student learning evidence.
- Downstream sharing of learning-match outcomes must not bypass later visibility controls.

## Performance

- Course-completion matching should complete responsively enough to support later aggregate matching workflows.
- The comparison path should avoid unstable delays that make factor-level state ambiguous.

## Reliability

- The same learning evidence and vacancy context should produce the same course-completion-match outcome.
- Conflicting learning-match records for the same comparison context should be prevented.

## Accessibility

- Later user-facing communication of relevant learning strengths and gaps should be based on clear, structured factor outputs.
- Missing-evidence and partial-fit states should be representable understandably.

## Maintainability

- Course-completion matching should build on the shared learning, explainability, privacy, and audit baselines.
- The unit should stay focused on this learning factor rather than absorbing other match factors or aggregate scoring.
