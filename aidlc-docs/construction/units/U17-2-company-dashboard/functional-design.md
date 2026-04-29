# Functional design: U17-2-company-dashboard

## Purpose

Define the baseline company-dashboard flow so company users can review a protected summary of vacancies, applications, shortlisted candidates, interviews, and notifications for their own company.

## User story

As a company user, I need a dashboard so I can quickly understand current hiring activity for my company without opening every management area separately.

## Functional requirements

### 1. Company-dashboard scope

- This unit covers company dashboard only.
- The baseline should support:
  - presenting a protected company summary across vacancies, applications, shortlist, interviews, and notifications
  - showing lightweight aggregated metrics and recent items for the current company only
  - linking back to deeper protected company workflows for detailed review
  - returning stable outcomes when some dashboard sections have no available data
- heavy analytics, cross-company comparisons, AI recommendations, advanced customization, and external BI tools remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated company users may access the dashboard for their own company.
- Company-dashboard content must not reveal another company's data or student data beyond approved company-facing visibility rules.
- Dashboard summaries must respect company access control, visibility settings, and consent posture.
- Dashboard metric generation should remain auditable because hiring decisions may rely on it.

### 3. Company-dashboard behavior

- The dashboard should provide lightweight aggregated metrics such as active vacancies, application counts, shortlist counts, interview counts, and recent notification indicators.
- Dashboard cards should direct company users back to protected detailed views rather than replacing them.
- Metric definitions should remain deterministic and company-bound.
- This unit must not introduce heavy analytics engines, cross-company benchmarking, or opaque ranking logic.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific dashboard routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for any dashboard filter or state-changing browser request.
- Dashboard state should prefer lightweight aggregation and local page state rather than heavy analytics orchestration.
- Metric definitions should stay deterministic and auditable so later teams can trust dashboard summaries.

### 5. Relationship to later units

- Vacancy, application, shortlist, interview, and notification units all supply the summaries surfaced here.
- U17-4 analytics summary remains separate and should not be merged into the company-dashboard core.
- U16 company-access-control and consent units continue to govern any student-related data shown on the dashboard.
- Admin dashboards remain separate and must not inherit company-dashboard semantics accidentally.

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
- U7-4 vacancy-list
- U10-4 company-view-applications
- U11-4 candidate-shortlist
- U12-6 interview-status-tracking
- U15-1 notification-core
- U16-3 company-access-control

## Outputs

- Baseline protected company-dashboard model
- Lightweight company-metric and recent-activity expectations
- Integration expectations for analytics summary and notification-aware company views

## User flow

1. A company user opens the protected company dashboard area.
2. Backend gathers lightweight summaries from approved company-owned vacancy, application, shortlist, interview, and notification sources.
3. The platform returns deterministic dashboard metrics and recent-item summaries for the current company.
4. The company user uses dashboard cards to navigate back to deeper protected workflows.
5. Later analytics and notification work reuse the same company-dashboard baseline.

## Acceptance criteria

- Company dashboard behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Heavy analytics engines, and Cross-company comparisons.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Heavy analytics engines
- Cross-company comparisons
- AI recommendations
- External BI integrations
