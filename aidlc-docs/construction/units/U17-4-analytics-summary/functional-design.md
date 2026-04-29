# Functional design: U17-4-analytics-summary

## Purpose

Define the baseline analytics-summary flow so the platform can expose lightweight aggregated metrics across roles without introducing a heavy analytics engine or opaque calculations.

## User story

As the platform and as protected users, I need a shared analytics summary baseline so dashboards can rely on deterministic aggregate metrics without inventing inconsistent calculations.

## Functional requirements

### 1. Analytics-summary scope

- This unit covers analytics summary only.
- The baseline should support:
  - defining shared aggregate metrics used by student, company, and admin dashboards
  - keeping analytics limited to lightweight deterministic summaries rather than deep BI or event-stream processing
  - supporting role-appropriate metric subsets across the different dashboards
  - returning stable outcomes when summary data is incomplete or restricted
- heavy analytics engines, predictive modeling, AI recommendations, external BI integrations, and cross-tenant benchmarking by default remain separate later units.

### 2. Authorization and visibility behavior

- Analytics summaries must remain scoped to the recipient's role and authorization context.
- Company analytics must respect company boundaries, visibility settings, and consent posture for any student-derived data.
- Admin analytics must still honor privacy and audit expectations.
- Metric generation should remain auditable because dashboards and later reporting will depend on it.

### 3. Analytics-summary behavior

- The baseline should define deterministic metric formulas and summary groupings rather than a full analytics platform.
- Analytics summaries should remain lightweight enough for dashboard use and should avoid opaque calculations or predictive models.
- The same metric should mean the same thing wherever it appears across role-specific dashboards.
- This unit must not introduce heavy event processing, ML, or third-party analytics services.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific dashboard routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for any dashboard filter or state-changing browser request.
- Dashboard state should prefer lightweight aggregation and local page state rather than heavy analytics orchestration.
- Metric definitions should stay deterministic and auditable so later teams can trust dashboard summaries.

### 5. Relationship to later units

- U17-1 through U17-3 consume the analytics-summary definitions appropriate to each role.
- Preparation, application, interview, and notification units provide many of the input summaries used here.
- Privacy and permission units continue to constrain which metrics can be exposed to each role.
- Production-readiness performance and logging work may later monitor dashboard analytics behavior without changing metric definitions.

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
- U14-5 performance-tracking
- U15-1 notification-core
- U17-1 student-dashboard
- U17-2 company-dashboard
- U17-3 admin-dashboard

## Outputs

- Baseline deterministic analytics-summary model
- Shared metric-definition expectations for dashboards
- Integration expectations for later operational monitoring and reporting

## User flow

1. A protected dashboard requests aggregate metrics appropriate to its role and context.
2. Backend computes deterministic lightweight summaries using approved domain evidence and access constraints.
3. The platform returns role-appropriate analytics summaries or stable restricted outcomes.
4. Dashboards present the resulting metrics consistently across the product.
5. Later monitoring and reporting work reuse the same analytics-summary definitions.

## Acceptance criteria

- Analytics summary behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Heavy analytics engines, and Predictive modeling.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Heavy analytics engines
- Predictive modeling
- External BI integrations
- Cross-tenant benchmarking by default
