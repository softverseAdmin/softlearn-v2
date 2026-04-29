# Infrastructure design: U20-3-company-dashboard-redesign

## Infrastructure impact

- No new infrastructure tier is required for this unit.
- The redesign stays within the existing Django API and React frontend running in the local-first architecture.
- No new deployment target, background worker, or external service is introduced.

## Environment variables

- No new environment variables are required for the company dashboard redesign.

## External services

- No external analytics, charting, or AI providers are permitted.
- Existing links continue to resolve within the current application routes only.

## Deployment impact

- Deployment flow remains unchanged.
- Frontend asset output may change because of new dashboard components, but the app should remain buildable through the existing Vite flow.

## Database impact

- Database changes are not required for this unit.
- Candidate score and analytics values should be derived from existing deterministic vacancy, candidate-review, interview, notification, skill, and exam records.
- Per-vacancy applicant counts remain out of scope until the underlying application model exposes that relationship directly.
