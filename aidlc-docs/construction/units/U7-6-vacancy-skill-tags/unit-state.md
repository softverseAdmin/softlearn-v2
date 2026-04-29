# Unit: U7-6-vacancy-skill-tags

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline vacancy-skill-tags flow so authorized company users can attach structured skill requirements to an existing vacancy without collapsing language requirements, location settings, or matching behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, vacancy CRUD behavior, language requirements, location settings, student search filters, applications, and matching calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, RBAC, API, vacancy-create, vacancy-edit, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

The unit documents structured vacancy skill-tag behavior, company ownership boundaries, and relationship to later search and matching units without producing application code.

## Risks

If vacancy skill tags are underspecified here, later search, matching, and application-readiness units can drift into conflicting skill-requirement definitions and vacancy taxonomy expectations.

## Open Questions

Exact required-versus-preferred skill semantics, proficiency granularity, and bulk-tagging workflows can be refined later as long as structured vacancy skill tagging remains explicit and vacancy-linked.

## Last Updated

2026-04-29
