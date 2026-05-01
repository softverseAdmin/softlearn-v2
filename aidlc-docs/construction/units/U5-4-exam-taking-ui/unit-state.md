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

Implement protected student exam-taking routes that present active exam questions and options with local answer state and explicit submission.

## Out of Scope

Autosave, interruption recovery, anti-cheat controls, and non-student exam preview flows.

## Dependencies

Depends on shared exam, question, and option records plus protected student routing.

## Acceptance Criteria

Eligible students can open an exam-taking route, review questions safely, and prepare answers for submission.

## Risks

If student-taking routes expose correctness metadata or unavailable exams, assessment integrity is compromised.

## Open Questions

Richer timer and pagination UX can be added later without changing the protected taking contract.

## Last Updated

2026-05-01

