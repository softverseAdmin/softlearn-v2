# Functional design: U18-5-manage-vacancies

## Purpose

Define the baseline manage-vacancies flow so authorized admins can perform protected vacancy management with full CRUD-oriented control and auditability.

## User story

As an admin, I need protected vacancy management so I can review and maintain vacancy records safely and consistently when platform intervention is required.

## Functional requirements

### 1. Manage-vacancies scope

- This unit covers manage vacancies only.
- The baseline should support:
  - listing and inspecting vacancy records in protected admin contexts
  - creating, updating, and deactivating vacancy records under admin authority where policy allows it
  - preserving vacancy metadata, company linkage, and visibility status for managed vacancies
  - returning stable outcomes for invalid, conflicting, or unauthorized management requests
- bulk-import tooling, external ATS synchronization, company self-service vacancy workflows, heavy analytics, and cross-system provisioning remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated admins may perform manage-vacancies actions.
- Vacancy management must remain auditable because it affects hiring visibility and company workflows.
- Company users must not gain access to admin-only vacancy-management operations through this unit.
- Protected company and candidate data linked to vacancies must remain within policy-aware admin handling boundaries.

### 3. Vacancy-management behavior

- The baseline should support protected CRUD-oriented management of vacancy records under clear admin authority.
- Vacancy status and metadata changes should remain deterministic and auditable.
- Vacancy management should reuse shared company and hiring-domain baselines rather than inventing separate management-only vacancy semantics.
- This unit should not depend on external ATS providers or company self-service shortcuts.

### 4. Frontend and API alignment

- The capability belongs in protected admin routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for all state-changing admin actions.
- Admin workflows should reuse shared domain records and policies rather than inventing separate management-only models without cause.
- Administrative outcomes must remain auditable because these operations affect broad platform data.

### 5. Relationship to later units

- Vacancy creation, editing, deletion, and listing units remain the hiring-domain source flows that this admin management can inspect or govern.
- Company dashboard, matching, and application units may depend on vacancy status governed through this management baseline.
- Admin dashboard and later production-readiness units may surface audit or operational summaries derived from vacancy-management activity.
- Any future ATS synchronization must preserve the same protected admin-management direction unless an approved change says otherwise.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U7-1 vacancy-create
- U7-2 vacancy-edit
- U7-3 vacancy-delete
- U7-4 vacancy-list
- U16-1 role-permissions

## Outputs

- Baseline protected manage-vacancies flow
- CRUD-oriented vacancy-management and audit expectations
- Integration expectations for company dashboards, matching, and permission-sensitive units

## User flow

1. An authorized admin opens protected vacancy management.
2. Backend verifies admin authority and loads the relevant vacancy records or target vacancy.
3. The platform applies the requested create, update, or deactivation action with stable validation and audit handling.
4. The admin receives a stable vacancy-management outcome.
5. Later dashboards, matching, and operational units reuse the same protected vacancy-management posture.

## Acceptance criteria

- Manage vacancies behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Bulk-import tooling, and External ATS synchronization.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Bulk-import tooling
- External ATS synchronization
- Company self-service vacancy workflows
- Heavy analytics
