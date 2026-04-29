# Unit: U10-5-shortlist-candidates

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline shortlist-candidates flow so authorized company users can mark applications or candidates as shortlisted using deterministic authorization, lifecycle, and audit rules without collapsing broader shortlist-view management into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, general company application review, rejection actions, interview scheduling, notifications, and later shortlist-list presentation or note-taking behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, company application review baseline, and application-status-tracking baseline.

## Acceptance Criteria

The unit documents deterministic company-side shortlist action behavior, shortlist-entry expectations, and relationship to shared application status without producing application code.

## Risks

If shortlist behavior is underspecified here, later implementation can create duplicate shortlist state, unauthorized candidate advancement, or confusion between shortlist action and shortlist-view presentation.

## Open Questions

Exact later shortlist prioritization, ordering, and recruiter notes can be refined later as long as the shortlist action remains authorized, deterministic, and auditable.

## Last Updated

2026-04-29
