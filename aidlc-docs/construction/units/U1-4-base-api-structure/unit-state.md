# Unit: U1-4-base-api-structure

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the base REST API structure for authentication, profiles, learning, exams, jobs, matching, applications, interviews, and notifications.

## Out of Scope

Application code, controller implementation, framework routing code, and persistence-layer implementation.

## Dependencies

Uses U0-3 core feature breakdown, U0-4 architecture, U0-5 high-level data model, and U0-6 rule-based matching strategy.

## Acceptance Criteria

- RESTful API principles are documented.
- Required endpoints, sample JSON, auth rules, authorization rules, and standard error format are defined.
- Matching APIs are explicitly rule-based.
- No application code is produced.

## Risks

Weak or inconsistent API contracts can create rework across backend, frontend, auth, and permissions.

## Open Questions

Exact pagination shape, refresh-token lifecycle, and final validation rule details may be refined during implementation.

## Last Updated

2026-04-28
