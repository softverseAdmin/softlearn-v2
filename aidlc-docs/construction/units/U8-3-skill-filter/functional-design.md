# Functional design: U8-3-skill-filter

## Purpose

Define the baseline skill-filter flow so authenticated students can refine the visible job list using structured vacancy skill requirements from the shared skill taxonomy.

## User story

As an authenticated student, I need a skill filter so I can quickly narrow visible jobs to roles that align with relevant skill requirements.

## Functional requirements

### 1. Skill-filter scope

- This unit covers structured skill-based filtering of the visible student job set only.
- The baseline should support:
  - selecting one or more skill-based filter criteria
  - applying the selected skill criteria to the visible student job set
  - clearing or replacing the skill filter predictably
  - returning stable filtered-result and no-match states where appropriate
- Language, location, and salary filters, bookmarks, applications, and matching remain separate later units.

### 2. Student search access and visibility posture

- The skill filter should operate only against the visible student job set already allowed by the job-list-page baseline.
- Filter behavior must not expose hidden, draft, removed, or unauthorized vacancies through skill-based results.
- Company management filtering remains separate from this student skill-filter baseline.
- Skill filtering should preserve the same visibility boundaries used by the visible job list.

### 3. Structured filter data and result behavior

- The skill filter should consume structured **VacancySkillRequirement** data linked to visible vacancies.
- The baseline should support a clear distinction between:
  - the selected skill-filter criteria
  - the filtered visible result set
  - the no-match outcome when no visible jobs satisfy the selected skills
- Invalid skill references, unsupported filter combinations, or inconsistent filter-state transitions must return stable outcomes rather than exposing conflicting or unauthorized records.
- The skill filter should remain a structured filter and should not replace the general search bar or later matching logic.

### 4. Filter-state posture

- The skill filter should help students refine visible jobs using the shared skill taxonomy rather than ad hoc free-text skill matching.
- The baseline should support predictable transitions among default list state, skill-filtered result state, and no-match state.
- Later implementation may refine required-versus-preferred weighting or multi-select UX, but the baseline should already assume coherent structured filter behavior.
- Skill-filter behavior should remain compatible with the general search bar and later bookmark workflows.

### 5. Frontend and API alignment

- The skill filter belongs in the authenticated student job-search experience aligned with the shared app-shell, routing, and session baselines.
- Skill-filter state should remain local to the discovery feature unless later reuse justifies broader state sharing.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U8-4 through U8-6 other structured filters should refine the same visible job result set without redefining skill-filter ownership or visibility posture.
- U8-7 bookmark jobs should operate on job identities returned by the filtered result set without changing skill-filter behavior itself.
- Later matching units should reuse the same structured vacancy skill data for explainable matching rather than inventing alternate skill filtering models.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U7-6 vacancy skill tags
- U8-1 job list page
- U8-2 job search bar

## Outputs

- Baseline skill-filter flow
- Structured skill-filter and visible-result expectations
- Integration expectations for later bookmarks, applications, and matching units

## User flow

1. Authenticated student opens the job search experience.
2. The student selects one or more skill-filter criteria.
3. Frontend and backend apply the selected skills to the visible student job set.
4. The platform returns matching visible jobs or a stable no-match outcome.
5. Later bookmark, application, and matching units build on the same skill-filtered job baseline.

## Acceptance criteria

- Skill-filter behavior is documented clearly.
- Structured skill-filter boundaries and visible-result posture are defined.
- Stable filtered-result and no-match expectations are documented.
- The unit is kept separate from other filters, bookmarks, applications, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Language, location, or salary filters
- Bookmarks, applications, or matching logic
- Company-management filter behavior
- Skill-match scoring logic
- Analytics behavior
