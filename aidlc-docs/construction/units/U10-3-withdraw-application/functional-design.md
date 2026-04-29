# Functional design: U10-3-withdraw-application

## Purpose

Define the baseline withdraw-application flow so an authenticated student can cancel an allowed application they own while preserving deterministic lifecycle state and history.

## User story

As a student, I need to withdraw an application I no longer want to pursue so my application state remains accurate and traceable.

## Functional requirements

### 1. Withdraw-application scope

- This unit covers student-owned withdrawal of an existing application only.
- The baseline should support:
  - loading one student-owned application
  - validating whether the application is currently withdrawable
  - applying an approved withdrawal state transition
  - recording traceable withdrawal history
- Application creation, company review, shortlist, rejection, interviews, and notifications remain separate later units.

### 2. Ownership and authorization behavior

- Only the authenticated student who owns the application should be able to request withdrawal.
- Students may not withdraw another student’s application.
- Company users and admins must not use this student withdrawal flow to manipulate application state outside approved privileged pathways.
- Withdrawal must respect company-boundary and student-ownership rules already established for application access.

### 3. Withdrawal transition behavior

- The baseline should support deterministic withdrawal only from approved pre-terminal or otherwise withdrawable states.
- Applications already withdrawn, rejected, or otherwise marked non-withdrawable by policy should reject repeated or invalid withdrawal attempts with stable outcomes.
- A successful withdrawal should set the authoritative application status to **withdrawn**.
- A successful withdrawal should create an **ApplicationStatusHistory** entry or equivalent audit-friendly transition record.
- Repeated execution of the same already-withdrawn request should not create conflicting terminal states.

### 4. Student experience posture

- Students should receive a clear outcome showing whether withdrawal succeeded or was blocked.
- Withdrawal should preserve later student access to the resulting application history.
- The baseline should support later user-facing explanation of why an application can or cannot be withdrawn.
- Withdrawal remains a student-owned control and must not expose company-only internal workflow detail.

### 5. Relationship to later units

- U10-2 application status tracking should own the shared lifecycle vocabulary and history presentation consumed by this unit.
- U10-4 company view applications should present withdrawn applications appropriately to authorized company users.
- U10-5 shortlist candidates and U10-6 reject candidates should respect the resulting terminal or near-terminal withdrawal state and avoid conflicting transitions.
- Later notification units may consume withdrawal events, but they must not redefine the withdrawal rules established here.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-1 apply to job
- U10-2 application status tracking

## Outputs

- Baseline student-owned withdrawal flow
- Approved withdrawal transition and history expectations
- Integration expectations for later company review and notification units

## User flow

1. A student opens one of their existing applications.
2. Backend verifies student ownership and current application state.
3. The platform determines whether withdrawal is currently allowed.
4. If allowed, the platform applies the withdrawn state and records traceable history.
5. The student receives a stable success or blocked-withdrawal outcome.

## Acceptance criteria

- Withdraw-application behavior is documented clearly.
- Ownership, transition, and audit boundaries are defined.
- The unit stays separate from company review and other downstream workflow actions.
- Shared lifecycle behavior is reused rather than redefined.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Application creation and status-history presentation
- Company review, shortlist, rejection, or interview actions
- Notifications
- Automated candidate decisions
