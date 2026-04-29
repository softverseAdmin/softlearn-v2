# Unit: U5-4-exam-taking-ui

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected exam-taking UI flow so authenticated students can view and navigate an available exam experience without collapsing answer-submission, scoring, or results behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, exam creation, question creation, answer-options management, answer submission persistence, score calculation, pass/fail evaluation, exam history, retake policy, and company-facing result visibility.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, frontend initialization, routing, state-management, base-layout, exam-creation, question-creation, and answer-options-management baselines.

## Acceptance Criteria

The unit documents protected exam-taking UI behavior, student access boundaries, navigation expectations, and relationship to later submission and scoring units without producing application code.

## Risks

If exam-taking UI behavior is underspecified here, later submission, scoring, and history units can drift into conflicting session, timing, navigation, and integrity expectations.

## Open Questions

Exact timer UX, autosave behavior, fullscreen or anti-cheat affordances, and question pagination can be refined later as long as the protected student exam-taking experience remains explicit and consistent.

## Last Updated

2026-04-29
