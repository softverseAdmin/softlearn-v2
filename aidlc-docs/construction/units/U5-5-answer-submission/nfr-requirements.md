# NFR requirements: U5-5-answer-submission

## Security

- Answer submission must enforce authenticated student ownership of the target attempt context.
- Submission processing must remain traceable and protected against unauthorized modification or replay-like conflicts.

## Privacy

- Submitted answer data and attempt records must remain visible only to the owning student and approved internal contexts.
- Submission responses must not expose correctness, score, or hidden exam internals beyond the stable submission outcome.

## Performance

- Answer submission should complete responsively enough to avoid ambiguity about whether responses were accepted.
- Validation and stable outcome feedback should return predictably during the protected exam workflow.

## Reliability

- The same valid submission should produce one stable attempt outcome.
- Duplicate finalization, malformed payloads, and unavailable-attempt conditions should return stable responses rather than conflicting attempt data.

## Accessibility

- Submission confirmation, validation errors, and interrupted-submission outcomes should be understandable and navigable.
- The student should receive clear feedback about whether responses are still local, are being submitted, or are already recorded.

## Maintainability

- Answer submission should build on the shared exam-domain, frontend, API, and session baselines.
- The unit should stay focused on attempt persistence rather than absorbing scoring, result presentation, or retake policy logic.
