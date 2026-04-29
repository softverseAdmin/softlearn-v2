# Functional design: U13-1-meeting-url-input

## Purpose

Define the baseline meeting-url-input flow so authorized interview participants can store a meeting URL against a confirmed interview using a protected, provider-aware input path.

## User story

As an authorized interview participant, I need a controlled way to enter the meeting URL so the interview has one traceable access link.

## Functional requirements

### 1. Meeting-url-input scope

- This unit covers meeting url input only.
- The baseline should support:
  - capturing one meeting URL against a valid interview context
  - preserving provider metadata or input type alongside the URL
  - supporting later validation and provider-specific handling without external API integration
  - returning stable outcomes when the interview context or link input is invalid
- provider-specific validation detail, calendar synchronization, automatic link generation, notification delivery detail, and recording providers beyond the approved list remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants within the valid interview context may enter or update the meeting URL.
- Meeting URLs must remain protected because they provide direct access to the interview.
- The platform must not expose meeting links outside the company or student participants allowed for the interview.
- Meeting-link changes should remain auditable.

### 3. Meeting-URL input behavior

- The baseline should support storing a meeting URL and a provider type or equivalent classification with the interview.
- Meeting-link entry must stay separate from provider API integration and should rely only on protected input and later validation rules.
- The unit should preserve one authoritative current meeting-link record for the interview while still allowing audit history later.
- Invalid or missing URLs should return stable outcomes rather than partial writes.

### 4. Frontend and API alignment

- The capability belongs in protected interview-management routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Provider handling should stay deterministic and format-based, without introducing remote API dependencies.
- Meeting-link behavior must remain auditable because interview access is sensitive.

### 5. Relationship to later units

- U12-3 interview schedule confirmation supplies the interview context that should generally exist before meeting-link entry.
- U13-2 through U13-5 define provider-specific support boundaries on top of this input baseline.
- U13-6 meeting-link validation centralizes format-validation expectations for all provider types.
- Later notifications may consume the stored meeting-link metadata without bypassing access controls.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U12-3 interview-schedule-confirmation
- U12-4 reschedule-interview
- U12-6 interview-status-tracking

## Outputs

- Baseline protected meeting-URL input flow
- Meeting-link ownership and provider-metadata expectations
- Integration expectations for provider-specific support and validation units

## User flow

1. An authorized interview participant opens an interview that allows meeting-link entry.
2. Backend verifies interview ownership, current state, and whether meeting-link entry is currently allowed.
3. The platform records the meeting URL and provider classification in the protected interview context.
4. Participants receive a stable meeting-link input outcome or a restricted or invalid-link response.
5. Later provider-specific and validation units reuse the same meeting-link record.

## Acceptance criteria

- Meeting url input behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Provider API integration, and Automatic link generation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Provider API integration
- Automatic link generation
- Calendar synchronization
- Notification delivery detail
