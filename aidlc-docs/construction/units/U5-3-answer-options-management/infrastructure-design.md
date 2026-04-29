# Infrastructure design: U5-3-answer-options-management

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected answer-option persistence behavior that later backend management services and protected authoring routes must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for answer-authoring workflow refinements

## External services

- None required for the baseline answer-options management flow
- Media-processing, proctoring, or analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected answer-options reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same controlled authoring posture, auditability expectations, and admin protection rules.
- Answer-option behavior must remain compatible with the shared exam architecture and later student-delivery workflows.

## Database impact

- The baseline relies on structured **AnswerOption** records linked to an existing **Question** so later **ExamAnswer**, scoring, and pass/fail features can reference them consistently.
- Later submission, scoring, history, and results features should consume the same answer-option identity and correctness-ready metadata rather than recomputing conflicting option definitions independently.
- The unit should not create student attempt, answer submission, score, or company-visibility records directly.
