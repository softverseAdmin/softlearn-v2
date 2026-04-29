# Functional design: U12-6-interview-status-tracking

## Purpose

Define the baseline interview-status-tracking flow so the platform maintains one authoritative current interview status and one ordered history timeline across requested, confirmed, rescheduled, completed, and cancelled states.

## User story

As the platform and as interview participants, I need deterministic interview status tracking so everyone can rely on one auditable view of each interview's lifecycle.

## Functional requirements

### 1. Interview-status-tracking scope

- This unit covers interview status tracking only.
- The baseline should support:
  - storing one authoritative current interview status
  - storing an ordered interview-history timeline with actor and timestamp context
  - presenting stable interview-status information to authorized student and company participants
  - defining baseline transition expectations used by all interview-management units
- provider-specific meeting-link behavior, notification delivery detail, calendar integration, heavy interview analytics, and automated decisioning remain separate later units.

### 2. Authorization and visibility behavior

- Students may view interview status and history for their own interviews.
- Company users may view interview status and history for interviews tied to their authorized company contexts.
- Status tracking must not bypass company-boundary, privacy, or consent-sensitive rules.
- Interview-history records must remain auditable and ordered.

### 3. Interview-status behavior

- The baseline should support a stable set of interview states such as requested, confirmed, rescheduled, completed, and cancelled.
- Every approved transition should create an InterviewHistory entry or equivalent traceable record.
- Repeated evaluation of the same interview should present the same authoritative current status and ordered history.
- Invalid transitions, unsupported states, or missing history evidence must return stable outcomes.

### 4. Frontend and API alignment

- The capability belongs in protected student and company workflow routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Interview state should remain traceable, with timeline and history behavior reused rather than redefined per screen.
- Deterministic interview-state transitions should remain explainable and auditable.

### 5. Relationship to later units

- U12-1 creates the initial requested state for interviews.
- U12-3, U12-4, and U12-5 must reuse the shared status model defined here rather than redefining transitions independently.
- Later meeting-link and notification units may consume interview status changes as triggers but must not redefine the status model.
- Dashboard and analytics units may aggregate interview states later without changing status semantics.

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
- U12-4 reschedule-interview
- U12-5 cancel-interview

## Outputs

- Baseline current-status and history model for interviews
- Shared interview lifecycle expectations
- Integration expectations for meeting-link, notification, and dashboard units

## User flow

1. The platform receives an approved interview event from a valid upstream interview action.
2. Backend validates the resulting state against the baseline interview status model.
3. The platform updates the authoritative current interview status and records ordered history evidence.
4. Authorized participants retrieve the same stable current status and history timeline.
5. Later meeting-link, notification, and reporting units reuse the shared interview lifecycle baseline.

## Acceptance criteria

- Interview status tracking behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Provider-specific meeting-link handling, and Notification delivery detail.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Provider-specific meeting-link handling
- Notification delivery detail
- Heavy interview analytics
- Automated hiring decisions
