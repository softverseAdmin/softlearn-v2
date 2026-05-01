# Unit: U4-8-course-completion-tracking

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement deterministic course completion and progress rollup from active lesson progress under a student-owned course learning record.

## Out of Scope

Certificates, readiness-score changes, company visibility into protected completion data, and manual completion overrides.

## Dependencies

Depends on shared lessons, course enrollment, lesson progress, student dashboard continuation logic, and learning summary surfaces.

## Acceptance Criteria

Course-level progress and completion update deterministically from lesson progress and stay aligned across student-facing learning surfaces.

## Risks

If completion rollup diverges between APIs, the student dashboard, course detail, and matching evidence can drift out of sync.

## Open Questions

Certificate UX and downstream readiness use can evolve later while preserving the same deterministic lesson-based completion rule.

## Last Updated

2026-04-30
