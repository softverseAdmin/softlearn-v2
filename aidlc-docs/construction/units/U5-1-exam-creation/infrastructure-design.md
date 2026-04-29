# Infrastructure design: U5-1-exam-creation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected exam-definition persistence behavior that later backend management services and protected authoring routes must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for exam-authoring workflow refinements

## External services

- None required for the baseline exam-creation flow
- Proctoring, notification, or analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected exam-creation reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same controlled authoring posture, auditability expectations, and admin protection rules.
- Exam-definition behavior must remain compatible with the shared exam architecture and later student-delivery workflows.

## Database impact

- The baseline relies on a structured **Exam** record that later **Question**, **AnswerOption**, **ExamAttempt**, and **ExamAnswer** records can reference.
- Later scoring, pass/fail, history, and results features should consume the same exam identity rather than recomputing conflicting assessment definitions independently.
- The unit should not create student attempt, score, or company-visibility records directly.
