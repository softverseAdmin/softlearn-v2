# Functional design: U7-1-vacancy-create

## Purpose

Define the baseline protected vacancy-creation flow so authorized company users can create structured vacancy records that later listing, detail, search, application, and matching units can consume consistently.

## User story

As an authenticated company user, I need vacancy creation so the platform can represent a structured hiring opportunity for my company without relying on ad hoc job records.

## Functional requirements

### 1. Vacancy-creation scope

- This unit covers creation of vacancy records only.
- The baseline should support:
  - opening a protected vacancy-creation flow in the authenticated company context
  - entering required vacancy information
  - validating the submitted vacancy definition
  - creating a structured **Vacancy** record with a stable outcome
- Vacancy editing, deletion, listing, detail viewing, skill tags, language requirements, location settings, student search, and matching remain separate later units.

### 2. Protected company authoring access

- Vacancy creation must be treated as a protected company action.
- Only authenticated users bound to the same company context may create vacancies through this baseline.
- Students and other companies must not create vacancies here.
- Admin access, if needed later, must remain purposeful, logged, and policy-bound rather than replacing company ownership by default.

### 3. Vacancy data and validation

- Vacancy creation should produce a structured **Vacancy** record rather than an untyped posting blob.
- The baseline should support core vacancy fields such as title, summary or description, employment type, experience direction, and publication-ready metadata needed for later workflows.
- Validation failures such as missing required fields, malformed values, unsupported combinations, or unauthorized company context must return stable outcomes.
- Newly created vacancies should support a controlled non-public or draft posture until later visibility, listing, and search rules are confirmed.

### 4. Ownership and publication posture

- A vacancy should belong to the company that created it.
- Vacancy creation should define enough metadata for later company management, listing, detail, and search units without assuming immediate student visibility.
- Public or student-facing visibility should depend on later approved listing, detail, and search behavior rather than being assumed automatically at creation time.
- Company hiring preferences may inform authoring defaults later, but vacancy creation should remain a vacancy-specific record rather than a rewrite of company defaults.

### 5. Frontend and API alignment

- The protected vacancy-creation flow belongs in an authenticated company route area rather than a student route area.
- The final API shape for vacancy creation may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most vacancy-creation form state should remain local to the feature rather than promoted to global state unless reuse is justified later.

### 6. Relationship to later units

- U7-2 vacancy edit should update the same vacancy record created here.
- U7-3 vacancy delete should operate on the same company-owned vacancy identity.
- U7-4 vacancy list and U7-5 vacancy detail should build on the vacancy records created here.
- U7-6 through U7-8 should attach structured requirement records to the vacancy without redefining vacancy ownership or identity.

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
- U3-3 company profile basic
- U3-4 company profile description
- U3-5 company hiring preferences

## Outputs

- Baseline protected vacancy-creation flow
- Company ownership and validation expectations for vacancy records
- Integration expectations for later vacancy management, search, and matching units

## User flow

1. Authenticated company user enters the protected vacancy-creation area.
2. Frontend presents the required vacancy-creation form in the company context.
3. The user provides vacancy metadata and submits the vacancy definition.
4. Backend validates company ownership and structured vacancy rules, then creates the vacancy with a stable outcome.
5. The new vacancy becomes available for later editing, detail management, requirement attachment, and approved listing behavior.

## Acceptance criteria

- Vacancy-creation behavior is documented clearly.
- Protected company authoring and ownership boundaries are defined.
- Structured vacancy-record expectations and validation outcomes are documented.
- The unit is kept separate from editing, deletion, listing, detail, and requirement-tag logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy editing or deletion workflows
- Vacancy listing or detail presentation
- Structured skill, language, or location requirements
- Student-facing search behavior
- Matching or application logic
