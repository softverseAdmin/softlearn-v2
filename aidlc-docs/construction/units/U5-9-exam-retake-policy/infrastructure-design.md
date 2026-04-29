# Infrastructure design: U5-9-exam-retake-policy

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend eligibility-evaluation behavior for repeat exam access consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for retake-rule refinements

## External services

- None required for the baseline retake-policy flow
- External proctoring, analytics, or notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected retake-eligibility behavior using attempt history and approved exam rule inputs.
- Later AWS-compatible deployment should preserve the same deterministic eligibility posture, auditability expectations, and protected assessment boundaries.
- Retake-policy behavior must remain compatible with later exam-access, results-summary, readiness, and privacy-aware visibility workflows.

## Database impact

- The baseline relies on structured **ExamAttempt**, score, and pass/fail outcome data plus explicit exam-linked retake rules so eligibility can be derived consistently.
- Later exam-access, results-summary, readiness, and visibility features should consume the same retake outcome rather than recalculating conflicting eligibility decisions independently.
- The unit should not create company-visibility records directly.
