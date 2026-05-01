# Unit: U4-1-course-creation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected course creation through the shared `Course` domain model and admin course authoring workflows.

## Out of Scope

Student catalog browsing, course detail browsing, enrollment, lesson delivery, and progress tracking.

## Dependencies

Depends on authentication, role permissions, base API structure, admin routing, and the shared course domain model.

## Acceptance Criteria

Admins can create shared course records through protected APIs and UI flows, and those course records are reusable by later student-facing learning units.

## Risks

If course creation diverges from the shared course domain, later listing, detail, enrollment, and progress units can drift into duplicate data models.

## Open Questions

Future units can expand authoring with lessons and outlines as long as they continue to build on the shared course model.

## Last Updated

2026-04-30
