# Functional design: U2-3-student-profile-basic

## Purpose

Define the baseline student basic profile flow so an authenticated student can view and update the core personal profile information needed for later learning and job-matching workflows.

## User story

As an authenticated student, I need a basic profile screen so I can review and maintain my core identity and preference information inside the platform.

## Functional requirements

### 1. Profile scope

- The basic student profile unit should cover the first layer of editable student-owned profile data available after registration and login.
- The baseline should include core fields already implied by the API design, such as:
  - name
  - desired job type
  - desired work location
  - Japanese level
  - English level
  - basic profile completion state where useful
- Skills, education, experience, language-detail expansion, resume, availability, and privacy settings remain separate downstream units.

### 2. Read profile behavior

- Authenticated students must be able to view their own current basic profile data.
- The frontend should use the authenticated student profile API baseline defined in U1-4.
- If no optional field has been filled yet, the UI should still present a clear editable profile state rather than appearing broken or inaccessible.

### 3. Update profile behavior

- Authenticated students must be able to update their own basic profile data.
- Update behavior should use the protected student profile update API under the session-auth model.
- Validation failures should return stable, user-presentable outcomes.
- Successful updates should reflect immediately in shared student-facing UI state where relevant.

### 4. Ownership and authorization

- Only the authenticated student may read or update this profile through the student self-service flow.
- Company and admin access rules for student data are outside this unit’s self-service scope.
- Student profile access must remain consistent with the RBAC baseline and later privacy units.

### 5. Frontend behavior

- The basic profile screen belongs inside the authenticated student route area and shared layout shell.
- Shared app state may consume a small profile summary if later shell behavior needs it, but most editable field state should remain local to the profile feature.
- Loading, empty, success, and validation-error states should be represented clearly.

### 6. Relationship to later units

- This unit defines basic profile fields only.
- Later units refine skills, education, experience, language-level detail, resume handling, availability, and privacy controls.

## Inputs

- Inception requirements baseline
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U2-1 student registration
- U2-2 student login

## Outputs

- Baseline student basic profile read and update flow
- Basic profile field ownership and validation expectations
- Integration expectations across protected routing, API access, and frontend state

## User flow

1. Authenticated student enters the student profile route.
2. Frontend loads the student’s current basic profile data.
3. Student reviews or edits the available basic profile fields.
4. Frontend submits the update request to the protected profile API.
5. Backend validates and persists the update, and the UI reflects success or field-specific errors.

## Acceptance criteria

- Student basic profile read and update behavior is documented clearly.
- Basic profile fields and validation outcomes are defined.
- Ownership and protected-route behavior are aligned with session auth and RBAC.
- Basic profile scope is separated from later profile-detail units.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Skills, education, experience, resume, availability, and privacy-detail units
- Company-facing or admin-facing views of student data
