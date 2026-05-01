# Unit: U14-3-mock-exam

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected mock-exam delivery and scoring with separate mock-attempt persistence and student-only history.

## Out of Scope

Official exam submission, adaptive difficulty, proctoring, and external exam-delivery providers.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

Students can take mock exams and review mock-only results without changing official exam pass/fail or retake state.

## Risks

If mock and official attempt records are mixed, students and admins cannot distinguish preparation evidence from certification evidence.

## Open Questions

Timers, partial progress, and deeper mock review screens can be added later without changing the separation contract shipped here.

## Last Updated

2026-05-01
