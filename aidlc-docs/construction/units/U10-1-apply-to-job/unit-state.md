# Unit: U10-1-apply-to-job

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement the protected apply-to-job flow so an authenticated student can create an application for a visible vacancy using deterministic eligibility, ownership, and initial-status rules without collapsing later status-tracking or company-review behavior into the same unit.

## Out of Scope

Interview scheduling, notifications, and detailed lifecycle behavior beyond the shared application status model used by the implemented flow.

## Dependencies

Depends on the requirements, security, data-model, architecture, student authentication, vacancy visibility, matched-jobs context, and base application API baseline.

## Acceptance Criteria

Students can submit a protected application from a visible job context, duplicate active applications are blocked, and initial submitted status history is persisted.

## Risks

Application creation now depends on the shared lifecycle model and company review surfaces, so contract drift across these areas would create inconsistent hiring state.

## Open Questions

Future units can add richer screening inputs or eligibility windows if they preserve the current visible-vacancy and student-owned submission rules.

## Last Updated

2026-04-30
