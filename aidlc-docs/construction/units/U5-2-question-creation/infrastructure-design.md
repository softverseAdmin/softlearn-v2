# Infrastructure design: U5-2-question-creation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected question-definition persistence behavior that later backend management services and protected authoring routes must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for question-authoring workflow refinements

## External services

- None required for the baseline question-creation flow
- Media-processing, proctoring, or analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected question-creation reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same controlled authoring posture, auditability expectations, and admin protection rules.
- Question-definition behavior must remain compatible with the shared exam architecture and later student-delivery workflows.

## Database impact

- The baseline relies on a structured **Question** record linked to an existing **Exam** so later **AnswerOption**, **ExamAttempt**, and **ExamAnswer** records can reference it consistently.
- Later scoring, pass/fail, history, and results features should consume the same question identity rather than recomputing conflicting question definitions independently.
- The unit should not create student attempt, answer submission, score, or company-visibility records directly.
