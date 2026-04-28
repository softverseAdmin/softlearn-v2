# Unit: U4-7-lesson-progress-tracking

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline lesson-progress flow so a student’s course participation can be tracked at lesson level through protected, enrollment-linked learning state without mixing in course-completion calculation.

## Out of Scope

Concrete frontend/backend implementation code, lesson authoring, enrollment creation, completion calculation, grading logic, and analytics dashboards.

## Dependencies

Depends on the requirements, security, data-model, authentication, RBAC, routing, layout, lesson viewing, and course-enrollment baselines.

## Acceptance Criteria

The unit documents lesson-progress behavior, ownership boundaries, and state-update expectations without producing application code.

## Risks

If lesson progress is underspecified here, course completion, readiness, and later learning summaries can drift into inconsistent or non-auditable student-state logic.

## Open Questions

Exact progress granularity, resume-point support, and passive-versus-explicit completion signals can be refined later as long as enrollment-linked lesson progress remains explicit and student-owned.

## Last Updated

2026-04-29
