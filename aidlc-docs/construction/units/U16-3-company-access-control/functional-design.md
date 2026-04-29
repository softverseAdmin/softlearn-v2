# Functional design: U16-3-company-access-control

## Purpose

Define the baseline company-access-control flow so company-side requests for student data remain constrained by relationship, permission, visibility, and workflow context.

## User story

As the platform, I need company access control so company users can review only the student data their workflow and permissions actually allow.

## Functional requirements

### 1. Company-access-control scope

- This unit covers company access control only.
- The baseline should support:
  - evaluating company-side access against role permissions, company ownership, workflow relationship, and student visibility posture
  - supporting deterministic allow, deny, or restricted-summary outcomes for company requests
  - preserving auditable company-access decisions for sensitive student data
  - providing one reusable baseline for company review, shortlist, interview, dashboard, and notification surfaces
- consent-record detail, advanced policy engine implementation, external authorization services, heavy analytics, and cross-company collaboration remain separate later units.

### 2. Authorization and visibility behavior

- Company users must only access student data within approved company-owned workflow contexts.
- Access decisions must combine role permission, company boundary, visibility settings, and consent posture where applicable.
- Denied or restricted outcomes should be the default when access conditions are incomplete or ambiguous.
- Company-access decisions should remain auditable because they govern sensitive student data.

### 3. Company-access-control behavior

- The baseline should support deterministic evaluation of company requests for candidate previews, learning records, exam results, shortlist contexts, interview contexts, and dashboard aggregates.
- Company access control should centralize the decision posture rather than allowing each feature to invent its own access shortcuts.
- The unit should preserve the distinction between student-owned source data and company-visible filtered data.
- This unit must not introduce unrestricted company browsing or public student profiles.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific routes and backend checks aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Privacy, consent, and access-control decisions must stay centralized and auditable rather than duplicated across clients.
- Restricted outcomes should remain the default when visibility or permission requirements are not satisfied clearly.

### 5. Relationship to later units

- U16-1 role permissions, U16-2 student visibility settings, and U16-4 data consent system all refine the decision inputs used here.
- U11 candidate-review units, U12 interview units, and U17 company dashboard must reuse this company-access posture.
- Notification and meeting-link units must continue to honor these company-access decisions when exposing sensitive content.
- Production security-hardening work should preserve the same restrictive access direction rather than weakening it.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U16-1 role-permissions
- U16-2 student-visibility-settings
- U11-1 student-profile-preview-for-company
- U11-2 view-student-learning-record
- U11-3 view-student-exam-results

## Outputs

- Baseline company-access-control model
- Deterministic allow, deny, and restricted-summary expectations
- Integration expectations for review, interview, dashboard, and notification units

## User flow

1. A company-side workflow requests protected student data.
2. Backend evaluates role permission, company ownership, workflow relationship, visibility settings, and consent posture as applicable.
3. The platform returns an allow, deny, or restricted-summary outcome with auditable decision context.
4. The company user receives only the permitted protected behavior.
5. Later feature units reuse the same company-access-control baseline rather than redefining access logic.

## Acceptance criteria

- Company access control behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Advanced policy engines, and External authorization services.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Advanced policy engines
- External authorization services
- Cross-company collaboration
- Public student profiles
