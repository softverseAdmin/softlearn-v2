# Infrastructure design: U5-7-pass-fail-logic

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend outcome-classification behavior for scored exam attempts consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for pass/fail rule refinements

## External services

- None required for the baseline pass/fail flow
- External grading, analytics, or notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected pass/fail classification behavior against scored attempts and approved rule inputs.
- Later AWS-compatible deployment should preserve the same deterministic outcome posture, auditability expectations, and protected assessment boundaries.
- Pass/fail behavior must remain compatible with later history, readiness, retake, and privacy-aware results workflows.

## Database impact

- The baseline relies on structured scored-attempt data and explicit exam-linked outcome rules so pass/fail outcomes can be derived consistently.
- Later history, retake, readiness, and results features should consume the same pass/fail outcome rather than recalculating conflicting classifications independently.
- The unit should not create company-visibility or retake-policy records directly.
