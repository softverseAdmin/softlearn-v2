# Functional design: U12-1-interview-request

## Purpose

Define the baseline interview-request flow so an authorized company user can request an interview from an approved candidate context and create the initial interview lifecycle record.

## User story

As an authorized company user, I need to request an interview from a valid candidate context so the platform can start a traceable interview workflow.

## Functional requirements

### 1. Interview-request scope

- This unit covers interview request only.
- The baseline should support:
  - creating an interview request from an approved shortlist or application-review context
  - capturing the initial interview purpose, role context, and request metadata
  - setting the initial interview state to requested with traceable history
  - returning stable outcomes for invalid, duplicate, or unauthorized interview requests
- availability selection, schedule confirmation, reschedule behavior, cancellation behavior, and notification delivery remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated company users with approved company ownership may request interviews.
- Interview requests must be tied to valid candidate contexts and must not bypass company-boundary rules.
- Protected student and company data must remain within authorized visibility posture during request creation.
- Interview-request creation must remain auditable because it starts a sensitive workflow.

### 3. Interview-request behavior

- A successful request should create an interview record with authoritative state `requested` and corresponding history evidence.
- The request should preserve linkage to the originating application, shortlist, or vacancy context where applicable.
- Repeated or conflicting requests should return stable outcomes instead of creating uncontrolled duplicate interview records.
- This unit should start the interview workflow only; it must not confirm schedule details automatically.

### 4. Frontend and API alignment

- The capability belongs in protected student and company workflow routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Interview state should remain traceable, with timeline and history behavior reused rather than redefined per screen.
- Deterministic interview-state transitions should remain explainable and auditable.

### 5. Relationship to later units

- U11 candidate-review units should supply the authorized contexts from which interview requests are launched.
- U12-2 through U12-6 must reuse the interview record and history posture defined here.
- Later notification units may consume interview-request events without redefining request authorization rules.
- Meeting-link units remain separate and must not be folded into the initial request.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U10-2 application status tracking
- U10-5 shortlist-candidates
- U11-4 candidate-shortlist
- U11-5 candidate-notes

## Outputs

- Baseline interview-request flow
- Initial interview lifecycle and history expectations
- Integration expectations for later availability, scheduling, and notification units

## User flow

1. An authorized company user selects an approved candidate context for interview progression.
2. Backend verifies company ownership, candidate eligibility, and current workflow state.
3. The platform creates the interview record in `requested` state and writes initial history metadata.
4. The company user receives a stable interview-request outcome.
5. Later interview-management units continue from the same traceable record.

## Acceptance criteria

- Interview request behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Availability collection, and Meeting-link handling.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Availability collection
- Meeting-link handling
- Schedule confirmation
- Notification delivery
