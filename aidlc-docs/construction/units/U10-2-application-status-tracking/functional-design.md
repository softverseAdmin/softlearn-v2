# Functional design: U10-2-application-status-tracking

## Purpose

Define the baseline application-status-tracking flow so the platform can maintain one stable current status and one traceable status-history timeline for each application.

## User story

As the platform, I need deterministic application status tracking so students and companies can rely on one auditable view of each application’s workflow state.

## Functional requirements

### 1. Application-status-tracking scope

- This unit covers current status and status-history management rules only.
- The baseline should support:
  - storing one current application status
  - storing an ordered status-history timeline
  - presenting stable status information to authorized users
  - defining baseline transition expectations used by later workflow units
- Application creation, withdrawal, shortlist, rejection, interviews, and notifications remain separate later units.

### 2. Baseline status model

- The baseline should support a stable set of application states such as:
  - submitted
  - under_review
  - shortlisted
  - rejected
  - withdrawn
- Later units may extend the lifecycle carefully for interview or offer stages, but they must preserve auditability and deterministic history behavior.
- Each application should have one authoritative current status at a time.

### 3. Status-history behavior

- Every approved state transition should create an **ApplicationStatusHistory** entry or equivalent traceable record.
- Status-history records should preserve at least:
  - prior or resulting status context
  - timestamp
  - actor or transition source context where appropriate
  - optional structured reason or note metadata when policy allows
- Repeated evaluation of the same application state should present the same current status and ordered history.
- Validation failures such as unsupported statuses, conflicting current-state updates, missing transition evidence, or out-of-order history must return stable outcomes.

### 4. Visibility and access behavior

- Students may view the status and history of their own applications.
- Company users may view status and history of applications attached to their authorized vacancies.
- Status tracking must not bypass privacy or company-boundary rules.
- The platform should present a consistent status vocabulary across student and company contexts, even if explanation detail differs by role.

### 5. Relationship to later units

- U10-1 apply to job should create the initial submitted state.
- U10-3 withdraw application should create authorized withdrawal transitions.
- U10-4 company view applications should present authorized application status views.
- U10-5 shortlist candidates and U10-6 reject candidates should create approved company-side transitions without redefining the shared status model.
- Later interview and notification units may consume status changes as workflow triggers but must not redefine the baseline status-history model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-1 apply to job

## Outputs

- Baseline current-status and status-history model
- Shared lifecycle expectations for later application workflow units
- Integration expectations for authorized student and company views

## User flow

1. The platform receives an application event from an approved upstream action.
2. Backend validates the requested or resulting status against the baseline status model.
3. The platform updates the authoritative current status and records a traceable history entry.
4. Authorized student or company views retrieve the same stable current status and ordered history.
5. Later workflow units reuse this shared lifecycle baseline for consistent application behavior.

## Acceptance criteria

- Application status-tracking behavior is documented clearly.
- Stable status vocabulary, history behavior, and access boundaries are defined.
- The unit stays separate from creation and action-specific workflow units.
- Audit-friendly lifecycle expectations are documented.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Application creation, withdrawal, shortlist, and rejection actions
- Interview-state behavior
- Notifications
- Automated hiring decisions
