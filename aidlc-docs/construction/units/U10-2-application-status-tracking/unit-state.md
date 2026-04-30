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

Implement the shared application-status-tracking flow so the platform records, exposes, and audits stable application state and status history without collapsing create, withdraw, shortlist, or rejection actions into the same unit.

## Out of Scope

Interview scheduling and notification delivery beyond the implemented status transitions and history exposure.

## Dependencies

Depends on the requirements, security, data-model, architecture, base application API baseline, and apply-to-job baseline.

## Acceptance Criteria

Applications persist one authoritative current status and an ordered audit-friendly history consumed consistently by student and company views.

## Risks

If application-status tracking is underspecified here, later workflow units can create conflicting statuses, unauditable transitions, and inconsistent views between students and companies.

## Open Questions

Exact future expansion for interview-related or offer-related statuses can be refined later as long as current lifecycle tracking remains deterministic and auditable.

## Last Updated

2026-04-30
