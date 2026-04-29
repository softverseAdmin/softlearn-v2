# Functional design: U17-1-student-dashboard

## Purpose

Define the baseline student-dashboard flow so students can review a protected summary of their learning, exam, application, and preparation progress in one place.

## User story

As a student, I need a dashboard so I can quickly understand my current learning, exam, application, and preparation status without visiting every feature area separately.

## Functional requirements

### 1. Student-dashboard scope

- This unit covers student dashboard only.
- The baseline should support:
  - presenting a protected student summary across learning, exams, applications, interviews, and preparation activity
  - showing lightweight aggregated metrics and recent items rather than heavy analytics
  - linking back to deeper protected feature areas for detailed review
  - returning stable outcomes when some dashboard sections have no available data
- heavy analytics, AI recommendations, company-facing sharing by default, advanced customization, and external BI tools remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students may access their own dashboard.
- Student-dashboard content must remain student-owned and must not reveal protected data from other users or companies.
- Dashboard summaries must respect the same privacy and visibility rules that govern the underlying feature views.
- Dashboard metric generation should remain auditable because later user decisions may rely on it.

### 3. Student-dashboard behavior

- The dashboard should provide lightweight aggregated metrics such as course progress, exam status, application status, interview state, and preparation activity summaries.
- Dashboard cards should direct students back to protected detailed views rather than replacing them.
- Metric definitions should remain deterministic and explainable.
- This unit must not introduce heavy analytics engines or opaque recommendation logic.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific dashboard routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for any dashboard filter or state-changing browser request.
- Dashboard state should prefer lightweight aggregation and local page state rather than heavy analytics orchestration.
- Metric definitions should stay deterministic and auditable so later teams can trust dashboard summaries.

### 5. Relationship to later units

- Learning, exam, application, interview, and preparation units all supply the summaries surfaced here.
- U17-4 analytics summary remains separate and should not be merged into the student-dashboard core.
- Notification units may later contribute summary counts or recent-event indicators without redefining dashboard semantics.
- Privacy and permission units continue to govern any data shown on the dashboard.

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
- U6-1 student learning summary
- U6-2 student exam results summary
- U10-2 application-status-tracking
- U12-6 interview-status-tracking
- U14-5 performance-tracking
- U15-1 notification-core

## Outputs

- Baseline protected student-dashboard model
- Lightweight metric and recent-activity expectations
- Integration expectations for analytics summary and notification-aware dashboard views

## User flow

1. A student opens the protected dashboard area.
2. Backend gathers lightweight summaries from approved learning, exam, application, interview, preparation, and notification sources.
3. The platform returns deterministic dashboard metrics and recent-item summaries.
4. The student uses dashboard cards to navigate back to deeper protected features.
5. Later analytics and notification work reuse the same student-dashboard baseline.

## Acceptance criteria

- Student dashboard behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Heavy analytics engines, and AI recommendations.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Heavy analytics engines
- AI recommendations
- Advanced customization
- External BI integrations
