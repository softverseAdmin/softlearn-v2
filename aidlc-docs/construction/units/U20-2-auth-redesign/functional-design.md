# Functional design: U20-2-auth-redesign

## Purpose

Redesign the login and signup experience into a modern SaaS entry flow that clearly explains Softlearn's roadmap-based learning and hiring value while keeping authentication actions simple and role-aware.

## User story

As a student or company user, I need an auth experience that quickly explains the product, helps me choose the right account path, and lets me sign in or create an account without confusion.

## Functional requirements

### 1. Scope

- This unit covers public login and signup only.
- The redesign must include:
  - responsive two-column login on desktop
  - responsive role-first signup
  - student and company signup variations
  - mobile-friendly single-column behavior
- Existing session-auth backend behavior must remain unchanged.

### 2. Login behavior

- Login must present:
  - brand/value panel on desktop
  - email field
  - password field
  - remember-me control
  - forgot-password affordance
  - primary login CTA
  - link to signup
- The page should explain that the user is continuing into a student, company, or admin workspace.

### 3. Signup behavior

- Signup must present role selection before the rest of the form.
- Student signup must collect:
  - name
  - email
  - password
- Company signup must collect:
  - company name
  - contact name
  - email
  - password
- The frontend may map contact name to the existing backend `name` field.

### 4. UI structure

- Expected structure:
  - desktop left value panel
  - desktop right auth form card
  - mobile single-column form-first layout
- The left panel should communicate the learning -> assessment -> hiring pipeline and reduce ambiguity about product value.

### 5. Component hierarchy

- Expected component hierarchy:
  - `PublicLayout`
    - `LoginPage`
      - `AuthShell`
    - `SignupPage`
      - `AuthShell`

### 6. State flow

- Login state should handle:
  - field input
  - submitting
  - error
  - redirect after successful session creation
- Signup state should additionally handle:
  - selected role
  - company-only fields

### 7. API mapping

- Login continues to map to the current auth login endpoint.
- Signup continues to map to the current auth signup endpoint.
- No auth API contract changes are required in this unit.

## Inputs

- CHG-002 redesign decision
- U1-2 authentication core
- U1-6 routing and navigation
- U1-8 base UI layout
- Existing public auth frontend pages

## Outputs

- Redesigned login page
- Redesigned signup page
- Shared auth-shell component structure
- Responsive public auth UX

## User flow

1. A user opens login or signup.
2. The page explains the product and role path clearly.
3. The user enters credentials or selects a signup role.
4. The existing backend auth flow creates or restores a session.
5. The user is redirected into the correct role workspace.

## Acceptance criteria

- The auth pages feel modern and product-oriented.
- The UI is minimal and mobile-friendly.
- Signup is clearly role-based.
- The design stays aligned with the current session-auth implementation.

## Out of scope

- Password reset backend implementation
- Social auth
- Premium purchase flow
- Protected dashboard redesigns outside auth
