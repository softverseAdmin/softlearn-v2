# Functional design: U16-1-role-permissions

## Purpose

Define the baseline operational role-permissions model so student, company, and admin workflows use one consistent permission vocabulary across the later product surface.

## User story

As the platform, I need a clear role-permissions model so protected actions remain consistent, auditable, and easy to reason about across students, companies, and admins.

## Functional requirements

### 1. Role-permissions scope

- This unit covers role permissions only.
- The baseline should support:
  - defining a stable permission vocabulary aligned with student, company, and admin roles
  - mapping permissions to protected domains such as profiles, learning, hiring, interviews, dashboards, and admin management
  - supporting deterministic permission checks and role-appropriate denial outcomes
  - providing a baseline for later company access control and admin-management units
- company-specific access rules, consent detail, full policy engine implementation, attribute-based access expansion, and external identity integration remain separate later units.

### 2. Authorization and visibility behavior

- Role permissions must build on the existing RBAC baseline rather than replace it with ad hoc checks.
- Permissions must remain explainable, role-appropriate, and auditable.
- Admins must remain protected and must not gain unrestricted access without documented policy basis.
- Denied actions should produce stable outcomes rather than silent fallback behavior.

### 3. Role-permission behavior

- The baseline should define stable permission groupings such as self-service student actions, company-owned hiring actions, and protected admin operations.
- Permission evaluation should stay deterministic and compatible with session-based authentication and company-boundary rules.
- The model should allow later consent and visibility rules to refine access without redefining core role permissions.
- This unit must not introduce a separate identity provider or external policy service.

### 4. Frontend and API alignment

- The capability belongs in protected role-specific routes and backend checks aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests.
- Privacy, consent, and access-control decisions must stay centralized and auditable rather than duplicated across clients.
- Restricted outcomes should remain the default when visibility or permission requirements are not satisfied clearly.

### 5. Relationship to later units

- U1-3 role-based access control remains the foundational authorization baseline that this unit refines operationally.
- U16-2 through U16-4 define narrower visibility, company-boundary, and consent controls on top of this permission vocabulary.
- Dashboard, admin, and production-hardening units should reuse these permission terms rather than inventing competing access labels.
- Notification and meeting-link units must continue to honor the same permission posture.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U10-4 company-view-applications
- U18-1 manage-users

## Outputs

- Baseline operational role-permissions model
- Protected action vocabulary for later feature units
- Integration expectations for company access, consent, dashboards, and admin units

## User flow

1. A protected workflow requests an action in a student, company, or admin context.
2. Backend maps the action to the operational permission vocabulary defined for the role and resource context.
3. The platform allows or denies the action deterministically and preserves an auditable outcome.
4. The authorized user receives the protected feature behavior or a stable denial outcome.
5. Later feature units reuse the same role-permission vocabulary across the product.

## Acceptance criteria

- Role permissions behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Company-specific relationship rules, and Full policy engine implementation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Company-specific relationship rules
- Full policy engine implementation
- External identity integration
- Attribute-based access expansion
