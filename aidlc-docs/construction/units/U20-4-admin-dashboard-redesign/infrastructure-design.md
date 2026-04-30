# Infrastructure design: U20-4-admin-dashboard-redesign

## Infrastructure impact

- No new infrastructure tier is required for this unit.
- The redesign stays within the existing Django API and React frontend running in the local-first architecture.
- No new background workers, services, or deployment topology changes are introduced.

## Environment variables

- No new environment variables are required for the admin dashboard redesign.

## External services

- No external analytics, billing, or AI providers are introduced in this unit.
- Revenue remains unavailable until a real billing integration exists.

## Deployment impact

- Deployment flow remains unchanged.
- Frontend asset output may change because of new dashboard components, but the app should remain buildable through the existing Vite flow.

## Database impact

- Database changes are not required for this unit.
- Admin stats, activity, and system-status values should be derived from existing deterministic user, company, vacancy, interview, and notification records.
