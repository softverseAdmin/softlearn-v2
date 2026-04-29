# Functional design: U16-2-student-visibility-settings

## Purpose

Define the baseline student-visibility-settings flow so students can control which profile, learning, and exam information is visible to company-side workflows under approved policy.

## User story

As a student, I need visibility settings so I can control what companies are allowed to see about me within the platform's hiring workflows.

## Functional requirements

### 1. Student-visibility-settings scope

- This unit covers student visibility settings only.
- The baseline should support:
  - managing visibility settings for profile, learning, and exam-result categories
  - supporting stable visible, hidden, or partially visible states where policy allows them
  - preserving a clear relationship between student preferences and later company-facing data access
  - returning stable outcomes when visibility settings conflict with stronger policy restrictions
- company-specific overrides, consent-record management detail, admin exception workflows, heavy analytics, and public profile publication remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students may manage their own visibility settings.
- Visibility-setting outcomes must remain bounded by stronger platform policy and consent requirements where applicable.
- Companies must not use this unit to bypass protected visibility decisions.
- Visibility-setting changes should remain auditable because they affect sensitive data exposure.

### 3. Visibility-setting behavior

- The baseline should support visibility settings across profile-preview, learning-record, and exam-result categories rather than only one data type.
- Exam results must remain hidden from companies unless rules explicitly allow them.
- Visibility settings should influence company-facing views through shared filtering and consent-aware logic instead of client-side display toggles.
- This unit must not create unrestricted public profile behavior.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific routes and backend checks aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Privacy, consent, and access-control decisions must stay centralized and auditable rather than duplicated across clients.
- Restricted outcomes should remain the default when visibility or permission requirements are not satisfied clearly.

### 5. Relationship to later units

- U2-10 student profile privacy settings remains the early baseline that this unit broadens across later company-facing surfaces.
- U16-3 company access control and U16-4 data consent system refine how company requests are evaluated against these settings.
- U11 review units and U17 dashboard units must consume the same visibility posture when presenting company-safe data.
- Notification units must avoid leaking hidden data through visibility-insensitive messages.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U2-10 student profile privacy settings
- U6-4 privacy filter for results
- U11-1 student-profile-preview-for-company
- U11-2 view-student-learning-record
- U11-3 view-student-exam-results

## Outputs

- Baseline student-visibility-settings flow
- Cross-domain visibility-category expectations
- Integration expectations for company access control, consent, and company-facing views

## User flow

1. A student opens visibility settings in the protected profile area.
2. Backend loads the current visibility categories and any governing policy restrictions.
3. The platform records or presents the student's visibility choices in a structured form.
4. The student receives stable confirmation of the resulting visibility posture.
5. Later company-facing views and consent checks reuse the same visibility settings baseline.

## Acceptance criteria

- Student visibility settings behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Company-specific overrides, and Admin exception workflows.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Company-specific overrides
- Admin exception workflows
- Public profile publication
- Heavy analytics
