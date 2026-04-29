# Functional design: U11-4-candidate-shortlist

## Purpose

Define the baseline candidate-shortlist view and management posture so authorized company users can review shortlisted candidates using the shortlist state created earlier without redefining shortlist action rules.

## User story

As an authorized company user, I need a dedicated shortlist view so I can review the candidates our company has already shortlisted and continue the hiring workflow consistently.

## Functional requirements

### 1. Candidate-shortlist scope

- This unit covers candidate shortlist only.
- The baseline should support:
  - loading a protected shortlist view scoped to the current company
  - showing shortlisted candidates with stable summary fields and current application or interview context
  - supporting deterministic shortlist-state inspection and later management entry points
  - returning stable outcomes when no candidates are currently shortlisted
- new shortlist-action rules, candidate-note behavior beyond linkage, interview scheduling detail, offer workflows, and heavy ranking analytics remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated company users may access shortlist records for their own company.
- Company users must not see another company's shortlist entries or candidate context.
- Shortlist visibility must remain limited to company-safe student summaries and approved application context.
- Shortlist browsing and management entry points should remain auditable.

### 3. Shortlist-view behavior

- The shortlist view should consume existing shortlist state rather than implicitly creating new shortlist entries.
- The baseline should support stable summary fields such as candidate preview, originating vacancy or application context, shortlist timestamp, and current downstream workflow state where permitted.
- Shortlist ordering, prioritization, and recruiter collaboration behavior may evolve later, but the underlying shortlist state must remain deterministic and traceable.
- This unit must stay separate from terminal rejection, interview scheduling, and notification delivery.

### 4. Frontend and API alignment

- The capability belongs in protected company-side routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most candidate-review state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Deterministic, explainable, and auditable review outcomes should be preserved.

### 5. Relationship to later units

- U10-5 shortlist candidates remains the source unit for creating shortlist state.
- U11-5 candidate notes may attach to shortlisted candidates later without redefining shortlist ownership rules.
- U12 interview-management units may consume shortlist context for progression into interview workflows.
- Later dashboard and analytics units may aggregate shortlist counts without changing shortlist semantics.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-2 application status tracking
- U10-4 company-view-applications
- U10-5 shortlist-candidates
- U11-1 student-profile-preview-for-company

## Outputs

- Baseline protected candidate-shortlist view
- Shortlist-summary and ownership expectations
- Integration expectations for notes, interviews, and dashboard aggregation

## User flow

1. An authorized company user opens the shortlist area for their company.
2. Backend verifies the current session and company ownership boundary.
3. The platform loads existing shortlist entries and the allowed candidate summaries connected to them.
4. The company user receives a stable shortlist view or an empty shortlist outcome.
5. Later notes, interviews, and reporting features build on the same shortlist state.

## Acceptance criteria

- Candidate shortlist behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Creating shortlist state, and Interview scheduling detail.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Creating shortlist state
- Interview scheduling detail
- Notifications
- Offer or hiring-decision workflows
