# Unit: U14-4-study-plan

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement a deterministic study-plan summary that turns category, learning, practice, and mock evidence into stable next-step guidance.

## Out of Scope

AI recommendations, calendar integration, shared coaching workflows, and automated tutoring services.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

Students can review category-level study-plan items and next steps generated from deterministic preparation evidence.

## Risks

If study-plan logic uses opaque heuristics or non-student-visible data, the preparation flow becomes hard to explain and audit.

## Open Questions

Later work can add plan milestones or reminders without changing the deterministic evidence model shipped here.

## Last Updated

2026-05-01
