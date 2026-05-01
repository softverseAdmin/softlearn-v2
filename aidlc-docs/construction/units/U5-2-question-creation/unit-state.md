# Unit: U5-2-question-creation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected admin question authoring for shared exams with deterministic ordering and scoring-ready points metadata.

## Out of Scope

Student-taking behavior, answer-option correctness exposure, autosave, grading review, and non-admin question editing workflows.

## Dependencies

Depends on shared exam records, admin routing, authentication, and RBAC.

## Acceptance Criteria

Admins can create, update, list, and retire structured exam questions under a shared exam.

## Risks

If question ordering or active-count synchronization drifts, the student exam flow can become inconsistent or incomplete.

## Open Questions

Additional question types can be added later without changing the protected exam-question structure.

## Last Updated

2026-05-01

