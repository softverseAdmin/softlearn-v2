# Functional design: U8-1-job-list-page

## Purpose

Define the baseline student job-list-page flow so authenticated students can browse the visible active subset of vacancies in a stable list experience before search controls, bookmarks, applications, and matching are layered on.

## User story

As an authenticated student, I need a job list page so I can browse available opportunities in one place before narrowing them down or opening individual job details.

## Functional requirements

### 1. Job-list-page scope

- This unit covers the student-facing page that presents visible jobs in list form only.
- The baseline should support:
  - opening a student job-list page in the authenticated student experience
  - loading the visible active vacancy summaries allowed for student browsing
  - presenting stable list states such as loading, empty, and visible results
  - supporting transition from a list item to the later job-detail workflow
- Search bar behavior, structured filters, bookmarks, applications, and matching remain separate later units.

### 2. Protected student access and visibility posture

- The job list page must be treated as a student-facing browsing surface tied to the allowed visible vacancy subset.
- Authenticated students should be able to browse vacancies that are visible for student discovery.
- Draft, removed, hidden, or unauthorized vacancy records must not appear as visible jobs on this page.
- Company management vacancy lists remain separate from the student job-list-page baseline.

### 3. List data and presentation behavior

- The job list page should consume structured vacancy summary data from the visible vacancy-list baseline.
- The baseline should support summary fields such as vacancy identity, title, company name where allowed, location summary, employment type, and other stable discovery-oriented indicators.
- Invalid visibility state, inconsistent active-versus-removed state, or malformed list inputs must return stable outcomes rather than exposing conflicting or unauthorized records.
- The job list page should remain list-oriented and should not replace the dedicated job-detail, search-filter, or bookmark units.

### 4. Student browsing posture

- The job list page should help students scan visible opportunities clearly.
- Later search and filter controls may refine which visible jobs are shown, but the base job list page should already behave predictably without them.
- The page should preserve a clear distinction between visible vacancies and later personalized match or bookmark behavior.
- Later implementation may refine pagination, ordering, and summary density, but the baseline should already assume a coherent discovery page.

### 5. Frontend and API alignment

- The job list page belongs in the authenticated student route area aligned with the shared app-shell, routing, and session baselines.
- Job-list-page state should use global state only where shared shell or session context requires it; most list state should remain local to the feature.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U8-2 job search bar and U8-3 through U8-6 filter units should refine the visible job-list result set without redefining the visible vacancy baseline.
- U8-7 bookmark jobs should operate on the same visible job identity surfaced from this page.
- Later application and matching units should build on the same visible student job-list posture rather than inventing alternate browseable vacancy sets.
- The earlier vacancy-detail baseline remains the source for the later job-detail experience behind list items.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U7-4 vacancy list
- U7-5 vacancy detail

## Outputs

- Baseline student job-list-page flow
- Visible-job boundaries and stable list-state expectations
- Integration expectations for later search, filters, bookmarks, applications, and matching units

## User flow

1. Authenticated student opens the job list page.
2. Frontend requests the visible active vacancy summaries available for student browsing.
3. Backend returns the stable visible subset of job summaries or an empty or unavailable outcome.
4. The student reviews the list of jobs and may choose one for later detail viewing.
5. Later search, filter, bookmark, application, and matching units build on the same visible job-list baseline.

## Acceptance criteria

- Job-list-page behavior is documented clearly.
- Student-visible vacancy boundaries and stable list outcomes are defined.
- Structured summary expectations and browsing posture are documented.
- The unit is kept separate from search controls, bookmarks, applications, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Search bar behavior
- Structured filters
- Bookmarks, applications, or matching logic
- Company-management list behavior
- Ranking or recommendation logic
