# Unit: U14-2-practice-question-bank

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement a protected student practice-question bank with deterministic feedback and separate practice-attempt evidence.

## Out of Scope

Official exam submission, adaptive recommendations, heavy analytics, and admin authoring beyond the existing exam-question tools.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

Students can answer protected practice questions, receive deterministic feedback, and build practice history without creating official exam records.

## Risks

If practice flows reuse official exam history tables or reveal correctness before submission, preparation and certification boundaries blur.

## Open Questions

Richer explanations, pagination, and topic tags can be layered on later without changing the separate practice-attempt contract.

## Last Updated

2026-05-01
