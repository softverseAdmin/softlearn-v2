# Unit: U4-2-course-listing

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement a protected student course catalog that lists active shared course records with meaningful summary information.

## Out of Scope

Single-course detail behavior, enrollment, lesson entry, filtering, and student progress mutation.

## Dependencies

Depends on the shared course model, student routing, student learning area, and base API structure.

## Acceptance Criteria

Students can browse active courses through a dedicated catalog route, see meaningful course summaries, and move onward to a dedicated detail page.

## Risks

If listing logic leaks inactive or draft courses, students can see content that is not ready for learner-facing discovery.

## Open Questions

Later units can add catalog filtering and sorting if they preserve the same active-course visibility posture.

## Last Updated

2026-04-30
