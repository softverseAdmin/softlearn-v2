# Functional design: U8-6-salary-filter

## Purpose

Define the baseline salary-filter flow so authenticated students can refine the visible job list using approved salary-ready vacancy data where that data is available.

## User story

As an authenticated student, I need a salary filter so I can narrow visible jobs to opportunities that fit my compensation expectations.

## Functional requirements

### 1. Salary-filter scope

- This unit covers salary-based filtering of the visible student job set only.
- The baseline should support:
  - selecting salary-filter criteria such as a range or threshold posture
  - applying the selected salary criteria to the visible student job set where salary-ready vacancy data is available
  - clearing or replacing the salary filter predictably
  - returning stable filtered-result, missing-salary, and no-match states where appropriate
- Skill, language, and location filters, bookmarks, applications, and matching remain separate later units.

### 2. Student search access and visibility posture

- The salary filter should operate only against the visible student job set already allowed by the job-list-page baseline.
- Filter behavior must not expose hidden, draft, removed, or unauthorized vacancies through salary-based results.
- Company management filtering remains separate from this student salary-filter baseline.
- Salary filtering should preserve the same visibility boundaries used by the visible job list.

### 3. Salary-ready data and result behavior

- The salary filter should consume approved salary-ready vacancy metadata where the vacancy domain provides it.
- The baseline should support a clear distinction between:
  - the selected salary-filter criteria
  - the filtered visible result set
  - the no-match outcome when no visible jobs satisfy the selected salary expectations
  - the missing-salary posture when salary data is not available for some visible jobs
- Malformed salary inputs, unsupported range combinations, inconsistent currency posture, or inconsistent filter-state transitions must return stable outcomes rather than exposing conflicting or unauthorized records.
- The salary filter should remain a structured filter and should not replace the general search bar or later matching logic.

### 4. Filter-state posture

- The salary filter should help students refine visible jobs using approved salary-ready vacancy data instead of ad hoc free-text compensation matching.
- The baseline should support predictable transitions among default list state, salary-filtered result state, missing-salary-aware state, and no-match state.
- Later implementation may refine salary normalization, currency handling, and negotiation semantics, but the baseline should already assume coherent salary-filter behavior.
- Salary-filter behavior should remain compatible with the general search bar and later bookmark workflows.

### 5. Frontend and API alignment

- The salary filter belongs in the authenticated student job-search experience aligned with the shared app-shell, routing, and session baselines.
- Salary-filter state should remain local to the discovery feature unless later reuse justifies broader state sharing.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U8-3 through U8-5 other structured filters should refine the same visible job result set without redefining salary-filter ownership or visibility posture.
- U8-7 bookmark jobs should operate on job identities returned by the filtered result set without changing salary-filter behavior itself.
- Later matching units may use salary expectations only if explicitly approved later, but they must not redefine student-facing salary-filter behavior.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U0-1 platform requirements definition
- U0-2 user personas definition
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U8-1 job list page
- U8-2 job search bar

## Outputs

- Baseline salary-filter flow
- Salary-filter and visible-result expectations
- Integration expectations for later bookmarks, applications, and matching units

## User flow

1. Authenticated student opens the job search experience.
2. The student selects salary-filter criteria.
3. Frontend and backend apply the selected salary criteria to the visible student job set where salary-ready data is available.
4. The platform returns matching visible jobs or a stable no-match or missing-salary-aware outcome.
5. Later bookmark, application, and matching units build on the same salary-filtered job baseline.

## Acceptance criteria

- Salary-filter behavior is documented clearly.
- Salary-filter boundaries, visible-result posture, and missing-salary expectations are defined.
- Stable filtered-result and no-match expectations are documented.
- The unit is kept separate from other filters, bookmarks, applications, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Skill, language, or location filters
- Bookmarks, applications, or matching logic
- Company-management filter behavior
- Salary-match scoring logic
- Analytics behavior
