# Unit: U5-3-answer-options-management

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected answer-options management flow so authorized platform operators can maintain structured answer-option records for an existing question without collapsing question authoring, exam-taking, or scoring behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, exam creation, question creation, exam taking, answer submission, score calculation, pass/fail evaluation, exam history, retake policy, and broad admin exam-management workflows beyond baseline answer-option management.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, routing, state-management, base-layout, exam-creation, and question-creation baselines.

## Acceptance Criteria

The unit documents protected answer-options management, validation outcomes, authoring boundaries, and relationship to later exam units without producing application code.

## Risks

If answer-options management is underspecified here, later exam-taking, submission, and scoring units can drift into conflicting option ordering, correctness, and integrity expectations.

## Open Questions

Exact support for rich media options, partial-credit metadata, and advanced bulk-edit workflows can be refined later as long as protected answer-options management remains explicit and question-linked.

## Last Updated

2026-04-29
