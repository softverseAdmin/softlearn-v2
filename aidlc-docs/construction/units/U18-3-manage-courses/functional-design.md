# Functional design: U18-3-manage-courses

## Purpose

Define the baseline manage-courses flow so authorized admins can perform protected course management with full CRUD-oriented control and auditability.

## User story

As an admin, I need protected course management so I can review and maintain course records safely and consistently.

## Functional requirements

### 1. Manage-courses scope

- This unit covers manage courses only.
- The baseline should support:
  - listing and inspecting course records in protected admin contexts
  - creating, updating, and deactivating course records under admin authority
  - preserving course metadata, status, and linkage to lessons or enrollments where relevant
  - returning stable outcomes for invalid, conflicting, or unauthorized management requests
- bulk-import tooling, external LMS synchronization, self-service instructor workflows, advanced content publishing, and cross-system provisioning remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated admins may perform manage-courses actions.
- Course management must remain auditable because it affects learning content and student progress contexts.
- Students and company users must not gain access to admin-only course-management operations through this unit.
- Protected learning records must remain within policy-aware admin handling boundaries.

### 3. Course-management behavior

- The baseline should support protected CRUD-oriented management of course records under clear admin authority.
- Course status and metadata changes should remain deterministic and auditable.
- Course management should reuse shared learning-domain baselines rather than inventing separate management-only course semantics.
- This unit should not depend on external LMS providers or bulk-import infrastructure.

### 4. Frontend and API alignment

- The capability belongs in protected admin routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for all state-changing admin actions.
- Admin workflows should reuse shared domain records and policies rather than inventing separate management-only models without cause.
- Administrative outcomes must remain auditable because these operations affect broad platform data.

### 5. Relationship to later units

- Course, lesson, enrollment, and completion units remain the learning-domain source flows that this admin management can inspect or govern.
- Student dashboards and learning summaries may depend on the course records governed through this management baseline.
- Admin dashboard and later production-readiness units may surface audit or operational summaries derived from course-management activity.
- Any future LMS synchronization must preserve the same protected admin-management direction unless an approved change says otherwise.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U4-1 course-creation
- U4-3 course-detail-page
- U4-4 lesson-creation
- U4-6 course-enrollment
- U16-1 role-permissions

## Outputs

- Baseline protected manage-courses flow
- CRUD-oriented course-management and audit expectations
- Integration expectations for learning summaries, dashboards, and permission-sensitive units

## User flow

1. An authorized admin opens protected course management.
2. Backend verifies admin authority and loads the relevant course records or target course.
3. The platform applies the requested create, update, or deactivation action with stable validation and audit handling.
4. The admin receives a stable course-management outcome.
5. Later learning, dashboard, and operational units reuse the same protected course-management posture.

## Acceptance criteria

- Manage courses behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Bulk-import tooling, and External LMS synchronization.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Bulk-import tooling
- External LMS synchronization
- Self-service instructor workflows
- Cross-system provisioning
