# Unit: U0-5-data-model-high-level-design

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

Code Generation note: N/A for this inception unit. No application code is expected.

## Scope

Define the conceptual entities and relationships that support identity, learning, exams, vacancies, matching, applications, interviews, privacy, and auditability.

## Out of Scope

Physical schema design, migrations, ORM definitions, and chosen database features.

## Dependencies

Requires baseline requirements, personas, feature breakdown, and architecture direction.

## Acceptance Criteria

- Core entities are identified.
- Privacy and audit entities are included.
- Matching, notification, and interview entities are included.
- No application code is produced.

## Risks

Missing or poorly bounded entities can force later redesign across schema, matching, permissions, and reporting.

## Open Questions

Normalization, field detail, and storage-specific choices are intentionally deferred to later schema units.

## Last Updated

2026-04-28
