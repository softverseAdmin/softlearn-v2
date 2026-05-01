# Unit: U5-1-exam-creation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected admin exam creation and maintenance for shared exams, including top-level assessment settings such as timing, passing score, and max attempts.

## Out of Scope

Question authoring, student exam-taking, answer persistence, scoring internals, and company-facing result exposure.

## Dependencies

Depends on authentication, RBAC, admin routing, and the shared assessment domain.

## Acceptance Criteria

Admins can create, update, and retire shared exam records through protected APIs and admin UI.

## Risks

If exam-level policy fields drift from the shared exam record, later taking and retake logic can become inconsistent.

## Open Questions

Richer publication workflows can be added later without replacing shared exam records as the source of truth.

## Last Updated

2026-05-01

