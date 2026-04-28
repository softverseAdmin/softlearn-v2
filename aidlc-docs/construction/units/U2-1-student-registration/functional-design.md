# Functional design: U2-1-student-registration

## Purpose

Define the baseline student registration flow so a new learner can create an account and enter the platform through the approved session-based auth model.

## User story

As a prospective student, I need a clear registration flow so I can create my account, establish my identity safely, and start using the learning and job-matching platform.

## Functional requirements

### 1. Registration entry points

- Student registration must be available from the public frontend experience.
- The registration flow should be separate from company-user registration even if the backend auth model is shared.
- Authenticated users should not be encouraged to access the student registration screen again unless the product explicitly supports role switching later.

### 2. Registration data

- The baseline student registration flow should collect the minimum information needed to create a student account:
  - name
  - email
  - password
  - role fixed to `student`
- Additional student profile details belong to later student-profile units rather than the initial registration form.

### 3. Backend interaction

- The frontend should use the registration API baseline already defined in U1-4.
- Successful registration should create a student account and, when supported by the final implementation path, establish an authenticated session.
- Validation failures must return stable, user-presentable error outcomes.

### 4. Post-registration behavior

- After successful registration, the user should enter the authenticated student experience according to the session-auth model.
- The routing and navigation model should redirect the user away from public registration once the session is established.
- Shared app state should update the authenticated user and role context consistently.

### 5. Role and authorization boundaries

- Student registration creates a student identity only.
- Registration must not grant company or admin capabilities.
- Later privacy, profile, and consent units extend the student account after this registration baseline.

### 6. Error and fallback behavior

- Duplicate email, weak password, invalid input, and unexpected backend failures should map to understandable registration outcomes.
- If registration succeeds but auth restore is pending, the app should show a consistent transition state rather than ambiguous behavior.

### 7. Relationship to later units

- This unit defines student registration only.
- Student login, student profile, privacy settings, and company registration remain separate units.

## Inputs

- Inception requirements baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout

## Outputs

- Baseline student registration flow
- Registration-field and success/failure behavior expectations
- Integration expectations across API, session auth, routing, shared state, and layout

## User flow

1. Anonymous visitor opens the public student registration screen.
2. User enters required registration data and submits the form.
3. Backend validates input and creates a student account if allowed.
4. Backend establishes or confirms the authenticated session for the new student.
5. Frontend updates shared auth state and routes the user into the student experience.

## Acceptance criteria

- Student registration flow is documented clearly.
- Registration data, validation outcomes, and post-success behavior are defined.
- Registration is aligned with session-based auth and the shared frontend model.
- Student registration is separated from later profile and privacy-detail units.
- No application code is produced in this unit.

## Out of scope

- Concrete backend or frontend implementation code
- Detailed profile onboarding beyond minimum registration fields
- Company or admin registration behavior
- Email verification implementation detail unless introduced later
