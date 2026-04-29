# Unit: U5-2-question-creation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected question-creation flow so authorized platform operators can attach structured question records to an existing exam without collapsing answer-option, exam-taking, or scoring behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, exam creation, answer-options management, exam taking, answer submission, score calculation, pass/fail evaluation, exam history, retake policy, and broad admin exam-management workflows beyond baseline question authoring.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, routing, state-management, base-layout, and exam-creation baselines.

## Acceptance Criteria

The unit documents protected question creation, validation outcomes, authoring boundaries, and relationship to later exam units without producing application code.

## Risks

If question creation is underspecified here, later answer-option, delivery, submission, and scoring units can drift into conflicting question structure, ordering, and integrity expectations.

## Open Questions

Exact supported question types, richer media fields, and advanced authoring workflows can be refined later as long as protected question creation remains explicit and exam-linked.

## Last Updated

2026-04-29
