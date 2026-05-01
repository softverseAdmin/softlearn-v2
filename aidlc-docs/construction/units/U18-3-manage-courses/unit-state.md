# Unit: U18-3-manage-courses

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected admin course management using a shared `Course` domain model with create, update, list, and deactivate flows.

## Out of Scope

Bulk-import tooling, external LMS synchronization, lesson authoring, student enrollment workflows, and self-service instructor management.

## Dependencies

Depends on authentication, role permissions, admin routing, base API structure, and the learning-summary domain surfaces that reuse course records.

## Acceptance Criteria

Admins can manage shared course records through protected APIs and UI routes, course data is reusable by linked learning records, and non-admin users cannot access the management surface.

## Risks

If course management diverges from the learning domain, later lesson and enrollment units can drift into duplicate records and inconsistent progress reporting.

## Open Questions

Future units can add lessons, enrollment, and course delivery flows as long as they continue to reuse the shared course model introduced here.

## Last Updated

2026-04-30
