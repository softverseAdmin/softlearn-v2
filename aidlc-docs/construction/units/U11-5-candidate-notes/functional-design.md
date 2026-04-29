# Functional design: U11-5-candidate-notes

## Purpose

Define the baseline candidate-notes flow so authorized company users can create and review company-internal notes on candidate-review contexts without exposing those notes outside the company boundary.

## User story

As an authorized company user, I need protected candidate notes so our company can capture review context and next-step reasoning without losing auditability or privacy boundaries.

## Functional requirements

### 1. Candidate-notes scope

- This unit covers candidate notes only.
- The baseline should support:
  - creating company-internal notes on approved candidate, application, shortlist, or interview contexts
  - listing existing notes for the same authorized company-bound context
  - preserving author, timestamp, and contextual linkage for each note
  - returning stable outcomes for empty, invalid, or unauthorized note requests
- external candidate messaging, shared public annotations, automated note generation, offer workflows, and cross-company collaboration remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated company users may create or view notes for their own company's authorized candidate contexts.
- Candidate notes must never be visible to students, other companies, or unauthorized admins unless later policy explicitly allows it.
- The note system must respect company boundaries, candidate visibility posture, and workflow ownership.
- Note creation and updates should remain auditable because they affect recruiting decisions.

### 3. Candidate-note behavior

- Each note should remain linked to one authorized company-side candidate context and preserve author and timestamp metadata.
- The baseline may support simple structured note text and optional category metadata later, but the first concern is protected and traceable storage.
- Notes should not silently mutate application status, shortlist state, or interview status within this unit.
- The note system must stay deterministic and company-internal rather than becoming a cross-role messaging channel.

### 4. Frontend and API alignment

- The capability belongs in protected company-side routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most candidate-review state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Deterministic, explainable, and auditable review outcomes should be preserved.

### 5. Relationship to later units

- U11-4 candidate shortlist may surface note entry points for shortlisted candidates.
- U12 interview-management units may allow interview-specific company notes later but should reuse the same ownership rules.
- Later notifications must not expose company-internal note content to students unless an approved future unit changes that policy.
- Dashboard or analytics units may count note presence later without revealing protected note content broadly.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-4 company-view-applications
- U11-1 student-profile-preview-for-company
- U11-4 candidate-shortlist

## Outputs

- Baseline protected candidate-note flow
- Company-bound note ownership and audit expectations
- Integration expectations for shortlist, interview, and reporting units

## User flow

1. An authorized company user opens a candidate-review context that allows company-internal notes.
2. Backend verifies session, company ownership, and the target candidate context.
3. The platform loads existing notes or records a new note with traceable metadata.
4. The company user receives the updated note list or a stable restricted outcome.
5. Later shortlist, interview, and reporting units reuse the same protected note posture.

## Acceptance criteria

- Candidate notes behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Student-visible messaging, and Cross-company note sharing.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Student-visible messaging
- Cross-company note sharing
- Automated note generation
- Offer decision workflows
