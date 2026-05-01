# Unit: U9-3-exam-score-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Use exam-result averages as deterministic readiness evidence within the matching flow.

## Out of Scope

Adaptive psychometrics, proctoring analytics, and ML-based performance prediction.

## Dependencies

Depends on the exam-results-summary baseline, privacy controls, rule-based matching strategy, and match-score-calculation unit.

## Acceptance Criteria

Exam evidence affects readiness scoring consistently, missing exam evidence is surfaced as an explicit gap, and the effect is visible in match payloads.

## Risks

If exam scoring dominates readiness, students with narrow test history can be over-promoted or under-ranked.

## Open Questions

Future versions can weight specific exam categories differently if the method stays transparent and deterministic.

## Last Updated

2026-04-30
