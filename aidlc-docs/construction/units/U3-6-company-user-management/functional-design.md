# Functional design: U3-6-company-user-management

## Purpose

Define the baseline company user-management flow so an authenticated company organization can manage its company-member accounts within a clear company-boundary and role-scoped model.

## User story

As a company organization, we need company user management so the employer account can support more than one company member without losing ownership, access control, or auditability.

## Functional requirements

### 1. Company user-management scope

- This unit covers management of company-member accounts inside a single company context.
- The baseline should support the core company user-management actions:
  - view current company members
  - add or provision an additional company member through an approved company-owned flow
  - update company-member role or access scope where allowed
  - remove, deactivate, or revoke a company member where policy allows
- Public company registration remains separate; this unit is for managing members after a company context already exists.

### 2. Company membership model

- Company users must be bound to a company membership context rather than acting as globally independent employer accounts.
- Each managed company member should belong to exactly one company context unless a later approved policy defines otherwise.
- The unit should support a clear distinction between:
  - the company organization profile
  - individual company-member user accounts inside that organization

### 3. Role and scope behavior

- Company-member management should support role-scoped company access rather than assuming every member is globally unrestricted within the organization.
- The baseline should allow later company workflows to distinguish which company users may manage profile settings, hiring preferences, vacancies, candidate review, or company members.
- Admin capabilities remain separate and must not be recreated through company-member management.

### 4. Read and update behavior

- Authenticated company users with the appropriate company-member scope must be able to view current members in their own company context.
- Authorized company users must be able to add, update, deactivate, or remove company members through stable, user-presentable outcomes.
- Validation failures such as duplicate company-member email, invalid role assignments, malformed input, or unauthorized updates must return stable outcomes.
- Successful membership changes should update company-boundary access state predictably.

### 5. Ownership, authorization, and audit posture

- Company users must not manage members belonging to another company.
- Sensitive membership actions should remain reviewable and compatible with later audit logging expectations.
- Company user management must remain aligned with the RBAC baseline, deny-by-default behavior, and company-boundary rules.

### 6. Frontend behavior

- The company user-management screen belongs inside the authenticated company route area and shared layout shell.
- Most editable membership-management state should remain local to the feature rather than promoted to global state unless later reuse justifies it.
- Loading, empty, success, and validation-error states should be represented clearly.

### 7. Relationship to later units

- This unit defines company membership management only.
- Detailed audit workflows, admin override behavior, vacancy ownership detail, and candidate-review task assignment remain separate units.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-2 authentication core
- U1-3 role-based access control
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U3-3 company profile basic
- U3-5 company hiring preferences

## Outputs

- Baseline company user-management flow
- Company-member ownership, scope, and validation expectations
- Integration expectations for later company-scoped workflow access

## User flow

1. Authorized company user enters the company user-management area.
2. Frontend loads the current company-member list for that company context.
3. User adds, updates, deactivates, or removes a company member through the allowed management flow.
4. Backend validates the change against company ownership, membership rules, and role-scope rules.
5. Frontend reflects the updated company-member state and any validation or error outcomes clearly.

## Acceptance criteria

- Company user-management behavior is documented clearly.
- Company-membership model and role-scope expectations are defined.
- Company-boundary and protected-route behavior are aligned with session auth and RBAC.
- Membership management is separated from public company registration and later audit-override workflows.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Detailed admin override behavior
- Enterprise IAM, SSO, or external directory integration
- Vacancy assignment and candidate-workflow ownership detail
