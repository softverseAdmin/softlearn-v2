# Functional design: U20-3-company-dashboard-redesign

## Purpose

Redesign the company dashboard from a generic summary page into a hiring-first workspace that shows who to review next, which jobs are active, and which interviews need follow-up.

## User story

As a company user, I need a dashboard that helps me act on candidate review and hiring workflow quickly instead of making me scan unrelated metrics and clutter.

## Functional requirements

### 1. Scope

- This unit covers the protected company dashboard only.
- The redesign must replace the old metric-first layout with:
  - candidates to review
  - active jobs
  - interviews
  - compact analytics
- The dashboard must help the company answer:
  - which candidates need review now
  - which jobs are currently active
  - which interviews need attention
  - how healthy the current hiring pipeline is

### 2. Primary dashboard actions

- The top of the page must show a welcome header and a hiring-focused message.
- A **Candidates to Review** section must show a small, scan-friendly list containing:
  - candidate name
  - score percent when exam-result sharing allows it
  - top skills
  - CTA to review or shortlist
- An **Active Jobs** section must show a compact list of current vacancy records with:
  - role title
  - status
  - location
  - CTA to open the vacancy workflow
- The dashboard must prefer immediate action links over passive reporting.

### 3. Secondary dashboard sections

- An **Interviews** section must show current interview follow-up items with clear status and timing context.
- A **Small Analytics** section must summarize:
  - candidates to review
  - shortlisted candidates
  - active jobs
  - unread updates
- The redesign must avoid large charts and data-heavy visualizations.

### 4. Role, privacy, and behavior boundaries

- Only authenticated company users may access this dashboard.
- Candidate information must remain bounded by the existing company review-access and visibility rules.
- Exam-derived score display must be omitted when exam results are not explicitly shared.
- The redesign must not use external AI services or opaque recommendation logic.

### 5. UI structure

- The company dashboard UI should follow this structure:
  - Header
  - Candidates to Review
  - Active Jobs
  - Interviews
  - Small Analytics
- The page must remain minimal and action-first rather than chart-first or report-first.

### 6. Component hierarchy

- Expected component hierarchy:
  - `DashboardPage`
    - `CompanyDashboardRedesign`
      - `CandidateCard`
      - `HiringJobsSection`
      - `InterviewQueueSection`
      - `HiringAnalyticsSection`

### 7. State flow

- The company route loads the protected dashboard response from `/api/v1/company/dashboard`.
- Frontend page state should handle:
  - loading
  - error
  - loaded dashboard data
- The backend must provide the hiring-priority ordering and candidate score visibility so the frontend does not guess hidden business logic.

### 8. API mapping

- The unit must map dashboard UI sections to a stable company dashboard API contract.
- The backend response should provide enough structured data for:
  - candidates-to-review cards
  - active-jobs list
  - interview follow-up items
  - small analytics counters
- The active-jobs section should remain honest about current backend limits and must not fabricate per-vacancy application counts that are not represented in the data model.

## Inputs

- Inception baseline and CHG-002 redesign decision
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-8 base UI layout
- U17-2 company dashboard baseline
- U16-3 company access control
- Existing company dashboard backend and frontend implementation

## Outputs

- Redesigned protected company dashboard behavior
- Company dashboard UI structure and component hierarchy
- Deterministic candidate-review and hiring-action expectations
- Updated company dashboard API contract for the redesigned surface

## User flow

1. The company user opens the protected dashboard.
2. The backend loads vacancy, candidate-review, interview, and notification signals for that company context.
3. The backend returns a payload centered on review-ready candidates and current hiring actions.
4. The frontend highlights candidate review, active jobs, and interviews in a simple action-first layout.
5. The company user moves into candidate review, vacancy management, or interview follow-up from the dashboard.

## Acceptance criteria

- The dashboard clearly tells the company what to do next.
- The page is minimal and hiring-focused rather than chart-heavy.
- The experience is company-specific and privacy-safe.
- The design works well on desktop and remains readable on tablet and mobile.
- UI structure, component hierarchy, state flow, API mapping, and acceptance criteria are all documented.

## Out of scope

- Admin dashboard redesign
- Auth page redesign
- Vacancy CRUD redesign
- Candidate detail redesign
- New analytics engine or charting
