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

Define the baseline apply-to-job flow so an authenticated student can create an application for a visible vacancy using deterministic eligibility, ownership, and initial-status rules without collapsing later status-tracking or company-review behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, later company review actions, interview scheduling, notifications, and detailed status-lifecycle management beyond initial submission behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, student authentication, vacancy visibility, matched-jobs context, and base application API baseline.

## Acceptance Criteria

The unit documents deterministic student-owned application creation, duplicate-prevention expectations, and relationship to later application status and company-review units without producing application code.

## Risks

If application creation is underspecified here, later units can drift into duplicate applications, unauthorized vacancy targeting, inconsistent initial status behavior, and broken status-history linkage.

## Open Questions

Exact later eligibility checks such as application windows or additional screening questions can be refined later as long as baseline submission remains deterministic and student-owned.

## Last Updated

2026-04-29
