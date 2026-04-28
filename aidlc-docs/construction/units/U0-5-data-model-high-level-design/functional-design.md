# Functional design: U0-5-data-model-high-level-design

## Purpose

Define a shared high-level data vocabulary before detailed schema work begins.

## User story

As a team, we need a stable conceptual model so later units can design features consistently.

## Functional requirements

- Identify user, learning, assessment, hiring, privacy, and audit entities.
- Show major relationship intent.
- Keep the model implementation-agnostic.

## Inputs

- Requirements baseline
- Feature breakdown
- Architecture direction

## Outputs

- High-level data model document

## User flow

1. List major domain entities.
2. Clarify their relationship intent.
3. Flag privacy and audit records explicitly.

## Acceptance criteria

- Learning and hiring entities are both represented.
- Consent and audit entities are visible.

## Out of scope

Field-level schema and database engine features.
