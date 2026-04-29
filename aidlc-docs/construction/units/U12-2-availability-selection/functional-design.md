# Functional design: U12-2-availability-selection

## Purpose

Define the baseline availability-selection flow so students and companies can capture interview-availability choices against an existing requested interview without prematurely confirming the schedule.

## User story

As a student and as an authorized company user, I need a structured way to provide interview availability so the interview can move toward scheduling without ambiguity.

## Functional requirements

### 1. Availability-selection scope

- This unit covers availability selection only.
- The baseline should support:
  - collecting student and company availability options against an existing requested interview
  - preserving who supplied each availability entry and when
  - supporting deterministic selection or proposal states before confirmation
  - returning stable outcomes when availability submission is invalid or no longer allowed
- schedule confirmation, reschedule behavior, meeting-link assignment, cancellation behavior, and calendar integration remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants may provide or inspect availability for a given interview.
- Availability access must remain scoped to the owning company and the corresponding student.
- The unit must not expose unrelated schedule data or third-party calendar details.
- Availability changes should remain auditable because they influence interview commitments.

### 3. Availability behavior

- Availability entries should remain linked to one interview record and preserve participant, timestamp, and availability window metadata.
- The baseline may support multiple proposed windows, but it should not silently confirm the interview during availability capture.
- Availability handling should preserve deterministic outcomes when the interview is no longer in an eligible state.
- This unit should prepare scheduling, not replace interview status tracking or final confirmation.

### 4. Frontend and API alignment

- The capability belongs in protected student and company workflow routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Interview state should remain traceable, with timeline and history behavior reused rather than redefined per screen.
- Deterministic interview-state transitions should remain explainable and auditable.

### 5. Relationship to later units

- U12-1 interview request supplies the interview record that availability attaches to.
- U12-3 schedule confirmation must consume the availability context defined here rather than inventing its own proposal model.
- U12-4 and U12-5 should preserve or close availability context according to later reschedule and cancellation rules.
- Later notification units may inform participants about availability changes without redefining ownership or state rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U12-1 interview-request

## Outputs

- Baseline interview-availability-selection flow
- Availability ownership and traceability expectations
- Integration expectations for confirmation, reschedule, cancellation, and notification units

## User flow

1. An interview participant opens an existing requested interview that allows availability input.
2. Backend verifies participant identity, interview ownership, and current interview state.
3. The platform records or returns structured availability entries tied to the interview.
4. Participants receive a stable availability outcome without final schedule confirmation.
5. Later scheduling units reuse the same interview and availability records.

## Acceptance criteria

- Availability selection behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Final schedule confirmation, and Meeting-link assignment.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Final schedule confirmation
- Meeting-link assignment
- Calendar synchronization
- Cancellation handling
