# Functional design: U3-1-company-registration

## Purpose

Define the baseline company-registration flow so a new employer organization can create its initial company-side account and enter the platform through the approved session-based auth model.

## User story

As a prospective company user, I need a clear company-registration flow so I can create a company-side account safely and begin setting up employer workflows in the platform.

## Functional requirements

### 1. Registration entry points

- Company registration must be available from the public frontend experience.
- The registration flow should remain distinct from student registration even though the shared auth model is reused underneath.
- Authenticated company users should be redirected away from public company registration once a valid session is present.

### 2. Registration data

- The baseline company-registration flow should collect the minimum information needed to create an initial company-side account:
  - company representative or account-holder name
  - company email
  - password
  - role fixed to `company`
- Rich company profile, description, hiring preferences, and additional company-user management belong to later Phase 3 units rather than the initial registration form.

### 3. Backend interaction

- The frontend should use the registration API baseline already defined in U1-4.
- Successful registration should create a company-side identity and, when supported by the final implementation path, establish an authenticated session.
- Validation failures must return stable, user-presentable error outcomes.

### 4. Post-registration behavior

- After successful registration, the user should enter the authenticated company experience according to the session-auth model.
- The routing and navigation model should redirect the user away from public company registration once the session is established.
- Shared app state should update the authenticated user and role context consistently.

### 5. Role and authorization boundaries

- Company registration creates a company-side identity only.
- Registration must not grant student or admin capabilities.
- Access to student data remains governed later by RBAC, privacy, consent, and workflow context rather than by registration alone.

### 6. Error and fallback behavior

- Duplicate email, weak password, invalid input, and unexpected backend failures should map to understandable registration outcomes.
- If registration succeeds but auth restore is pending, the app should show a consistent transition state rather than ambiguous behavior.

### 7. Relationship to later units

- This unit defines company registration only.
- Company login, company profile setup, hiring preferences, and company user management remain separate units.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout

## Outputs

- Baseline company-registration flow
- Registration-field and success/failure behavior expectations
- Integration expectations across API, session auth, routing, shared state, and layout

## User flow

1. Anonymous visitor opens the public company-registration screen.
2. User enters the required company-registration data and submits the form.
3. Backend validates input and creates a company-side account if allowed.
4. Backend establishes or confirms the authenticated session for the new company user.
5. Frontend updates shared auth state and routes the user into the company experience.

## Acceptance criteria

- Company-registration flow is documented clearly.
- Registration data, validation outcomes, and post-success behavior are defined.
- Registration is aligned with session-based auth and the shared frontend model.
- Company registration is separated from later company-profile and hiring-detail units.
- No application code is produced in this unit.

## Out of scope

- Concrete backend or frontend implementation code
- Detailed company profile onboarding beyond minimum registration fields
- Company login specialization
- Multi-user company invitation or approval workflow
