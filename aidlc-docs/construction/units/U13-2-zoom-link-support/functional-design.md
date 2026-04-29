# Functional design: U13-2-zoom-link-support

## Purpose

Define the baseline Zoom-link-support flow so meeting URLs identified as Zoom links can be accepted and handled consistently without introducing Zoom API integration.

## User story

As an interview participant, I need Zoom links to be recognized and stored consistently so interviews can use Zoom where allowed without external provider dependencies.

## Functional requirements

### 1. Zoom-link-support scope

- This unit covers zoom link support only.
- The baseline should support:
  - classifying a meeting URL as a Zoom link based on allowed host and path patterns
  - storing Zoom link metadata in the protected interview context
  - preserving stable handling for valid and invalid Zoom-format URLs
  - keeping provider-specific behavior limited to format and ownership rules
- Zoom API integration, automatic meeting creation, calendar synchronization, provider-specific analytics, and cross-provider fallback logic remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants may attach or inspect Zoom links for their interview.
- Zoom links must remain protected because they grant interview access.
- The platform must not expose Zoom meeting data beyond the permitted interview participants.
- Zoom-link handling should remain auditable through the shared interview and meeting-link posture.

### 3. Zoom-link behavior

- The baseline should treat Zoom support as recognized URL-pattern handling only.
- Valid Zoom URLs should remain compatible with the shared meeting-url input and later meeting-link validation units.
- Invalid or unsupported Zoom-like URLs should return stable outcomes without ambiguous provider classification.
- This unit must not create or manage Zoom meetings through external APIs.

### 4. Frontend and API alignment

- The capability belongs in protected interview-management routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Provider handling should stay deterministic and format-based, without introducing remote API dependencies.
- Meeting-link behavior must remain auditable because interview access is sensitive.

### 5. Relationship to later units

- U13-1 meeting URL input supplies the core meeting-link storage path.
- U13-6 meeting-link validation should centralize the approved Zoom-format rules used here.
- Other provider units remain separate and must not blur their allowed host patterns into Zoom handling.
- Later notifications may share Zoom-link metadata with authorized participants without changing provider classification rules.

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

- Baseline Zoom-link-support rules
- Protected Zoom provider-classification expectations
- Integration expectations for shared validation and later notification units

## User flow

1. An authorized participant enters or reviews a meeting URL intended to use Zoom.
2. Backend checks the protected interview context and the URL against the allowed Zoom classification posture.
3. The platform stores or presents the URL as a Zoom meeting link when valid.
4. The participant receives a stable valid or invalid Zoom-link outcome.
5. Later validation and notification flows reuse the same provider classification.

## Acceptance criteria

- Zoom link support behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Zoom API integration, and Automatic Zoom meeting creation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Zoom API integration
- Automatic Zoom meeting creation
- Calendar synchronization
- Provider-specific analytics
