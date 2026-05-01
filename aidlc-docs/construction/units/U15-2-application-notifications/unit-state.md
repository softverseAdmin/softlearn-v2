# Unit: U15-2-application-notifications

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement deterministic notifications for application submission, withdrawal, shortlist, and rejection using application-history events and the shared notification core.

## Out of Scope

Interview-specific notifications, push-delivery channels, marketing notifications, and custom delivery providers.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

Important application lifecycle changes generate summary-safe notifications for the owning student and authorized company users with simulated delivery records.

## Risks

If application notifications ignore company boundaries or bypass application-history events, recipients can get duplicate or misrouted updates.

## Open Questions

Later work can add under-review notifications if the status is exposed as an end-user event without changing the current lifecycle triggers.

## Last Updated

2026-05-01
