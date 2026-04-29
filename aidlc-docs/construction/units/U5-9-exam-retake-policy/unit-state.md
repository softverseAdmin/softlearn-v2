# Unit: U5-9-exam-retake-policy

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline exam-retake policy flow so the platform can determine whether a student may attempt an exam again without collapsing history presentation, scoring, or company-facing visibility into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, exam creation, question creation, answer-options management, exam-taking UI rendering, answer submission persistence, score calculation internals, pass/fail rule definition, exam history presentation, and company-facing result visibility.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, routing, answer-submission, score-calculation, pass-fail-logic, and exam-history baselines.

## Acceptance Criteria

The unit documents retake-policy rules, eligibility boundaries, and relationship to prior attempt history without producing application code.

## Risks

If exam retake policy is underspecified here, later student exam access, history interpretation, readiness signals, and results visibility units can drift into conflicting eligibility and fairness rules.

## Open Questions

Exact cooldown periods, maximum-attempt limits, and admin exception workflows can be refined later as long as baseline retake policy remains explicit, deterministic, and attempt-history-aware.

## Last Updated

2026-04-29
