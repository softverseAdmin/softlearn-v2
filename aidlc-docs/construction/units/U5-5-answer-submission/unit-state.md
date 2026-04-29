# Unit: U5-5-answer-submission

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected answer-submission flow so authenticated students can submit exam responses as traceable attempt data without collapsing UI rendering, scoring, or results behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, exam creation, question creation, answer-options management, exam-taking UI rendering, score calculation, pass/fail evaluation, exam history, retake policy, and company-facing result visibility.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, frontend initialization, routing, state-management, base-layout, exam-creation, question-creation, answer-options-management, and exam-taking-UI baselines.

## Acceptance Criteria

The unit documents protected answer submission, traceability expectations, validation boundaries, and relationship to later scoring and history units without producing application code.

## Risks

If answer submission is underspecified here, later scoring, pass/fail, and history units can drift into conflicting attempt ownership, response finalization, and audit expectations.

## Open Questions

Exact autosave-versus-final-submit behavior, interruption recovery, and late-submission handling can be refined later as long as authenticated answer submission remains explicit and traceable.

## Last Updated

2026-04-29
