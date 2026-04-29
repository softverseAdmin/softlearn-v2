# Functional design: U17-3-admin-dashboard

## Purpose

Define the baseline admin-dashboard flow so authorized admins can review protected high-level platform health and operational summaries without bypassing domain-specific admin controls.

## User story

As an admin, I need a dashboard so I can understand high-level platform activity and operational hotspots without manually inspecting every management area.

## Functional requirements

### 1. Admin-dashboard scope

- This unit covers admin dashboard only.
- The baseline should support:
  - presenting a protected admin summary across users, companies, courses, exams, vacancies, and operational alerts
  - showing lightweight aggregated metrics and recent admin-relevant items rather than heavy analytics
  - linking back to deeper protected admin-management areas for detailed action
  - returning stable outcomes when some dashboard sections have no current data
- heavy analytics, cross-environment observability tooling, AI recommendations, advanced customization, and external BI tools remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated admins may access the admin dashboard.
- Admin-dashboard content must remain protected and must not widen admin powers beyond documented policy.
- Dashboard summaries must respect privacy, consent, and audit expectations even for admin users.
- Dashboard metric generation should remain auditable because admin actions can affect broad platform data.

### 3. Admin-dashboard behavior

- The dashboard should provide lightweight aggregated metrics such as user counts, company activity, content counts, vacancy volume, and open operational concerns where policy allows them.
- Dashboard cards should direct admins back to deeper protected admin-management views rather than replacing them.
- Metric definitions should remain deterministic and explainable.
- This unit must not introduce heavy analytics engines or unrestricted raw-data browsing.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific dashboard routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for any dashboard filter or state-changing browser request.
- Dashboard state should prefer lightweight aggregation and local page state rather than heavy analytics orchestration.
- Metric definitions should stay deterministic and auditable so later teams can trust dashboard summaries.

### 5. Relationship to later units

- U18 admin-management units provide the detailed protected actions that the dashboard may summarize or link to later.
- U17-4 analytics summary remains separate and should not be merged into the admin-dashboard core.
- Privacy, consent, and role-permission units continue to govern what underlying data may be surfaced even to admins.
- Production-readiness units may later add operational signal sources without redefining the admin-dashboard purpose.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U15-1 notification-core
- U16-1 role-permissions
- U18-1 manage-users
- U18-2 manage-companies
- U18-3 manage-courses
- U18-4 manage-exams
- U18-5 manage-vacancies

## Outputs

- Baseline protected admin-dashboard model
- Lightweight operational and platform-summary expectations
- Integration expectations for analytics summary and admin-management views

## User flow

1. An authorized admin opens the protected admin dashboard area.
2. Backend gathers lightweight summaries from approved user, company, course, exam, vacancy, notification, and operational sources.
3. The platform returns deterministic dashboard metrics and recent admin-relevant summaries.
4. The admin uses dashboard cards to navigate back to deeper protected management areas.
5. Later analytics and operational units reuse the same admin-dashboard baseline.

## Acceptance criteria

- Admin dashboard behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Heavy analytics engines, and AI recommendations.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Heavy analytics engines
- AI recommendations
- External BI integrations
- Unrestricted raw-data browsing
