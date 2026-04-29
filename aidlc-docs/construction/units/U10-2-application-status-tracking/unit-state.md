# Unit: U10-2-application-status-tracking

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline application-status-tracking flow so the platform can record, expose, and audit stable application state and status history without collapsing create, withdraw, shortlist, or rejection actions into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, application creation, withdrawal, shortlist actions, rejection actions, interview scheduling, and notification delivery.

## Dependencies

Depends on the requirements, security, data-model, architecture, base application API baseline, and apply-to-job baseline.

## Acceptance Criteria

The unit documents deterministic application-status tracking, lifecycle-history expectations, and relationship to later student and company actions without producing application code.

## Risks

If application-status tracking is underspecified here, later workflow units can create conflicting statuses, unauditable transitions, and inconsistent views between students and companies.

## Open Questions

Exact future expansion for interview-related or offer-related statuses can be refined later as long as current lifecycle tracking remains deterministic and auditable.

## Last Updated

2026-04-29
