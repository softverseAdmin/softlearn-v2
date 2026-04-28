# Functional design: U1-2-authentication-core

## Purpose

Define the shared authentication foundation for students, company users, and admins using Django-native session-based browser authentication.

## User story

As a platform team, we need a single authentication model so protected actions, role-aware access, and later profile, exam, and hiring features all start from the same trustworthy identity flow.

## Functional requirements

### 1. Authentication model

- Use Django-native session-based authentication as the default browser auth model.
- Authentication must support students, company users, and admins through one core identity model with role-specific authorization handled separately.
- Protected actions must require an authenticated session.

### 2. Core auth capabilities

- Support account signup for supported self-service roles defined by later product rules.
- Support login with email and password.
- Support logout with session invalidation.
- Support session restore for an already-authenticated browser session.
- Support password change for authenticated users.
- Support password reset initiation and completion flows.

### 3. Session and CSRF behavior

- Login must create a server-side authenticated session.
- Logout must invalidate the current session.
- Protected write operations must be CSRF-protected for browser clients.
- Session cookies must be treated as the primary authentication credential for the web app.

### 4. Identity boundaries

- Authentication establishes identity only.
- Role-based access control and privacy-aware visibility rules are handled by later RBAC and domain units.
- Company access to student data must never be granted by authentication alone.

### 5. Audit and security events

- Login success and failure should be available for later security monitoring.
- Password reset and password change events should be traceable.
- Privileged admin authentication should be distinguishable in later audit flows.

## Inputs

- ADR-001 recommended stack
- Inception security and compliance baseline
- Recommended architecture
- U1-4 base API structure, which must align to session auth

## Outputs

- Auth foundation design for signup, login, logout, session restore, password change, and password reset
- Session and CSRF expectations for the React + Django browser architecture
- Constraints for later RBAC, profile, exam, and admin units

## User flow

1. User reaches the frontend and submits signup or login details.
2. Backend validates credentials and role eligibility.
3. Backend creates an authenticated session and returns the authenticated user summary.
4. Frontend uses the session-backed identity to call protected APIs.
5. Logout or timeout invalidates the session and removes protected access.

## Acceptance criteria

- Session-based authentication is defined as the default browser auth model.
- Signup, login, logout, session restore, password change, and password reset are covered.
- CSRF expectations for protected writes are documented.
- Authentication is clearly separated from RBAC and privacy authorization.
- No application code is produced in this unit.

## Out of scope

- Detailed RBAC policy
- Domain-specific authorization rules
- SSO, social login, and enterprise federation
- Mobile-specific token auth
- Concrete Django implementation code
