# Functional design: U18-1-manage-users

## Purpose

Define the baseline manage-users flow so authorized admins can perform protected user management with full CRUD-oriented control and auditability.

## User story

As an admin, I need protected user management so I can review and maintain platform user accounts safely and consistently.

## Functional requirements

### 1. Manage-users scope

- This unit covers manage users only.
- The baseline should support:
  - listing and inspecting user records in protected admin contexts
  - creating, updating, and deactivating user records under admin authority
  - preserving role, company association, and status metadata for managed users
  - returning stable outcomes for invalid, conflicting, or unauthorized management requests
- external identity synchronization, bulk-import tooling, self-service profile management, advanced compliance workflows, and cross-system provisioning remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated admins may perform manage-users actions.
- User management must remain auditable because it affects identity, access, and platform operations.
- Admin access to user records must still respect privacy and policy where sensitive fields are involved.
- Company users and students must not gain access to admin-only user-management operations.

### 3. User-management behavior

- The baseline should support protected CRUD-oriented management of student, company-user, and admin accounts under clear policy boundaries.
- Role changes, account status changes, and company association changes should remain deterministic and auditable.
- User management should reuse shared identity and permission baselines rather than inventing a separate identity model.
- This unit should not depend on external identity providers or cross-system provisioning.

### 4. Frontend and API alignment

- The capability belongs in protected admin routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for all state-changing admin actions.
- Admin workflows should reuse shared domain records and policies rather than inventing separate management-only models without cause.
- Administrative outcomes must remain auditable because these operations affect broad platform data.

### 5. Relationship to later units

- U16 role-permission and access-control units define the policy posture that user management must honor.
- Company user-management behavior remains separate from this admin-wide user-management unit.
- Admin dashboard and later production-readiness units may surface audit or operational summaries derived from user-management activity.
- Any future external identity integration must preserve the same protected admin-management direction unless an approved change says otherwise.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U3-6 company-user-management
- U16-1 role-permissions

## Outputs

- Baseline protected manage-users flow
- CRUD-oriented user-management and audit expectations
- Integration expectations for admin dashboard and permission-sensitive units

## User flow

1. An authorized admin opens protected user management.
2. Backend verifies admin authority and loads the relevant user records or target account.
3. The platform applies the requested create, update, or deactivation action with stable validation and audit handling.
4. The admin receives a stable user-management outcome.
5. Later dashboard and operational units reuse the same protected user-management posture.

## Acceptance criteria

- Manage users behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, External identity synchronization, and Bulk-import tooling.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- External identity synchronization
- Bulk-import tooling
- Cross-system provisioning
- Self-service profile management
