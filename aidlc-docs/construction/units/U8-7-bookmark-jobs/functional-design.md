# Functional design: U8-7-bookmark-jobs

## Purpose

Define the baseline bookmark-jobs flow so authenticated students can save visible job opportunities for later review using structured job-bookmark records.

## User story

As an authenticated student, I need job bookmarks so I can save interesting visible jobs and return to them later without applying immediately.

## Functional requirements

### 1. Bookmark-jobs scope

- This unit covers student-owned bookmarking of visible jobs only.
- The baseline should support:
  - creating a bookmark for a visible job
  - removing a bookmark for a previously saved job
  - checking whether a visible job is bookmarked by the authenticated student
  - returning stable saved, unsaved, and already-saved outcomes where appropriate
- Applications, matching logic, and broader recommendation behavior remain separate later units.

### 2. Protected student ownership

- Job bookmarking must be treated as a protected student action.
- Only the authenticated student may create or remove that student’s job bookmarks through this baseline.
- Students must not access or modify another student’s bookmark records.
- Bookmarking should align with authentication, authorization, and audit expectations where needed later.

### 3. Bookmark data and validation

- Bookmarking should produce structured **JobBookmark** records linked to the student and a visible **Vacancy**.
- The baseline should support validation of vacancy identity, visible-job eligibility, and duplicate bookmark prevention.
- Validation failures such as hidden or removed vacancy targets, malformed vacancy identifiers, duplicate-save attempts, or unauthorized bookmark ownership must return stable outcomes.
- Bookmark behavior should preserve a clear distinction between visible job browsing and saved job state.

### 4. Visibility and later-review posture

- Students should only bookmark jobs that are visible in the approved student discovery context.
- Bookmarking must not make hidden, removed, or unauthorized vacancies newly visible to the student.
- Later implementation may add dedicated saved-job pages or reminder workflows, but the baseline should already assume stable student-owned bookmark state.
- Company users must not gain access to student bookmark choices through this baseline.

### 5. Frontend and API alignment

- Bookmark behavior belongs in the authenticated student job-discovery experience aligned with the shared app-shell, routing, and session baselines.
- Bookmark state may be reflected locally in the job list or job detail experience, but ownership remains student-specific and protected.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- Search bar and filter units should surface the same visible job identities that bookmark actions operate on.
- Later application units should remain separate from bookmarking so saving a job does not imply applying to it.
- Later matching and recommendation units may use bookmarks as an engagement signal only if explicitly approved later; they must not redefine bookmark ownership or visibility posture.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U7-5 vacancy detail
- U8-1 job list page
- U8-2 job search bar
- U8-3 skill filter
- U8-4 language filter
- U8-5 location filter
- U8-6 salary filter

## Outputs

- Baseline bookmark-jobs flow
- Student ownership, visible-job eligibility, and stable bookmark-state expectations
- Integration expectations for later saved-job, application, and matching units

## User flow

1. Authenticated student browses visible jobs in the discovery experience.
2. The student chooses to save or unsave a job.
3. Frontend sends the bookmark action for the selected visible vacancy.
4. Backend validates student ownership and visible-job eligibility, then records the stable bookmark outcome.
5. Later saved-job, application, and matching units build on the same student-owned bookmark baseline.

## Acceptance criteria

- Bookmark-jobs behavior is documented clearly.
- Protected student ownership and visible-job eligibility boundaries are defined.
- Structured bookmark-state and validation expectations are documented.
- The unit is kept separate from applications, recommendations, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Applications or candidate workflow behavior
- Matching or recommendation logic
- Company-side bookmark visibility
- Reminder or notification features
- Analytics behavior
