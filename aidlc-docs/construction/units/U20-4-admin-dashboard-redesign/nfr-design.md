# NFR design: U20-4-admin-dashboard-redesign

## How NFRs are addressed

- Security and role isolation stay anchored in the existing protected admin route and backend `roles=[User.Role.ADMIN]` guard.
- Privacy is preserved by using concise activity summaries instead of raw admin tables.
- Performance is addressed by keeping the redesign on one dashboard request and avoiding charts or extra dependencies.
- Accessibility is addressed through semantic sections, descriptive labels, and compact but readable spacing.
- Maintainability is addressed by isolating the redesign behind a dedicated admin dashboard component and typed response shape.

## Tradeoffs

- Revenue is represented as unavailable because the current system has no billing data source; this is preferred over fake reporting.
- The activity log is intentionally compact and summary-oriented rather than a full audit explorer.
- The status section focuses on immediately useful operational signals instead of trying to recreate a heavy analytics dashboard.

## Monitoring

- Existing frontend build and lint validation should continue to catch integration regressions.
- Backend tests should confirm the new admin dashboard response shape and unavailable-revenue handling.
- Later monitoring can add audit and billing observability when those features exist.

## Testing approach

- Update backend tests for the admin dashboard response contract.
- Build and lint the frontend after component and type changes.
- Verify empty and active platform states render useful admin summaries.
