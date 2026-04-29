# Functional design: U7-3-vacancy-delete

## Purpose

Define the baseline protected vacancy-delete flow so authorized company users can remove or retire company-owned vacancies consistently across later listing, detail, search, application, and matching units.

## User story

As an authenticated company user, I need vacancy deletion so I can stop offering a role or remove an invalid posting without leaving stale vacancies in later company and student workflows.

## Functional requirements

### 1. Vacancy-delete scope

- This unit covers removal or retirement of an existing vacancy record only.
- The baseline should support:
  - opening a protected vacancy-delete action for a chosen company-owned vacancy
  - confirming the removal action in a stable and understandable way
  - applying the approved delete, retire, or withdrawal outcome to the vacancy record
  - returning a stable outcome for later company management and visibility behavior
- Vacancy creation, editing, listing, detail viewing, skill tags, language requirements, location settings, student search, and matching remain separate later units.

### 2. Protected company authoring access

- Vacancy deletion must be treated as a protected company action.
- Only authenticated users bound to the same company context may remove that company’s vacancies through this baseline.
- Students and other companies must not delete another company’s vacancy records.
- Admin access, if needed later, must remain purposeful, logged, and policy-bound rather than replacing company ownership by default.

### 3. Removal behavior and validation

- Vacancy deletion should operate on a structured **Vacancy** record linked to the company context.
- The baseline should support a stable removal outcome such as deleted, withdrawn, or inactive according to later implementation choices.
- Validation failures such as missing target vacancy context, unsupported removal state, blocked removal conditions, or unauthorized company ownership must return stable outcomes.
- Later implementation may choose hard delete, soft delete, or archive behavior, but the baseline should already preserve a clear distinction between active and removed vacancy state.

### 4. Ownership and visibility posture

- Vacancy deletion must preserve company ownership rules around who can remove a vacancy.
- Removal must prevent the vacancy from continuing to appear as active in later approved listing, detail, search, application, and matching flows.
- Later policy may preserve an internal audit-friendly record of removed vacancies, but the baseline should already assume that removed vacancies are no longer treated as active opportunities.
- Vacancy deletion should not silently erase related policy, audit, or company-boundary expectations.

### 5. Frontend and API alignment

- The protected vacancy-delete action belongs in an authenticated company route area rather than a student route area.
- The final API shape for vacancy deletion may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Company-side confirmation and result state should remain clear and local to the feature rather than overloading global state.

### 6. Relationship to later units

- U7-4 vacancy list and U7-5 vacancy detail should reflect the removed or inactive vacancy state according to later visibility rules.
- U7-6 through U7-8 should not redefine removal behavior for requirement records attached to the vacancy.
- Later application, search, and matching units should consume the active-versus-removed vacancy posture defined here rather than inventing alternate vacancy availability rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-8 base UI layout
- U7-1 vacancy create
- U7-2 vacancy edit

## Outputs

- Baseline protected vacancy-delete flow
- Company ownership and stable-removal expectations for vacancy records
- Integration expectations for later vacancy management, search, and matching units

## User flow

1. Authenticated company user selects a company-owned vacancy for removal.
2. Frontend presents a clear protected delete or withdraw action with confirmation behavior.
3. Backend validates company ownership and the target vacancy state.
4. The platform applies the stable removal outcome and returns a clear result.
5. Later listing, detail, search, application, and matching units treat the vacancy according to the removed or inactive posture defined here.

## Acceptance criteria

- Vacancy-delete behavior is documented clearly.
- Protected company authoring and ownership boundaries are defined.
- Stable removal expectations and validation outcomes are documented.
- The unit is kept separate from creation, editing, listing, detail, and requirement-tag logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy creation or editing workflows
- Vacancy listing or detail presentation
- Structured skill, language, or location requirements
- Student-facing search behavior
- Matching or application logic
