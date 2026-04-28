# Functional design: U0-5-data-model-high-level-design

## Purpose

Define a shared high-level conceptual data model before detailed schema, API, and persistence work begins.

## User story

As a team, we need a stable conceptual data model so later units can design features, permissions, matching logic, and reporting consistently across the platform.

## Functional requirements

### 1. Required data domains

- identity and access
- student profile and privacy
- company profile and company membership
- learning
- exams and exam preparation
- vacancies and job search
- matching and readiness scoring
- applications and company review
- interview scheduling and meeting links
- notifications
- consent and audit

### 2. Modeling requirements

- Identify the core conceptual entities for each domain.
- Show major relationship intent between those entities.
- Separate shared taxonomies from role-specific records.
- Make privacy, consent, and auditability first-class data concerns.
- Keep the model implementation-agnostic and field-agnostic.

## Inputs

- Requirements baseline
- Persona definitions
- Feature breakdown
- Architecture direction

## Outputs

- Updated inception high-level data model
- A shared conceptual vocabulary for later schema and service design
- Clear relationship guidance for permissions, matching, interviews, and admin workflows

## User flow

1. Group platform needs into data domains.
2. Identify the core entities inside each domain.
3. Define high-level relationships between users, learning, matching, hiring, and privacy records.
4. Make consent and audit records explicit rather than implicit.

## Acceptance criteria

- Identity, learning, assessment, hiring, privacy, and audit domains are all represented.
- Shared taxonomies such as skills and language levels are modeled clearly.
- Consent and audit entities are visible.
- The model remains conceptual and technology-agnostic.
- No application code is introduced.

## Out of scope

Field-level schema, migrations, query optimization, and database-engine-specific features.
