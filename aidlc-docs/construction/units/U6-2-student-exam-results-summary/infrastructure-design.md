# Infrastructure design: U6-2-student-exam-results-summary

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for returning student-owned exam-results summaries consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for exam-results-summary experience refinements

## External services

- None required for the baseline student exam-results-summary flow
- Analytics, notification, and external reporting services are out of scope for this unit

## Deployment impact

- Local-first development must support protected exam-results-summary reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-ownership posture, privacy expectations, and protected summary-access behavior.
- Exam-results-summary behavior must remain compatible with later visibility-sensitive and readiness-sensitive workflows.

## Database impact

- The baseline relies on structured **ExamAttempt**, score, and pass/fail outcome data tied to the student and exam context.
- Later visibility, readiness, and result-sharing features should consume the same exam-results-summary evidence rather than inventing parallel assessment-summary models.
- The unit should not create company-visibility or readiness-score records directly.
