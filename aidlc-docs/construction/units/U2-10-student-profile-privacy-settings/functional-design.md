# Functional design: U2-10-student-profile-privacy-settings

## Purpose

Define the baseline student privacy-settings flow so an authenticated student can control company visibility of profile and result data through explicit, auditable privacy and consent settings.

## User story

As an authenticated student, I need clear privacy controls so I can decide what profile and result data companies may see and change those decisions in an understandable, traceable way.

## Functional requirements

### 1. Privacy-settings scope

- This unit covers student-owned privacy and visibility settings attached to the authenticated student profile.
- The baseline should support the core privacy-management actions:
  - view current privacy settings
  - enable or disable company visibility for supported data categories
  - update privacy choices over time
  - review the current visibility state in understandable terms
- Privacy settings should remain separate from the editing of profile subdomain data itself, even though they govern visibility of that data later.

### 2. Visibility-control domains

- The baseline must support privacy controls for at least:
  - profile data visibility to companies
  - exam-result visibility to companies
- The design should allow supported profile subdomains to inherit or align with these privacy decisions rather than each feature inventing unrelated visibility rules.
- Matching outputs and company-facing candidate views must not reveal hidden student data beyond what the applicable privacy and consent rules allow.

### 3. Explicit consent posture

- Student privacy settings must operate through explicit student choices rather than assumed consent.
- Consent-related decisions should be recorded and traceable.
- The baseline should treat actions such as enabling company visibility of profile data, enabling company visibility of exam data, and changing privacy settings as consent events that must be recorded.
- If later policy introduces defaults, overrides, or workflow-based exceptions, those behaviors must still remain explainable and auditable.

### 4. Read and update behavior

- Authenticated students must be able to view their own current privacy settings.
- Authenticated students must be able to update those settings in their own profile context.
- Validation failures or unsupported visibility transitions must return stable, user-presentable outcomes.
- Successful privacy changes should update the effective visibility state predictably and should not require the student to re-enter unrelated profile data.

### 5. Ownership, authorization, and policy interaction

- Only the authenticated student may manage privacy settings through this self-service flow unless a later approved policy explicitly defines administrative override behavior.
- Company users may consume student data only when those visibility and consent settings allow it in the relevant workflow context.
- Admin access to privacy-sensitive records remains privileged, policy-bound, and auditable rather than unrestricted.
- Privacy settings must work with the RBAC baseline rather than replacing it; authorization still evaluates role, ownership, organization boundary, and privacy policy together.

### 6. Audit and traceability

- Privacy-setting changes must produce audit-friendly records.
- Consent-related visibility decisions should remain explainable during support, review, or incident investigation.
- The baseline should preserve a clear distinction between:
  - the current effective privacy state
  - the history of consent or privacy-setting changes

### 7. Frontend behavior

- The privacy-settings screen belongs inside the authenticated student route area and shared layout shell.
- The UI should describe visibility choices clearly enough that students understand the effect of enabling or disabling company access.
- Loading, success, warning, and validation-error states should be presented clearly.

### 8. Relationship to later units

- This unit defines baseline student privacy settings only.
- Fine-grained company-side field visibility matrices, policy overrides, exam-result sharing detail, candidate-review behavior, and implementation-specific audit/logging mechanics remain separate units.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-3 role-based access control
- U1-8 base UI layout
- U2-3 student profile basic
- U2-9 student availability management

## Outputs

- Baseline student privacy-settings flow
- Visibility, consent, and auditability expectations for student-controlled data sharing
- Integration expectations for later company access and explainable privacy behavior

## User flow

1. Authenticated student enters the privacy-settings area from the protected student experience.
2. Frontend loads the student’s current visibility and consent state.
3. Student reviews and updates the supported privacy choices.
4. Backend validates the change, persists the new privacy state, and records the consent or privacy event.
5. Frontend reflects the updated privacy state and communicates the effective visibility outcome clearly.

## Acceptance criteria

- Student privacy-settings behavior is documented clearly.
- Profile and exam-result visibility controls are defined at the baseline level.
- Consent recording and auditability expectations are documented.
- Ownership, authorization, and company-visibility boundaries are aligned with the security and RBAC baselines.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Final per-field visibility matrix for every student data subtype
- Detailed admin override workflow
- Framework-specific audit-log or consent-log implementation
