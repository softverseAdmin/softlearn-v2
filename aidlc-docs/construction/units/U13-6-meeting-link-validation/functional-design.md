# Functional design: U13-6-meeting-link-validation

## Purpose

Define the baseline meeting-link-validation flow so all supported interview meeting URLs are checked with deterministic format rules before they are accepted or surfaced to participants.

## User story

As the platform and as interview participants, I need deterministic meeting-link validation so interview access links are safe, consistent, and explainable.

## Functional requirements

### 1. Meeting-link-validation scope

- This unit covers meeting link validation only.
- The baseline should support:
  - validating Zoom, Google Meet, Teams, and custom links using deterministic format rules only
  - rejecting malformed, unsupported, or unsafe meeting URLs with stable outcomes
  - preserving explainable provider classification and validation results for support and audit use
  - reusing one shared validation posture across all meeting-link units
- provider API integration, automatic link generation, calendar synchronization, link-health checks against external providers, and advanced anti-phishing scanning remain separate later units.

### 2. Authorization and visibility behavior

- Meeting-link validation must run within the same protected interview ownership and participant-access posture as meeting-link input.
- Validation results must not expose links to unauthorized users.
- Unsafe or ambiguous link formats should default to rejection rather than permissive fallback.
- Validation outcomes should remain auditable because meeting URLs are sensitive.

### 3. Meeting-link validation behavior

- Validation should classify the link into the approved provider type or custom type before acceptance.
- Provider-specific support must remain format-based only and should not rely on remote API calls or provider health checks.
- The baseline should support stable error outcomes for malformed URLs, unsupported hosts, insecure schemes where disallowed, or inconsistent path formats.
- Validated links should remain compatible with later notification and interview-detail views without revalidation drift.

### 4. Frontend and API alignment

- The capability belongs in protected interview-management routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Provider handling should stay deterministic and format-based, without introducing remote API dependencies.
- Meeting-link behavior must remain auditable because interview access is sensitive.

### 5. Relationship to later units

- U13-1 through U13-5 must reuse this shared validation posture instead of inventing competing URL rules.
- U12 interview-management units rely on this validation baseline whenever meeting links are attached to interview records.
- Later notification units may distribute validated meeting links only to authorized participants.
- Security-hardening work in U19 should preserve the same restrictive link-validation direction rather than relaxing it.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U13-1 meeting-url-input
- U13-2 zoom-link-support
- U13-3 google-meet-support
- U13-4 teams-support
- U13-5 custom-url-support

## Outputs

- Baseline deterministic meeting-link-validation rules
- Shared provider-classification and rejection expectations
- Integration expectations for interview storage, notifications, and security units

## User flow

1. A protected interview workflow submits or loads a meeting URL for classification and validation.
2. Backend checks the URL against deterministic provider and general custom-link validation rules.
3. The platform accepts the link with provider classification or rejects it with a stable validation outcome.
4. Authorized participants receive only the allowed validated link state for the interview.
5. Later interview, notification, and security-sensitive units reuse the same validation posture.

## Acceptance criteria

- Meeting link validation behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Provider API integration, and Remote link health checks.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Provider API integration
- Remote link health checks
- Calendar synchronization
- Advanced phishing or malware scanning services
