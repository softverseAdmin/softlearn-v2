# Functional design: U3-3-company-profile-basic

## Purpose

Define the baseline company basic-profile flow so an authenticated company user can view and update the core organization identity fields needed before richer company-detail and hiring workflows.

## User story

As an authenticated company user, I need a basic company profile screen so I can maintain the core organization identity information used across employer workflows.

## Functional requirements

### 1. Profile scope

- This unit covers the first layer of editable company-owned profile data available after company registration and login.
- The baseline should include core non-description company identity fields already implied by the API direction, such as:
  - company name
  - basic company profile completeness state where useful
- Richer narrative description and default hiring preferences remain separate later Phase 3 units.

### 2. Read profile behavior

- Authenticated company users must be able to view their own current company basic profile data.
- The frontend should use the authenticated company profile API baseline defined in U1-4.
- If optional profile detail is still incomplete, the UI should present a clear editable state rather than appearing broken or inaccessible.

### 3. Update profile behavior

- Authenticated company users must be able to update their own company basic profile data.
- Update behavior should use the protected company profile update API under the session-auth model.
- Validation failures must return stable, user-presentable outcomes.
- Successful updates should reflect predictably in the company experience and any shared company summary state where relevant.

### 4. Ownership and authorization

- Only authenticated users bound to the same company context may read or update that company’s basic profile through this self-service flow.
- Company users must not access or update another company’s private profile data.
- Company basic profile access must remain consistent with the RBAC baseline and company-boundary rules.

### 5. Frontend behavior

- The company basic profile screen belongs inside the authenticated company route area and shared layout shell.
- Shared app state may consume a small company summary if later shell behavior needs it, but most editable field state should remain local to the company-profile feature.
- Loading, empty, success, and validation-error states should be represented clearly.

### 6. Relationship to later units

- This unit defines basic company profile fields only.
- Company profile description, hiring preferences, company user management, vacancies, and candidate-review workflows remain separate units.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U3-1 company registration
- U3-2 company login

## Outputs

- Baseline company basic-profile read and update flow
- Basic company profile ownership and validation expectations
- Integration expectations across protected routing, API access, and frontend state

## User flow

1. Authenticated company user enters the company profile route.
2. Frontend loads the company’s current basic profile data.
3. User reviews or edits the available core identity fields.
4. Frontend submits the update request to the protected company profile API.
5. Backend validates and persists the update, and the UI reflects success or field-specific errors.

## Acceptance criteria

- Company basic-profile read and update behavior is documented clearly.
- Core basic-profile fields and validation outcomes are defined.
- Company-boundary and protected-route behavior are aligned with session auth and RBAC.
- Basic profile scope is separated from description, hiring preferences, and company-user management units.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Rich narrative company description
- Hiring preferences, vacancy setup, and candidate workflow behavior
- Company membership and user-management behavior
