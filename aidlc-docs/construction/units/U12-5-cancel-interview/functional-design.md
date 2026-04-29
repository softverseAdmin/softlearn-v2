# Functional design: U12-5-cancel-interview

## Purpose

Define the baseline cancel-interview flow so an existing interview can move into a cancelled terminal state with traceable reason and history handling.

## User story

As an authorized interview participant, I need to cancel an interview when it should not proceed so the workflow stays accurate and auditable.

## Functional requirements

### 1. Cancel-interview scope

- This unit covers cancel interview only.
- The baseline should support:
  - initiating cancellation from an eligible interview state
  - recording cancellation metadata and terminal state transition
  - preserving ordered interview history for the cancelled interview
  - returning stable outcomes when cancellation is invalid, duplicated, or unauthorized
- reschedule alternatives after cancellation, calendar synchronization, provider-specific meeting-link cleanup, notification delivery detail, and post-cancellation analytics remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants within the valid interview context may cancel an interview.
- Cancellation access must remain scoped to the owning company and corresponding student interview.
- Protected schedule and history details must remain within authorized visibility boundaries.
- Cancellation should remain auditable because it ends or halts a sensitive workflow.

### 3. Cancellation behavior

- A valid cancellation should set the authoritative interview state to `cancelled` and preserve terminal history evidence.
- The baseline may later support structured cancellation reasons, but reasons must not replace traceable history.
- Cancelled interviews should reject duplicate or conflicting follow-up transitions with stable outcomes unless later policy explicitly reopens them.
- This unit must not silently delete prior interview records or history when cancellation occurs.

### 4. Frontend and API alignment

- The capability belongs in protected student and company workflow routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Interview state should remain traceable, with timeline and history behavior reused rather than redefined per screen.
- Deterministic interview-state transitions should remain explainable and auditable.

### 5. Relationship to later units

- U12-1 through U12-4 supply the interview states that may later transition into cancellation.
- U12-6 interview status tracking must reflect cancelled interviews as authoritative terminal states.
- U13 meeting-link units may later define cleanup expectations for cancelled interviews without changing the cancellation baseline.
- Later notifications may consume cancellation events without redefining cancellation authorization rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U12-1 interview-request
- U12-3 interview-schedule-confirmation
- U12-4 reschedule-interview

## Outputs

- Baseline cancel-interview flow
- Cancelled-state and terminal-history expectations
- Integration expectations for status tracking, meeting-link cleanup, and notifications

## User flow

1. An authorized interview participant opens an existing interview that is still cancellable.
2. Backend verifies ownership, current state, and cancellation eligibility.
3. The platform records the cancellation event, transitions the interview to `cancelled`, and preserves terminal history.
4. Participants receive a stable cancelled-interview outcome.
5. Later status-tracking and notification flows reuse the same terminal interview record.

## Acceptance criteria

- Cancel interview behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Automatic reschedule creation, and Calendar synchronization.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Automatic reschedule creation
- Calendar synchronization
- Provider-specific cleanup detail
- Post-cancellation analytics
