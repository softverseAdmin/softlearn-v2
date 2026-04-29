# Unit: U9-8-matched-jobs-for-student

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline student-facing matched-jobs flow so a student can review ranked job recommendations using deterministic explainable match results without collapsing search, bookmark, or application behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, aggregate score calculation logic, search filtering, bookmarking, applications, and any hidden company-internal data exposure.

## Dependencies

Depends on the requirements, security, data-model, architecture, vacancy visibility baselines, job-search baselines, bookmark-jobs baseline, and U9-1 through U9-6 matching baselines.

## Acceptance Criteria

The unit documents student-facing matched-jobs behavior, ranking and explanation constraints, and relationship to upstream aggregate match scoring without producing application code.

## Risks

If student matched-job views are underspecified here, later implementation can drift into opaque recommendation behavior, inconsistent ranking, or confusion between matched jobs, search results, and bookmarks.

## Open Questions

Exact student UI sorting, refresh timing, and saved-view affordances can be refined later as long as ranking and explanation behavior remain deterministic.

## Last Updated

2026-04-29
