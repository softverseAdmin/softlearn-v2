# Unit: U6-5-readiness-score-calculation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline readiness-score calculation flow so the platform can derive a deterministic, explainable readiness measure from protected learning and exam evidence without collapsing company-facing visibility or full vacancy matching into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, company-facing readiness exposure rules, full vacancy match scoring, ML or LLM-based ranking, and analytics beyond the baseline readiness-score calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, student-learning-summary, student-exam-results-summary, company-view-student-results, privacy-filter-for-results, and AI-matching-strategy-design baselines.

## Acceptance Criteria

The unit documents deterministic readiness-score calculation, explainability boundaries, and relationship to later matching and visibility units without producing application code.

## Risks

If readiness-score calculation is underspecified here, later matching, company-result visibility, and student-guidance units can drift into conflicting scoring logic, opaque decision rules, and non-auditable readiness signals.

## Open Questions

Exact readiness weighting, score bands, and student-guidance wording can be refined later as long as baseline readiness scoring remains deterministic, explainable, and privacy-aware.

## Last Updated

2026-04-29
