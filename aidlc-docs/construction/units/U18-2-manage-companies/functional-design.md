# Functional design: U18-2-manage-companies

## Purpose

Define the baseline manage-companies flow so authorized admins can perform protected company management with full CRUD-oriented control and auditability.

## User story

As an admin, I need protected company management so I can review and maintain company records safely and consistently.

## Functional requirements

### 1. Manage-companies scope

- This unit covers manage companies only.
- The baseline should support:
  - listing and inspecting company records in protected admin contexts
  - creating, updating, and deactivating company records under admin authority
  - preserving company profile, status, and ownership metadata for managed companies
  - returning stable outcomes for invalid, conflicting, or unauthorized management requests
- external company sync, bulk-import tooling, self-service company-profile management, advanced compliance workflows, and cross-system provisioning remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated admins may perform manage-companies actions.
- Company management must remain auditable because it affects hiring access and organization scope.
- Company users must not gain access to admin-only company-management operations through this unit.
- Protected company and associated student data must remain within policy-aware admin handling boundaries.

### 3. Company-management behavior

- The baseline should support protected CRUD-oriented management of company records under clear admin authority.
- Company status changes and ownership metadata changes should remain deterministic and auditable.
- Company management should reuse shared company-boundary and permission baselines rather than inventing a separate organization model.
- This unit should not depend on external organization-sync providers.

### 4. Frontend and API alignment

- The capability belongs in protected admin routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for all state-changing admin actions.
- Admin workflows should reuse shared domain records and policies rather than inventing separate management-only models without cause.
- Administrative outcomes must remain auditable because these operations affect broad platform data.

### 5. Relationship to later units

- Company profile and company-user units remain the company-side source flows that this admin management can inspect or govern at a higher level.
- Vacancy and dashboard units may depend on company status defined through this management baseline.
- Admin dashboard and later production-readiness units may surface audit or operational summaries derived from company-management activity.
- Any future external company sync must preserve the same protected admin-management direction unless an approved change says otherwise.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U3-3 company-profile-basic
- U3-4 company-profile-description
- U3-5 company-hiring-preferences
- U3-6 company-user-management
- U16-1 role-permissions

## Outputs

- Baseline protected manage-companies flow
- CRUD-oriented company-management and audit expectations
- Integration expectations for vacancy, dashboard, and permission-sensitive units

## User flow

1. An authorized admin opens protected company management.
2. Backend verifies admin authority and loads the relevant company records or target organization.
3. The platform applies the requested create, update, or deactivation action with stable validation and audit handling.
4. The admin receives a stable company-management outcome.
5. Later vacancy, dashboard, and operational units reuse the same protected company-management posture.

## Acceptance criteria

- Manage companies behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, External organization synchronization, and Bulk-import tooling.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- External organization synchronization
- Bulk-import tooling
- Cross-system provisioning
- Self-service company-profile management
