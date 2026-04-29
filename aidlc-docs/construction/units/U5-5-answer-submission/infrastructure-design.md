# Infrastructure design: U5-5-answer-submission

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for persisting student exam attempts and answers consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for answer-submission workflow refinements

## External services

- None required for the baseline answer-submission flow
- Proctoring, analytics, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected exam-attempt submission behavior between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-ownership posture, submission traceability, and exam-integrity expectations.
- Answer-submission behavior must remain compatible with the shared exam architecture and later scoring, results, and retake workflows.

## Database impact

- The baseline relies on structured **ExamAttempt** and **ExamAnswer** records tied to the student, exam, and question context.
- Later scoring, pass/fail, history, and results features should consume the same submitted-attempt records rather than inventing parallel attempt data.
- The unit should not create score, pass/fail, history-summary, or company-visibility records directly.
