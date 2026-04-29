# Functional design: U13-3-google-meet-support

## Purpose

Define the baseline Google-Meet-support flow so meeting URLs identified as Google Meet links can be accepted and handled consistently without introducing Google API integration.

## User story

As an interview participant, I need Google Meet links to be recognized and stored consistently so interviews can use Google Meet where allowed without external provider dependencies.

## Functional requirements

### 1. Google-meet-support scope

- This unit covers google meet support only.
- The baseline should support:
  - classifying a meeting URL as a Google Meet link based on allowed host and path patterns
  - storing Google Meet link metadata in the protected interview context
  - preserving stable handling for valid and invalid Google Meet-format URLs
  - keeping provider-specific behavior limited to format and ownership rules
- Google API integration, automatic meeting creation, calendar synchronization, provider-specific analytics, and cross-provider fallback logic remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants may attach or inspect Google Meet links for their interview.
- Google Meet links must remain protected because they grant interview access.
- The platform must not expose Google Meet link data beyond the permitted interview participants.
- Google Meet-link handling should remain auditable through the shared interview and meeting-link posture.

### 3. Google Meet-link behavior

- The baseline should treat Google Meet support as recognized URL-pattern handling only.
- Valid Google Meet URLs should remain compatible with the shared meeting-url input and later meeting-link validation units.
- Invalid or unsupported Meet-like URLs should return stable outcomes without ambiguous provider classification.
- This unit must not create or manage Google Meet meetings through external APIs.

### 4. Frontend and API alignment

- The capability belongs in protected interview-management routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Provider handling should stay deterministic and format-based, without introducing remote API dependencies.
- Meeting-link behavior must remain auditable because interview access is sensitive.

### 5. Relationship to later units

- U13-1 meeting URL input supplies the core meeting-link storage path.
- U13-6 meeting-link validation should centralize the approved Google Meet-format rules used here.
- Other provider units remain separate and must not blur their allowed host patterns into Google Meet handling.
- Later notifications may share Google Meet-link metadata with authorized participants without changing provider classification rules.

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

- Baseline Google Meet-support rules
- Protected Google Meet provider-classification expectations
- Integration expectations for shared validation and later notification units

## User flow

1. An authorized participant enters or reviews a meeting URL intended to use Google Meet.
2. Backend checks the protected interview context and the URL against the allowed Google Meet classification posture.
3. The platform stores or presents the URL as a Google Meet link when valid.
4. The participant receives a stable valid or invalid Google Meet-link outcome.
5. Later validation and notification flows reuse the same provider classification.

## Acceptance criteria

- Google meet support behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Google API integration, and Automatic meeting creation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Google API integration
- Automatic meeting creation
- Calendar synchronization
- Provider-specific analytics
