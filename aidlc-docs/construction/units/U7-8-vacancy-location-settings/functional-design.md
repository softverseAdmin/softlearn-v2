# Functional design: U7-8-vacancy-location-settings

## Purpose

Define the baseline vacancy-location-settings flow so authorized company users can attach structured location and work-style expectations to a vacancy for consistent downstream search and matching behavior.

## User story

As an authenticated company user, I need vacancy location settings so the platform can represent where and how a role is performed in a structured form that later search and matching workflows can understand consistently.

## Functional requirements

### 1. Vacancy-location-settings scope

- This unit covers structured location and work-style settings attached to an existing vacancy only.
- The baseline should support:
  - viewing the current location and work-style settings for a vacancy
  - adding structured location expectations to a vacancy
  - updating or removing location settings where product rules allow
  - representing remote, hybrid, onsite, relocation, or other approved work-style posture in a stable way
- Skill tags, language requirements, student search filters, applications, and matching remain separate later units.

### 2. Protected company authoring access

- Vacancy location-settings management must be treated as a protected company action.
- Only authenticated users bound to the same company context may manage location settings for that company’s vacancies.
- Students and other companies must not modify another company’s vacancy location settings.
- Admin access, if needed later, must remain purposeful, logged, and policy-bound.

### 3. Structured location data and validation

- Vacancy location settings should produce structured **VacancyLocationPreference** records linked to an existing **Vacancy**.
- The baseline should support stable attributes such as location identity, work-style posture, relocation or region scope where allowed, and other approved structured indicators suitable for later search and matching.
- Validation failures such as invalid vacancy context, malformed work-style combinations, duplicate location settings, unsupported mixed-location posture, or unauthorized ownership must return stable outcomes.
- Location settings should remain structured rather than collapsing into free-text location paragraphs.

### 4. Ownership and downstream posture

- Location settings must preserve the same company ownership and vacancy identity established in the vacancy CRUD units.
- Location settings should enrich vacancy summary and detail behavior later without redefining vacancy visibility posture.
- Later search and matching units may consume location settings as structured inputs, but they must preserve explainability and not invent alternate location data models.
- Company hiring preferences may inform defaults later, but vacancy location settings remain vacancy-specific rather than company-global.

### 5. Frontend and API alignment

- Vacancy location-settings management belongs in an authenticated company route area rather than a student route area.
- The final API shape for vacancy location settings may be refined later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most location-setting state should remain local to the vacancy feature unless later reuse justifies broader state sharing.

### 6. Relationship to later units

- U7-6 vacancy skill tags and U7-7 vacancy language requirements remain separate requirement units and must not redefine location settings.
- Phase 8 search filters and later matching units should consume the structured location settings defined here.
- Later application and candidate-review units may use location settings as context but must not redefine the vacancy location model.

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

- Baseline vacancy-location-settings flow
- Structured location-setting ownership and validation expectations
- Integration expectations for later search, application, and matching units

## User flow

1. Authenticated company user opens the location-settings area for an existing vacancy.
2. Frontend loads the current structured location and work-style settings.
3. The user adds, updates, or removes location settings using approved structured options.
4. Backend validates company ownership, vacancy identity, and structured location rules, then records the stable outcome.
5. Later vacancy detail, search, and matching units consume the resulting location settings.

## Acceptance criteria

- Vacancy location-settings behavior is documented clearly.
- Protected company ownership and vacancy-link boundaries are defined.
- Structured location-setting expectations and validation outcomes are documented.
- The unit is kept separate from skill tags, language requirements, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy CRUD behavior
- Skill tags or language requirements
- Search filter behavior
- Matching calculation
- Application workflow behavior
