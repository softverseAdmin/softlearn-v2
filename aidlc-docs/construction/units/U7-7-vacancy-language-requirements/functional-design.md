# Functional design: U7-7-vacancy-language-requirements

## Purpose

Define the baseline vacancy-language-requirements flow so authorized company users can attach structured language expectations to a vacancy using the shared language-level model.

## User story

As an authenticated company user, I need vacancy language requirements so the platform can represent language expectations for a role in a structured form that later search and matching workflows can understand consistently.

## Functional requirements

### 1. Vacancy-language-requirements scope

- This unit covers structured language requirements attached to an existing vacancy only.
- The baseline should support:
  - viewing the current language requirements for a vacancy
  - adding structured language expectations to a vacancy
  - updating or removing language requirements where product rules allow
  - distinguishing required and preferred language expectations in a stable way
- Skill tags, location settings, student search filters, applications, and matching remain separate later units.

### 2. Protected company authoring access

- Vacancy language-requirements management must be treated as a protected company action.
- Only authenticated users bound to the same company context may manage language requirements for that company’s vacancies.
- Students and other companies must not modify another company’s vacancy language requirements.
- Admin access, if needed later, must remain purposeful, logged, and policy-bound.

### 3. Structured language data and validation

- Vacancy language requirements should produce structured **VacancyLanguageRequirement** records linked to an existing **Vacancy** and shared **LanguageLevel** model.
- The baseline should support stable attributes such as language identity, minimum level, requirement type, and optional priority indicators suitable for later search and matching.
- Validation failures such as invalid vacancy context, unknown language references, malformed level combinations, duplicate requirements, or unauthorized ownership must return stable outcomes.
- Language requirements should remain structured rather than collapsing into free-text requirement paragraphs.

### 4. Ownership and downstream posture

- Language requirements must preserve the same company ownership and vacancy identity established in the vacancy CRUD units.
- Language requirements should enrich vacancy summary and detail behavior later without redefining vacancy visibility posture.
- Later search and matching units may consume language requirements as structured inputs, but they must preserve explainability and not invent alternate language data models.
- Company hiring preferences may inform defaults later, but vacancy language requirements remain vacancy-specific rather than company-global.

### 5. Frontend and API alignment

- Vacancy language-requirements management belongs in an authenticated company route area rather than a student route area.
- The final API shape for vacancy language requirements may be refined later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most language-requirement state should remain local to the vacancy feature unless later reuse justifies broader state sharing.

### 6. Relationship to later units

- U7-6 vacancy skill tags and U7-8 vacancy location settings remain separate requirement units and must not redefine language requirements.
- Phase 8 search filters and later matching units should consume the structured language requirements defined here.
- Later application and candidate-review units may use language requirements as context but must not redefine the vacancy language model.

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

- Baseline vacancy-language-requirements flow
- Structured language-requirement ownership and validation expectations
- Integration expectations for later search, application, and matching units

## User flow

1. Authenticated company user opens the language-requirements area for an existing vacancy.
2. Frontend loads the current structured language requirements.
3. The user adds, updates, or removes language requirements using the shared language-level model.
4. Backend validates company ownership, vacancy identity, and structured language rules, then records the stable outcome.
5. Later vacancy detail, search, and matching units consume the resulting language requirements.

## Acceptance criteria

- Vacancy language-requirements behavior is documented clearly.
- Protected company ownership and vacancy-link boundaries are defined.
- Structured language-requirement expectations and validation outcomes are documented.
- The unit is kept separate from skill tags, location settings, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy CRUD behavior
- Skill tags or location settings
- Search filter behavior
- Matching calculation
- Application workflow behavior
