# Functional design: U10-4-company-view-applications

## Purpose

Define the baseline company-view-applications flow so authorized company users can review applications attached to their vacancies using stable status and approved student-visible data.

## User story

As an authorized company user, I need to review applications to my company’s vacancies so I can understand current candidate pipeline state within approved privacy and authorization boundaries.

## Functional requirements

### 1. Company-view-applications scope

- This unit covers company-side viewing of applications only.
- The baseline should support:
  - loading one authorized company context
  - retrieving applications attached to company-owned vacancies
  - presenting stable application status and limited candidate context
  - supporting list-level review of application state across vacancies
- Shortlist, rejection, interview, and notification actions remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized company users should access applications for their own company vacancies.
- Company users must not access applications belonging to another company’s vacancies.
- Student data shown within application review must respect privacy, consent, and allowed company-visibility rules.
- Protected student data not approved for company review must remain masked or unavailable even when an application exists.

### 3. Application-review behavior

- The company applications view should use authoritative application current status and status-history context.
- The baseline should support list entries that include:
  - application identity
  - vacancy context
  - approved student identity or summary fields
  - current status
  - timestamps useful for review order
- Repeated evaluation of the same authorized company context and application set should produce the same visible records and status posture unless application state changes legitimately.

### 4. Explainability and workflow posture

- Company users should be able to distinguish application review from recommendation and from later action steps.
- The applications view may show relevant context such as submitted time, current status, or limited recommendation context where approved, but it must not redefine matching or ranking logic.
- Viewing applications must not itself change application state.
- Company review remains a human workflow support surface and must not represent automated candidate decisions.

### 5. Relationship to later units

- U10-2 application status tracking should own the shared status vocabulary consumed by this view.
- U10-5 shortlist candidates and U10-6 reject candidates should act on applications surfaced through authorized company review without redefining visibility boundaries.
- Later interview and notification units may consume reviewed applications as workflow inputs but must not bypass company-boundary and privacy rules established here.
- U11 candidate-review units may build richer profile-review experiences on top of this authorized application context.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U6-3 company view student results
- U6-4 privacy filter for results
- U7-4 vacancy list
- U7-5 vacancy detail
- U10-1 apply to job
- U10-2 application status tracking
- U10-3 withdraw application

## Outputs

- Baseline company-side application-review flow
- Authorization, visibility, and status-consumption expectations
- Integration expectations for later shortlist, rejection, and candidate-review units

## User flow

1. An authorized company user opens the applications area or a vacancy-specific application view.
2. Backend verifies company membership and vacancy ownership boundaries.
3. The platform retrieves authorized applications with shared current-status context.
4. The platform applies privacy-safe shaping to candidate fields and application details.
5. The company user receives a stable application list for review without triggering workflow state changes.

## Acceptance criteria

- Company-view-applications behavior is documented clearly.
- Authorization, privacy, and status-consumption boundaries are defined.
- The unit stays separate from shortlist, rejection, and interview actions.
- Student data visibility remains constrained by approved rules.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- State-changing company workflow actions
- Matching recalculation or ranking logic redesign
- Interview scheduling
- Notifications
