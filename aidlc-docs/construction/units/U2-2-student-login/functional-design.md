# Functional design: U2-2-student-login

## Purpose

Define the baseline student login flow so an existing learner can authenticate and enter the protected student experience through the shared session-based auth model.

## User story

As a student with an existing account, I need a reliable login flow so I can securely access my learning, exams, job-matching, applications, and interview features.

## Functional requirements

### 1. Login entry points

- Student login must be available from the public frontend experience.
- Authenticated students should be redirected away from the public login page once a valid session is present.
- Student login should remain distinct from company or admin login behavior even though the core auth model is shared.

### 2. Login data

- The baseline student login flow should collect:
  - email
  - password
- Role context after successful login must resolve to `student`.

### 3. Backend interaction

- The frontend should use the login API baseline already defined in U1-4.
- Successful login should establish an authenticated browser session for the student.
- Invalid credentials and other failures must return stable, user-presentable error outcomes.

### 4. Post-login behavior

- After successful login, the user should enter the authenticated student experience according to the routing and layout baselines.
- Shared app state should update authenticated status, current user summary, and role context consistently.
- Public login routes should redirect into the appropriate student home area after success.

### 5. Session and route behavior

- Login should align with session restore and protected-route behavior already defined in the frontend foundation.
- Logout and session expiry remain handled by the shared auth/session model rather than by special login-only logic.
- The login screen should support retry after failure without breaking app-shell state.

### 6. Error and fallback behavior

- Invalid credentials, missing required input, locked or unavailable account behavior if introduced later, and unexpected backend failures should map to understandable login outcomes.
- If a session already exists, the login experience should resolve predictably rather than offering duplicate access paths.

### 7. Relationship to later units

- This unit defines student login only.
- Password reset, student profile completion, privacy settings, and richer onboarding remain separate units.

## Inputs

- Inception requirements baseline
- U1-2 authentication core
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U2-1 student registration

## Outputs

- Baseline student login flow
- Login-field and success/failure behavior expectations
- Integration expectations across session auth, routing, shared state, and layout

## User flow

1. Anonymous student opens the public login screen.
2. User enters email and password and submits the form.
3. Backend validates credentials and establishes an authenticated session if successful.
4. Frontend updates shared auth and user context.
5. Router redirects the student into the authenticated student experience.

## Acceptance criteria

- Student login flow is documented clearly.
- Login fields, validation outcomes, and post-success routing behavior are defined.
- Login is aligned with session-based auth and the shared frontend model.
- Student login is separated from registration and later profile-detail units.
- No application code is produced in this unit.

## Out of scope

- Concrete backend or frontend implementation code
- Password reset implementation detail
- Company or admin login specialization
- MFA or advanced account-security extensions unless introduced later
