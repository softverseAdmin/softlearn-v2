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

Implement a protected student matched-jobs experience that surfaces deterministic job recommendations, explanations, bookmarks, and apply-state context.

## Out of Scope

Push notifications for recommendations, personalized AI ranking, and employer-visible student preference analytics.

## Dependencies

Depends on job-list-page, bookmark-jobs, applications, access control, and match-score-calculation.

## Acceptance Criteria

Students can open a matched-jobs page, see deterministic ranked vacancies with factor breakdowns, and act on bookmark and apply controls without bypassing existing visibility rules.

## Risks

If matched jobs bypass discovery visibility rules, students could see inactive or unauthorized vacancies.

## Open Questions

Future versions can add match-history or recommendation refresh indicators if they preserve deterministic scoring and visibility constraints.

## Last Updated

2026-04-30
