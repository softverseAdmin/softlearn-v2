# Functional design: U16-4-data-consent-system

## Purpose

Define the baseline data-consent-system flow so student data sharing decisions are captured, referenced, and audited consistently across company-facing workflows.

## User story

As a student and as the platform, I need a clear data-consent system so protected student data is shared with companies only when the right consent and policy conditions are satisfied.

## Functional requirements

### 1. Data-consent-system scope

- This unit covers data consent system only.
- The baseline should support:
  - recording consent state for relevant company-facing data-sharing categories
  - supporting deterministic active, absent, withdrawn, or expired consent outcomes where policy allows them
  - preserving consent history and auditability for support and compliance review
  - providing a reusable consent input for company-facing review, dashboard, and notification units
- advanced legal-policy engines, external consent-management services, cross-border compliance automation, public sharing workflows, and heavy analytics remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students or explicitly authorized platform operators may manage consent state according to policy.
- Company users must not directly alter consent records.
- Consent data is sensitive and must remain protected, auditable, and tied to the correct student identity.
- When consent posture is absent or unclear, data-sharing outcomes should stay restrictive.

### 3. Consent-system behavior

- The baseline should support explicit consent records that later company-side access decisions can reference.
- Consent records should preserve category, status, timestamp, and change history so later access decisions remain explainable.
- Consent should work with visibility settings and role permissions rather than replacing them.
- This unit must not silently broaden company access beyond the policy-aware consent posture.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific routes and backend checks aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Privacy, consent, and access-control decisions must stay centralized and auditable rather than duplicated across clients.
- Restricted outcomes should remain the default when visibility or permission requirements are not satisfied clearly.

### 5. Relationship to later units

- U16-2 student visibility settings and U16-3 company access control depend on the consent posture defined here.
- U11 company review units and U17 dashboard units must reuse consent-aware access behavior for protected student data.
- Notification units must not bypass consent restrictions when summarizing protected data.
- Production security and audit work should preserve the same consent traceability direction later.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U16-2 student-visibility-settings
- U16-3 company-access-control
- U6-4 privacy filter for results

## Outputs

- Baseline data-consent-system model
- Consent-status and audit-history expectations
- Integration expectations for company access, dashboards, and notifications

## User flow

1. A student or another authorized actor changes or inspects consent state for protected data sharing.
2. Backend verifies authority and records the consent category, resulting state, and history metadata.
3. The platform stores the consent posture for later company-access evaluation.
4. Protected workflows query the consent posture when determining visibility outcomes.
5. Later company-facing features reuse the same consent baseline instead of inventing separate sharing switches.

## Acceptance criteria

- Data consent system behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, External consent-management services, and Cross-border compliance automation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- External consent-management services
- Cross-border compliance automation
- Public data sharing workflows
- Heavy analytics
