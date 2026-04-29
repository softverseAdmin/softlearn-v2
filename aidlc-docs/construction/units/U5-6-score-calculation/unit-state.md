# Unit: U5-6-score-calculation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline score-calculation flow so submitted exam attempts can be evaluated into deterministic score outcomes without collapsing pass/fail, history, or retake behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, exam creation, question creation, answer-options management, exam-taking UI rendering, answer submission persistence, pass/fail evaluation, exam history, retake policy, and company-facing result visibility.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, exam-creation, question-creation, answer-options-management, exam-taking-UI, and answer-submission baselines.

## Acceptance Criteria

The unit documents deterministic score calculation, evaluation boundaries, and relationship to later pass/fail and history units without producing application code.

## Risks

If score calculation is underspecified here, later pass/fail, history, readiness, and results units can drift into conflicting evaluation logic and non-auditable exam outcomes.

## Open Questions

Exact weighting models, partial-credit rules, and manual review handling can be refined later as long as baseline score calculation remains deterministic, traceable, and tied to submitted attempt data.

## Last Updated

2026-04-29
