# Infrastructure design: U5-6-score-calculation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for scoring submitted exam attempts consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for scoring-rule refinements

## External services

- None required for the baseline score-calculation flow
- Proctoring, analytics, or external grading services are out of scope for this unit

## Deployment impact

- Local-first development must support protected scoring behavior against submitted attempts and exam definitions.
- Later AWS-compatible deployment should preserve the same deterministic evaluation posture, auditability expectations, and protected assessment boundaries.
- Score-calculation behavior must remain compatible with later pass/fail, history, readiness, and privacy-aware results workflows.

## Database impact

- The baseline relies on structured **ExamAttempt**, **ExamAnswer**, **Question**, and **AnswerOption** data so score outcomes can be derived consistently.
- Later pass/fail, history, readiness, and results features should consume the same score outcome rather than recalculating conflicting scores independently.
- The unit should not create company-visibility or retake-policy records directly.
