# Functional design: U13-5-custom-url-support

## Purpose

Define the baseline custom-URL-support flow so interviews can use approved non-provider-specific meeting URLs while preserving the same protected ownership and validation posture.

## User story

As an interview participant, I need support for approved custom meeting URLs so interviews are not blocked when a standard provider link is not used.

## Functional requirements

### 1. Custom-url-support scope

- This unit covers custom url support only.
- The baseline should support:
  - classifying a meeting URL as a custom link when it does not match the approved provider-specific patterns
  - storing custom-link metadata in the protected interview context
  - preserving stable handling for valid and invalid custom-format URLs
  - keeping custom-link behavior limited to protected input and validation rules
- external provider integration, automatic custom-link generation, calendar synchronization, provider analytics, and public meeting-link sharing remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants may attach or inspect custom meeting URLs for their interview.
- Custom meeting links must remain protected because they grant interview access.
- The platform must not expose custom-link data beyond the permitted interview participants.
- Custom-link handling should remain auditable through the shared interview and meeting-link posture.

### 3. Custom-link behavior

- The baseline should support custom meeting URLs as a deliberate provider type rather than a validation bypass.
- Custom links should still follow shared meeting-url input and later validation requirements, including general URL-format safety checks.
- Invalid or unsafe custom URLs should return stable outcomes instead of being accepted as a fallback.
- This unit must not loosen the protection or audit posture applied to provider-specific links.

### 4. Frontend and API alignment

- The capability belongs in protected interview-management routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Provider handling should stay deterministic and format-based, without introducing remote API dependencies.
- Meeting-link behavior must remain auditable because interview access is sensitive.

### 5. Relationship to later units

- U13-1 meeting URL input supplies the core meeting-link storage path.
- U13-6 meeting-link validation should centralize the approved general custom-URL rules used here.
- Provider-specific units remain separate and must not treat invalid provider URLs as custom links without explicit validation.
- Later notifications may share custom-link metadata with authorized participants without changing link protection rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U13-1 meeting-url-input

## Outputs

- Baseline custom-URL-support rules
- Protected custom-link handling expectations
- Integration expectations for shared validation and later notification units

## User flow

1. An authorized participant enters or reviews a meeting URL intended to use a custom provider or room.
2. Backend checks the protected interview context and the URL against the custom-link classification posture.
3. The platform stores or presents the URL as a custom meeting link when valid.
4. The participant receives a stable valid or invalid custom-link outcome.
5. Later validation and notification flows reuse the same custom-link classification.

## Acceptance criteria

- Custom url support behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Automatic custom-link generation, and Calendar synchronization.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Automatic custom-link generation
- Calendar synchronization
- Public meeting-link sharing
- Provider analytics
