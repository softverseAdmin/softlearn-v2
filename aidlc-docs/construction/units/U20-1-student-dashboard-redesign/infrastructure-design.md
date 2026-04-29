# Infrastructure design: U20-1-student-dashboard-redesign

## Infrastructure impact

- No new infrastructure tier is required for this unit.
- The redesign stays within the existing Django API and React frontend running in the local-first architecture.
- Frontend dependency changes are acceptable if they support the new design system without changing deployment topology.

## Environment variables

- No new environment variables are required for the student dashboard redesign.

## External services

- External learning resources may still open in new tabs, but this unit does not introduce any new third-party runtime integrations.
- No external AI or analytics providers are permitted.

## Deployment impact

- Deployment flow remains unchanged.
- Frontend asset output may change because of new styling dependencies and components, but the app should remain buildable through the existing Vite flow.

## Database impact

- Database changes are optional and should be minimized.
- If the redesigned dashboard needs additional computed response fields, prefer deriving them from existing deterministic learning and exam records before introducing new persistent tables in this unit.
