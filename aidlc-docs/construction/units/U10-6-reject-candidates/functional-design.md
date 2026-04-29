# Functional design: U10-6-reject-candidates

## Purpose

Define the baseline reject-candidates flow so authorized company users can move an eligible application into a rejected state with traceable workflow evidence.

## User story

As an authorized company user, I need to reject an application when the candidate is not moving forward so the hiring workflow stays accurate and auditable.

## Functional requirements

### 1. Reject-candidates scope

- This unit covers the company-side rejection action only.
- The baseline should support:
  - loading one authorized application-review context
  - validating that rejection is currently allowed
  - applying a rejection state transition
  - recording traceable status-history evidence
- Notifications, interviews, offers, and candidate-note behaviors remain separate later units.

### 2. Authorization and ownership behavior

- Only authorized company users may reject applications tied to their own company’s vacancies.
- Company users must not reject applications for another company’s vacancy or outside approved review contexts.
- Rejection must build on an already authorized application-review surface and reuse company-boundary rules.
- Student-owned and company-visible data boundaries must remain protected during the action.

### 3. Rejection transition behavior

- The baseline should support deterministic rejection only from approved rejectable states.
- Applications already rejected, withdrawn, or otherwise marked non-rejectable by policy should reject repeated or invalid rejection attempts with stable outcomes.
- A successful rejection should set the authoritative application status to **rejected**.
- A successful rejection should create an **ApplicationStatusHistory** entry or equivalent audit-friendly transition record.
- The baseline may support structured rejection reason metadata later, but reason capture must not replace traceable status history.

### 4. Workflow posture

- Rejection should represent an explicit company-side adverse workflow action.
- The action should remain auditable and reviewable.
- Rejection must not automatically create notifications or delete historical application evidence within this unit.
- The baseline should keep rejection distinct from shortlist, interview, and later communication experiences.

### 5. Relationship to later units

- U10-4 company view applications should surface the contexts from which rejection actions are launched.
- U10-5 shortlist candidates should remain a separate advancement action and must not be merged into rejection behavior.
- Later notification units may consume rejection events for student communication but must not redefine rejection authorization or terminal-state rules.
- Later interview units should respect rejected applications as non-progressing or otherwise policy-gated contexts.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-2 application status tracking
- U10-4 company view applications

## Outputs

- Baseline company-side rejection action flow
- Terminal-state and lifecycle expectations
- Integration expectations for later notification and candidate-review units

## User flow

1. An authorized company user reviews an application in an approved company context.
2. Backend verifies company ownership and current application state.
3. The platform determines whether rejection is currently allowed.
4. If allowed, the platform applies the rejected state and records traceable history.
5. The company user receives a stable rejection outcome for later candidate communication workflows.

## Acceptance criteria

- Reject-candidates behavior is documented clearly.
- Authorization, terminal-state, and audit boundaries are defined.
- The unit stays separate from notifications, shortlist, and interview workflows.
- Shared lifecycle behavior is reused rather than redefined.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Passive application review and shortlist actions
- Notification delivery
- Interview scheduling
- Automated hiring decisions
