# Unit: U9-5-location-preference-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement deterministic location-preference scoring that compares student preferences with vacancy location and work-style flexibility.

## Out of Scope

Commute-time estimation, map integration, relocation-cost optimization, and dynamic geography services.

## Dependencies

Depends on student profile basics, vacancy location settings, rule-based matching strategy, and match-score-calculation.

## Acceptance Criteria

Location and work-style alignment contributes predictably to matching, including explicit partial credit for hybrid and remote roles.

## Risks

If flexible work styles are not handled clearly, students can receive misleading scores for remote or hybrid opportunities.

## Open Questions

Future versions can add finer-grained regional preferences if the scoring remains deterministic and explainable.

## Last Updated

2026-04-30
