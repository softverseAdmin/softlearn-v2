# Functional design: U12-4-reschedule-interview

## Purpose

Define the baseline reschedule-interview flow so an existing interview can move through an explicit rescheduling path without losing the prior schedule, history, or authorization posture.

## User story

As an authorized interview participant, I need to reschedule an interview when circumstances change so the platform keeps one accurate interview record and a full history timeline.

## Functional requirements

### 1. Reschedule-interview scope

- This unit covers reschedule interview only.
- The baseline should support:
  - initiating reschedule from an existing requested or confirmed interview where policy allows it
  - preserving prior scheduled details while collecting replacement scheduling context
  - transitioning interview state into a traceable rescheduled posture
  - returning stable outcomes when reschedule is invalid, unauthorized, or no longer allowed
- cancellation behavior, calendar integration, provider-specific meeting-link updates, completion handling, and advanced reschedule policies remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants within the valid interview context may trigger a reschedule.
- Reschedule access must remain scoped to the owning company and corresponding student interview.
- Prior and replacement schedule information must remain protected within authorized visibility boundaries.
- Reschedule actions should remain auditable because they alter participant commitments.

### 3. Reschedule behavior

- A valid reschedule should preserve the existing interview record, retain prior history, and add ordered history for the reschedule event.
- The baseline should support an explicit `rescheduled` lifecycle posture before the interview returns to a confirmed time.
- Meeting-link changes, if any, should remain separate from the reschedule core and follow later meeting units.
- Invalid repeat reschedules or attempts against cancelled or completed interviews should return stable outcomes.

### 4. Frontend and API alignment

- The capability belongs in protected student and company workflow routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Interview state should remain traceable, with timeline and history behavior reused rather than redefined per screen.
- Deterministic interview-state transitions should remain explainable and auditable.

### 5. Relationship to later units

- U12-3 schedule confirmation supplies the confirmed interview context that may be rescheduled.
- U12-6 interview status tracking must reflect reschedule history without losing previous state evidence.
- U13 meeting-link units may later update provider links for rescheduled interviews while preserving this history posture.
- Later notifications may consume reschedule events without redefining authorization or state semantics.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U12-1 interview-request
- U12-2 availability-selection
- U12-3 interview-schedule-confirmation

## Outputs

- Baseline reschedule-interview flow
- Rescheduled-state and history expectations
- Integration expectations for status tracking, meeting-link, and notification units

## User flow

1. An authorized interview participant selects a valid interview that needs schedule change.
2. Backend verifies ownership, current state, and reschedule eligibility.
3. The platform records the reschedule event, preserves prior schedule evidence, and moves the interview into a rescheduled posture.
4. Participants receive a stable reschedule outcome and any required next-step prompt.
5. Later confirmation, meeting-link, and notification behavior reuses the same interview record and history.

## Acceptance criteria

- Reschedule interview behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Meeting-link provider updates, and Calendar synchronization.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Meeting-link provider updates
- Calendar synchronization
- Cancellation logic
- Interview completion handling
