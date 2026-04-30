# Unit: U18-5-manage-vacancies

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement the protected admin manage-vacancies workflow so authorized admins can perform vacancy listing, creation, updating, and deactivation with audit-friendly deterministic behavior.

## Out of Scope

Bulk-import tooling, External ATS synchronization, Company self-service vacancy workflows, and Heavy analytics.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

Admins can manage vacancies through protected backend and frontend flows while preserving company linkage, creator invariants, and deterministic inactive-state handling.

## Risks

The current vacancy model requires a company-linked company user as creator, so admin management must preserve that invariant or risk invalid vacancy ownership.

## Open Questions

Later units can add richer audit trails, filtering, and moderation-specific controls if admin operations need deeper intervention tooling.

## Last Updated

2026-04-30
