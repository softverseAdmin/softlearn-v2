# Unit: U9-4-language-level-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement deterministic language-factor matching against structured vacancy language requirements using normalized student Japanese and English levels.

## Out of Scope

Third-party certification ingestion, spoken-interview analysis, and ML-based language estimation.

## Dependencies

Depends on student language profiles, vacancy language requirements, rule-based matching strategy, and match-score-calculation.

## Acceptance Criteria

Language requirements are compared consistently, required language baselines carry higher weight, and the resulting strengths and gaps are returned in match responses.

## Risks

If language normalization is inconsistent, identical student profiles can receive different scores for the same vacancy requirements.

## Open Questions

Additional certification aliases can be added later if they continue to map to deterministic internal levels.

## Last Updated

2026-04-30
