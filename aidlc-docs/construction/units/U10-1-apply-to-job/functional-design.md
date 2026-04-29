# Functional design: U10-1-apply-to-job

## Purpose

Define the baseline apply-to-job flow so an authenticated student can create a protected application against a visible vacancy using explicit validation and initial status-history behavior.

## User story

As a student, I need to apply to a visible job so I can enter the hiring workflow through a protected and traceable application record.

## Functional requirements

### 1. Apply-to-job scope

- This unit covers creation of a student-owned application record only.
- The baseline should support:
  - loading one visible vacancy context
  - verifying authenticated student ownership of the request
  - validating baseline application eligibility
  - creating an application with an initial status
  - creating the initial status-history record or equivalent traceable submission evidence
- Status tracking, withdrawal, company review, shortlist, rejection, interviews, and notifications remain separate later units.

### 2. Eligibility and visibility behavior

- Only authenticated students should be able to create applications.
- Students may only apply to vacancies currently visible and eligible for student application.
- Hidden, inactive, withdrawn, unauthorized, or otherwise unavailable vacancies must not accept new applications.
- The baseline should support deterministic rejection of duplicate or conflicting application attempts for the same student and vacancy when policy rules do not allow another active application.

### 3. Application creation behavior

- A successful apply action should create a protected **Application** record linking the student and vacancy.
- The baseline should set a stable initial application status such as **submitted**.
- The baseline should create traceable submission history through **ApplicationStatusHistory** or equivalent audit-friendly state recording.
- Repeated execution of the same valid request should not create uncontrolled duplicate active applications.
- Validation failures such as missing authentication, invalid vacancy selection, blocked visibility, duplicate active application, or malformed request data must return stable outcomes.

### 4. Student experience posture

- The apply-to-job flow should work from approved vacancy contexts such as vacancy detail or matched-jobs views.
- Students should receive a clear submission outcome and resulting application status.
- Successful application creation should preserve later student access to their own application record and status history.
- Application creation remains a student-owned action and must not expose company-only workflow details.

### 5. Relationship to later units

- U10-2 application status tracking should own later status lifecycle visibility and history presentation.
- U10-3 withdraw application should own student-side cancellation of an existing application.
- U10-4 through U10-6 should own company-side application review, shortlist, and rejection actions.
- Later interview and notification units may consume submitted applications as hiring-workflow inputs but must not redefine application creation rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U7-4 vacancy list
- U7-5 vacancy detail
- U8-1 job list page
- U8-7 bookmark jobs
- U9-8 matched jobs for student

## Outputs

- Baseline student-owned application-creation flow
- Initial status and status-history expectations
- Integration expectations for later status-tracking and company-review units

## User flow

1. A student opens an eligible vacancy from a visible discovery context.
2. Backend verifies student authentication and vacancy visibility.
3. The platform validates that a new application is allowed for the student-vacancy pair.
4. The platform creates the application with an initial status and traceable status-history entry.
5. The student receives a stable application outcome and can continue later into status-tracking flows.

## Acceptance criteria

- Apply-to-job behavior is documented clearly.
- Eligibility, duplicate-prevention, and initial-status boundaries are defined.
- The unit stays separate from later status tracking and company review actions.
- Student ownership and vacancy-visibility expectations are documented.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Status-history presentation and later status transitions
- Withdrawal, shortlist, rejection, or interview actions
- Notifications
- Automated candidate decisions
