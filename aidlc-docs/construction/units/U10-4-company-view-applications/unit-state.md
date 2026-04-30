# Unit: U10-4-company-view-applications

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement the protected company-view-applications flow so authorized company users can review applications submitted to their vacancies using approved visibility and status-history context.

## Out of Scope

Interview scheduling and notification delivery beyond the implemented company application review and action-launch context.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, privacy filter baseline, vacancy baselines, and application lifecycle baselines.

## Acceptance Criteria

Company users can review their own vacancy applications with privacy-safe candidate context, current status, and ordered history.

## Risks

If company application review is underspecified here, later implementation can expose cross-company data, bypass privacy rules, or mix passive review with state-changing workflow actions.

## Open Questions

Exact list sorting, filtering defaults, and recruiter-side comparison affordances can be refined later as long as company review remains authorized and privacy-safe.

## Last Updated

2026-04-30
