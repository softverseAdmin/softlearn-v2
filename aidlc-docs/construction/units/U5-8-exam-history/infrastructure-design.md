# Infrastructure design: U5-8-exam-history

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for returning student-owned exam-attempt history consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for exam-history experience refinements

## External services

- None required for the baseline exam-history flow
- Analytics, notification, and external reporting services are out of scope for this unit

## Deployment impact

- Local-first development must support protected exam-history reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-ownership posture, privacy expectations, and protected history-access behavior.
- Exam-history behavior must remain compatible with later retake, results-summary, and visibility-sensitive workflows.

## Database impact

- The baseline relies on structured **ExamAttempt**, score, and pass/fail outcome data tied to the student and exam context.
- Later retake, results-summary, readiness, and visibility features should consume the same attempt-history records rather than inventing parallel result-summary models.
- The unit should not create retake-policy or company-visibility records directly.
