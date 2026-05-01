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

Implement deterministic server-side scoring for submitted single-choice exam attempts using protected answer-option correctness metadata.

## Out of Scope

Partial-credit models, manual review, weighted advanced scoring variants, and company-facing score access.

## Dependencies

Depends on protected answer submission and shared exam-question-option data.

## Acceptance Criteria

Each submitted eligible attempt receives a deterministic score outcome tied to the shared exam definition.

## Risks

If scoring logic and structured question data diverge, exam history and retake behavior become unreliable.

## Open Questions

Additional weighting models can be added later while preserving the same deterministic scoring baseline.

## Last Updated

2026-05-01

