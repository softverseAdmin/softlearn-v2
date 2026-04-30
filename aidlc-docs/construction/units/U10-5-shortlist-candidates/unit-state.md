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

Implement the protected shortlist-candidates flow so authorized company users can mark applications or candidates as shortlisted using deterministic authorization, lifecycle, and audit rules.

## Out of Scope

Interview scheduling, notifications, and later shortlist-list presentation or note-taking behavior beyond the implemented shortlist transition.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, company application review baseline, and application-status-tracking baseline.

## Acceptance Criteria

Authorized company users can shortlist eligible applications without duplicate shortlist state, and the resulting shortlist transition is recorded in shared application history.

## Risks

If shortlist behavior is underspecified here, later implementation can create duplicate shortlist state, unauthorized candidate advancement, or confusion between shortlist action and shortlist-view presentation.

## Open Questions

Exact later shortlist prioritization, ordering, and recruiter notes can be refined later as long as the shortlist action remains authorized, deterministic, and auditable.

## Last Updated

2026-04-30
