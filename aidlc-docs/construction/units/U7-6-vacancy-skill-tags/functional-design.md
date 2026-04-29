# Functional design: U7-6-vacancy-skill-tags

## Purpose

Define the baseline vacancy-skill-tags flow so authorized company users can attach structured skill requirements to a vacancy using the shared skill taxonomy.

## User story

As an authenticated company user, I need vacancy skill tags so the platform can represent the skills a role needs in a structured form that later search and matching workflows can understand consistently.

## Functional requirements

### 1. Vacancy-skill-tags scope

- This unit covers structured skill requirements attached to an existing vacancy only.
- The baseline should support:
  - viewing the current skill requirements for a vacancy
  - adding structured skill tags to a vacancy
  - updating or removing skill requirements where product rules allow
  - distinguishing required and preferred skill expectations in a stable way
- Language requirements, location settings, student search filters, applications, and matching remain separate later units.

### 2. Protected company authoring access

- Vacancy skill-tag management must be treated as a protected company action.
- Only authenticated users bound to the same company context may manage skill requirements for that company’s vacancies.
- Students and other companies must not modify another company’s vacancy skill requirements.
- Admin access, if needed later, must remain purposeful, logged, and policy-bound.

### 3. Structured skill data and validation

- Vacancy skill tags should produce structured **VacancySkillRequirement** records linked to an existing **Vacancy** and shared **Skill** taxonomy.
- The baseline should support stable attributes such as skill identity, requirement type, and optional priority or strength indicators suitable for later search and matching.
- Validation failures such as invalid vacancy context, unknown skill references, duplicate requirements, malformed requirement types, or unauthorized ownership must return stable outcomes.
- Skill requirements should remain structured rather than collapsing into free-text requirement paragraphs.

### 4. Ownership and downstream posture

- Skill requirements must preserve the same company ownership and vacancy identity established in the vacancy CRUD units.
- Skill tags should enrich vacancy summary and detail behavior later without redefining vacancy visibility posture.
- Later search and matching units may consume skill requirements as structured inputs, but they must preserve explainability and not invent alternate skill data models.
- Company hiring preferences may inform defaults later, but vacancy skill tags remain vacancy-specific rather than company-global.

### 5. Frontend and API alignment

- Vacancy skill-tag management belongs in an authenticated company route area rather than a student route area.
- The final API shape for vacancy skill tags may be refined later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most skill-tag state should remain local to the vacancy feature unless later reuse justifies broader state sharing.

### 6. Relationship to later units

- U7-7 vacancy language requirements and U7-8 vacancy location settings remain separate requirement units and must not redefine skill requirements.
- Phase 8 search filters and later matching units should consume the structured skill requirements defined here.
- Later application and candidate-review units may use skill requirements as context but must not redefine the vacancy skill model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U3-5 company hiring preferences
- U7-1 vacancy create
- U7-2 vacancy edit
- U7-4 vacancy list
- U7-5 vacancy detail

## Outputs

- Baseline vacancy-skill-tags flow
- Structured skill-requirement ownership and validation expectations
- Integration expectations for later search, application, and matching units

## User flow

1. Authenticated company user opens the skill-requirements area for an existing vacancy.
2. Frontend loads the current structured skill requirements.
3. The user adds, updates, or removes skill requirements using the shared taxonomy.
4. Backend validates company ownership, vacancy identity, and structured skill rules, then records the stable outcome.
5. Later vacancy detail, search, and matching units consume the resulting skill requirements.

## Acceptance criteria

- Vacancy skill-tag behavior is documented clearly.
- Protected company ownership and vacancy-link boundaries are defined.
- Structured skill-requirement expectations and validation outcomes are documented.
- The unit is kept separate from language requirements, location settings, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy CRUD behavior
- Language or location requirement handling
- Search filter behavior
- Matching calculation
- Application workflow behavior
