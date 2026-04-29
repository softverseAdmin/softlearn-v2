# Unit: U5-1-exam-creation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected exam-creation flow so authorized platform operators can create structured exam records without collapsing question authoring, answer handling, scoring, or exam-taking behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, question creation, answer-option management, exam taking, answer submission, score calculation, pass/fail evaluation, exam history, retake policy, and broad admin exam-management workflows beyond baseline creation.

## Dependencies

Depends on the requirements, security, data-model, authentication, RBAC, API, routing, state-management, and base-layout baselines.

## Acceptance Criteria

The unit documents protected exam creation, validation outcomes, authoring boundaries, and relationship to later exam units without producing application code.

## Risks

If exam creation is underspecified here, later question, attempt, scoring, and result units can drift into conflicting exam-definition, visibility, and audit expectations.

## Open Questions

Exact draft-versus-published lifecycle rules, richer exam metadata, and approval workflows can be refined later as long as protected exam creation remains explicit and auditable.

## Last Updated

2026-04-29
