# Functional design: U3-2-company-login

## Purpose

Define the baseline company-login flow so an existing company user can authenticate and enter the protected company experience through the shared session-based auth model.

## User story

As a company user with an existing account, I need a reliable login flow so I can securely access company profile, hiring, candidate-review, application, interview, and notification features.

## Functional requirements

### 1. Login entry points

- Company login must be available from the public frontend experience.
- Authenticated company users should be redirected away from the public company-login page once a valid session is present.
- Company login should remain distinct from student or admin login behavior even though the core auth model is shared.

### 2. Login data

- The baseline company-login flow should collect:
  - email
  - password
- Role context after successful login must resolve to `company`.

### 3. Backend interaction

- The frontend should use the login API baseline already defined in U1-4.
- Successful login should establish an authenticated browser session for the company user.
- Invalid credentials and other failures must return stable, user-presentable error outcomes.

### 4. Post-login behavior

- After successful login, the user should enter the authenticated company experience according to the routing and layout baselines.
- Shared app state should update authenticated status, current user summary, and role context consistently.
- Public company-login routes should redirect into the appropriate company home area after success.

### 5. Session and route behavior

- Login should align with session restore and protected-route behavior already defined in the frontend foundation.
- Logout and session expiry remain handled by the shared auth/session model rather than by special company-login-only logic.
- The company-login screen should support retry after failure without breaking app-shell state.

### 6. Role and authorization boundaries

- Company login establishes company-side authenticated identity only.
- Access to student data, candidate-review features, and exam results remains governed later by RBAC, privacy, consent, and workflow context rather than by login alone.
- Login must not blur the boundary between company, student, and admin experiences.

### 7. Error and fallback behavior

- Invalid credentials, missing required input, locked or unavailable account behavior if introduced later, and unexpected backend failures should map to understandable login outcomes.
- If a session already exists, the company-login experience should resolve predictably rather than offering duplicate access paths.

### 8. Relationship to later units

- This unit defines company login only.
- Company profile setup, hiring preferences, company user management, and candidate workflow behavior remain separate units.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- U1-2 authentication core
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U3-1 company registration

## Outputs

- Baseline company-login flow
- Login-field and success/failure behavior expectations
- Integration expectations across session auth, routing, shared state, and layout

## User flow

1. Anonymous company user opens the public company-login screen.
2. User enters email and password and submits the form.
3. Backend validates credentials and establishes an authenticated session if successful.
4. Frontend updates shared auth and user context.
5. Router redirects the company user into the authenticated company experience.

## Acceptance criteria

- Company-login flow is documented clearly.
- Login fields, validation outcomes, and post-success routing behavior are defined.
- Login is aligned with session-based auth and the shared frontend model.
- Company login is separated from registration and later company-profile-detail units.
- No application code is produced in this unit.

## Out of scope

- Concrete backend or frontend implementation code
- Password reset implementation detail
- Student or admin login specialization
- MFA or advanced account-security extensions unless introduced later
