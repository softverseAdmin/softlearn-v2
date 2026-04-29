# Functional design: U7-2-vacancy-edit

## Purpose

Define the baseline protected vacancy-edit flow so authorized company users can update an existing company-owned vacancy record consistently across later listing, detail, search, and matching units.

## User story

As an authenticated company user, I need vacancy editing so I can keep my company’s job opportunity accurate over time without recreating the vacancy from scratch.

## Functional requirements

### 1. Vacancy-edit scope

- This unit covers updates to an existing vacancy record only.
- The baseline should support:
  - opening a protected vacancy-edit flow for a chosen company-owned vacancy
  - viewing the current editable vacancy state
  - updating supported vacancy fields
  - validating the submitted changes and returning a stable outcome
- Vacancy creation, deletion, listing, detail viewing, skill tags, language requirements, location settings, student search, and matching remain separate later units.

### 2. Protected company authoring access

- Vacancy editing must be treated as a protected company action.
- Only authenticated users bound to the same company context may edit that company’s vacancies through this baseline.
- Students and other companies must not update another company’s vacancy records.
- Admin access, if needed later, must remain purposeful, logged, and policy-bound rather than replacing company ownership by default.

### 3. Vacancy update data and validation

- Vacancy editing should update a structured **Vacancy** record linked to the company context.
- The baseline should support editing core vacancy fields such as title, summary or description, employment type, experience direction, and publication-ready metadata where allowed.
- Validation failures such as unsupported field combinations, malformed values, missing target vacancy context, or unauthorized company ownership must return stable outcomes.
- Successful updates should preserve the vacancy identity used by later listing, detail, search, requirement-tag, application, and matching units.

### 4. Ownership and publication posture

- Vacancy editing must preserve company ownership of the vacancy.
- Editing should not silently broaden public or student visibility beyond the approved publication posture.
- Later publication or moderation rules may restrict which changes affect visible vacancy state, but the baseline should already assume controlled update behavior.
- Company hiring preferences may inform editing defaults later, but vacancy editing remains vacancy-specific rather than a rewrite of company defaults.

### 5. Frontend and API alignment

- The protected vacancy-edit flow belongs in an authenticated company route area rather than a student route area.
- The final API shape for vacancy editing may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most vacancy-edit form state should remain local to the feature rather than promoted to global state unless reuse is justified later.

### 6. Relationship to later units

- U7-3 vacancy delete should operate on the same company-owned vacancy identity updated here.
- U7-4 vacancy list and U7-5 vacancy detail should reflect the edited vacancy state according to later visibility rules.
- U7-6 through U7-8 should continue attaching structured requirement records to the same vacancy identity.
- Later application and matching units should consume the edited vacancy definition rather than stale parallel records.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U3-5 company hiring preferences
- U7-1 vacancy create

## Outputs

- Baseline protected vacancy-edit flow
- Company ownership and validation expectations for vacancy updates
- Integration expectations for later vacancy management, search, and matching units

## User flow

1. Authenticated company user enters the protected vacancy-edit area for one of the company’s vacancies.
2. Frontend loads the current editable vacancy state.
3. The user changes supported vacancy fields and submits the update.
4. Backend validates company ownership and structured vacancy rules, then updates the vacancy with a stable outcome.
5. The updated vacancy state becomes available to later detail, listing, search, and requirement-tag units according to approved visibility rules.

## Acceptance criteria

- Vacancy-edit behavior is documented clearly.
- Protected company authoring and ownership boundaries are defined.
- Structured vacancy-update expectations and validation outcomes are documented.
- The unit is kept separate from creation, deletion, listing, detail, and requirement-tag logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy creation or deletion workflows
- Vacancy listing or detail presentation
- Structured skill, language, or location requirements
- Student-facing search behavior
- Matching or application logic
