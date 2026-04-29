# Infrastructure design: U5-4-exam-taking-ui

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for rendering an active student exam-taking experience consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for exam-taking UI refinements

## External services

- None required for the baseline exam-taking UI flow
- Proctoring, analytics, and real-time monitoring services are out of scope for this unit

## Deployment impact

- Local-first development must support protected exam-loading and exam-taking route behavior between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-access posture, integrity expectations, and protected exam-delivery behavior.
- Exam-taking UI behavior must remain compatible with the shared exam architecture and later submission and results workflows.

## Database impact

- The baseline relies on structured **Exam**, **Question**, and **AnswerOption** data being available for student-facing rendering.
- Later **ExamAttempt** and **ExamAnswer** persistence should consume the same exam and question identities rather than creating parallel presentation-only definitions.
- The unit should not create score, pass/fail, history, or company-visibility records directly.
