# Functional design: U13-4-teams-support

## Purpose

Define the baseline Teams-support flow so meeting URLs identified as Microsoft Teams links can be accepted and handled consistently without introducing Teams API integration.

## User story

As an interview participant, I need Teams links to be recognized and stored consistently so interviews can use Teams where allowed without external provider dependencies.

## Functional requirements

### 1. Teams-support scope

- This unit covers teams support only.
- The baseline should support:
  - classifying a meeting URL as a Microsoft Teams link based on allowed host and path patterns
  - storing Teams link metadata in the protected interview context
  - preserving stable handling for valid and invalid Teams-format URLs
  - keeping provider-specific behavior limited to format and ownership rules
- Teams API integration, automatic meeting creation, calendar synchronization, provider-specific analytics, and cross-provider fallback logic remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized interview participants may attach or inspect Teams links for their interview.
- Teams links must remain protected because they grant interview access.
- The platform must not expose Teams link data beyond the permitted interview participants.
- Teams-link handling should remain auditable through the shared interview and meeting-link posture.

### 3. Teams-link behavior

- The baseline should treat Teams support as recognized URL-pattern handling only.
- Valid Teams URLs should remain compatible with the shared meeting-url input and later meeting-link validation units.
- Invalid or unsupported Teams-like URLs should return stable outcomes without ambiguous provider classification.
- This unit must not create or manage Teams meetings through external APIs.

### 4. Frontend and API alignment

- The capability belongs in protected interview-management routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Provider handling should stay deterministic and format-based, without introducing remote API dependencies.
- Meeting-link behavior must remain auditable because interview access is sensitive.

### 5. Relationship to later units

- U13-1 meeting URL input supplies the core meeting-link storage path.
- U13-6 meeting-link validation should centralize the approved Teams-format rules used here.
- Other provider units remain separate and must not blur their allowed host patterns into Teams handling.
- Later notifications may share Teams-link metadata with authorized participants without changing provider classification rules.

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

- Baseline Teams-support rules
- Protected Teams provider-classification expectations
- Integration expectations for shared validation and later notification units

## User flow

1. An authorized participant enters or reviews a meeting URL intended to use Teams.
2. Backend checks the protected interview context and the URL against the allowed Teams classification posture.
3. The platform stores or presents the URL as a Teams meeting link when valid.
4. The participant receives a stable valid or invalid Teams-link outcome.
5. Later validation and notification flows reuse the same provider classification.

## Acceptance criteria

- Teams support behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Teams API integration, and Automatic meeting creation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Teams API integration
- Automatic meeting creation
- Calendar synchronization
- Provider-specific analytics
