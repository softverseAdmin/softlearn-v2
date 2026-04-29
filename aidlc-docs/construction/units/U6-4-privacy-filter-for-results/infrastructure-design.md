# Infrastructure design: U6-4-privacy-filter-for-results

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend filtering behavior for company-visible student result sharing consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for result-visibility rule refinements

## External services

- None required for the baseline result privacy-filter flow
- External policy engines, analytics, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected result-filter evaluation using student privacy state, consent posture, and company access context.
- Later AWS-compatible deployment should preserve the same consent-aware visibility posture, auditability expectations, and protected result-sharing boundaries.
- Result-filter behavior must remain compatible with later company-review, matching, readiness, and visibility-sensitive workflows.

## Database impact

- The baseline relies on structured learning-summary and exam-results-summary evidence plus privacy-setting, consent, and audit-related state tied to the student and company access context.
- Later company-review, readiness, and result-sharing features should consume the same filtered-result baseline rather than inventing parallel visibility models.
- The unit should not create readiness-score records or rewrite student privacy settings directly.
