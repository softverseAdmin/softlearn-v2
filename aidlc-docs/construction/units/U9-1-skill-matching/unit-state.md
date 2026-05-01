# Unit: U9-1-skill-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement deterministic skill-factor scoring so vacancy skill requirements are compared against student skills with explainable required-versus-preferred weighting.

## Out of Scope

Skill synonym expansion, ML-driven skill inference, and external recommendation services.

## Dependencies

Depends on the requirements, rule-based matching strategy, student-profile-skills, vacancy-skill-tags, matched-student-list, and matched-jobs units.

## Acceptance Criteria

Student and company matching flows use the same deterministic skill-factor logic, expose explainable strengths and gaps, and rank stronger skill alignment ahead of weaker matches.

## Risks

If required-versus-preferred weighting drifts across endpoints, student and company views can disagree on match order and explanations.

## Open Questions

Skill taxonomy equivalence and synonym normalization can be expanded later if they preserve deterministic scoring.

## Last Updated

2026-04-30
