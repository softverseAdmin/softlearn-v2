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

Define the baseline company-view-applications flow so authorized company users can review applications submitted to their vacancies using approved visibility, ranking, and status-history context without collapsing shortlist or rejection actions into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, student application creation, shortlist actions, rejection actions, interview scheduling, and notification delivery.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, privacy filter baseline, vacancy baselines, and application lifecycle baselines.

## Acceptance Criteria

The unit documents authorized company-side application review behavior, visibility constraints, and relationship to later shortlist and rejection actions without producing application code.

## Risks

If company application review is underspecified here, later implementation can expose cross-company data, bypass privacy rules, or mix passive review with state-changing workflow actions.

## Open Questions

Exact list sorting, filtering defaults, and recruiter-side comparison affordances can be refined later as long as company review remains authorized and privacy-safe.

## Last Updated

2026-04-29
