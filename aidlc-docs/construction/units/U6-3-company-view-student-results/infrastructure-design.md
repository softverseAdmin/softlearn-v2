# Infrastructure design: U6-3-company-view-student-results

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for returning company-visible student result summaries consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for company result-view experience refinements

## External services

- None required for the baseline company-side student-results view
- Analytics, notification, and external reporting services are out of scope for this unit

## Deployment impact

- Local-first development must support protected company-side result-summary reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, privacy expectations, consent-aware access, and auditability.
- Company-side result-view behavior must remain compatible with later privacy-filter, candidate-review, and readiness-sensitive workflows.

## Database impact

- The baseline relies on structured learning-summary and exam-results-summary evidence tied to a student plus authorization and visibility state tied to company access context.
- Later privacy-filter, readiness, and candidate-review features should consume the same company-view baseline rather than inventing parallel result-sharing models.
- The unit should not create readiness-score records or override privacy settings directly.
