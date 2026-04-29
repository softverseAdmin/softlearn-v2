# Functional design: U18-4-manage-exams

## Purpose

Define the baseline manage-exams flow so authorized admins can perform protected exam management with full CRUD-oriented control and auditability.

## User story

As an admin, I need protected exam management so I can review and maintain exam records safely and consistently.

## Functional requirements

### 1. Manage-exams scope

- This unit covers manage exams only.
- The baseline should support:
  - listing and inspecting exam records in protected admin contexts
  - creating, updating, and deactivating exam records under admin authority
  - preserving exam metadata, category, and linkage to question banks or result contexts where relevant
  - returning stable outcomes for invalid, conflicting, or unauthorized management requests
- bulk-import tooling, external exam-platform synchronization, advanced proctoring workflows, heavy analytics, and cross-system provisioning remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated admins may perform manage-exams actions.
- Exam management must remain auditable because it affects sensitive assessment content and result contexts.
- Students and company users must not gain access to admin-only exam-management operations through this unit.
- Protected exam content, scoring, and result contexts must remain within policy-aware admin handling boundaries.

### 3. Exam-management behavior

- The baseline should support protected CRUD-oriented management of exam records under clear admin authority.
- Exam status and metadata changes should remain deterministic and auditable.
- Exam management should reuse shared assessment-domain baselines rather than inventing separate management-only exam semantics.
- This unit should not depend on external exam providers or advanced proctoring services.

### 4. Frontend and API alignment

- The capability belongs in protected admin routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for all state-changing admin actions.
- Admin workflows should reuse shared domain records and policies rather than inventing separate management-only models without cause.
- Administrative outcomes must remain auditable because these operations affect broad platform data.

### 5. Relationship to later units

- Exam creation, question, answer-option, scoring, and history units remain the assessment-domain source flows that this admin management can inspect or govern.
- Preparation and dashboard units may depend on the exam records governed through this management baseline.
- Admin dashboard and later production-readiness units may surface audit or operational summaries derived from exam-management activity.
- Any future external exam-platform synchronization must preserve the same protected admin-management direction unless an approved change says otherwise.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U5-1 exam-creation
- U5-2 question-creation
- U5-3 answer-options-management
- U14-1 exam-category
- U16-1 role-permissions

## Outputs

- Baseline protected manage-exams flow
- CRUD-oriented exam-management and audit expectations
- Integration expectations for preparation, dashboards, and permission-sensitive units

## User flow

1. An authorized admin opens protected exam management.
2. Backend verifies admin authority and loads the relevant exam records or target exam.
3. The platform applies the requested create, update, or deactivation action with stable validation and audit handling.
4. The admin receives a stable exam-management outcome.
5. Later preparation, dashboard, and operational units reuse the same protected exam-management posture.

## Acceptance criteria

- Manage exams behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Bulk-import tooling, and External exam-platform synchronization.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Bulk-import tooling
- External exam-platform synchronization
- Advanced proctoring workflows
- Heavy analytics
