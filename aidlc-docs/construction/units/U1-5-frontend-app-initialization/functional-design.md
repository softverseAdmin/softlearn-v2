# Functional design: U1-5-frontend-app-initialization

## Purpose

Define the baseline frontend application initialization approach for a React + Vite web app that supports authenticated student, company, and admin workflows.

## User story

As a delivery team, we need a clear frontend foundation so later UI units can build role-aware product workflows consistently without redefining app structure, session behavior, or API integration expectations.

## Functional requirements

### 1. Frontend app foundation

- Use **React + Vite** as the recommended frontend application foundation.
- Treat the frontend as a single primary web application for students, company users, and admins.
- Keep the frontend independent from backend rendering.

### 2. Core application responsibilities

- Render authenticated product workflows for:
  - students
  - company users
  - admins
- Integrate with the backend under the versioned API contract already defined in U1-4.
- Work with Django-native session authentication rather than token-first browser auth.
- Support role-aware UI boundaries so restricted actions and screens are not exposed casually in the client.

### 3. Initialization scope

- Define the expected app shape, folder responsibility areas, environment assumptions, and integration boundaries.
- Define the baseline shell expectations for:
  - app bootstrap
  - API client setup
  - session-aware auth state
  - role-aware layout entry points
  - shared error handling and loading states

### 4. Frontend-backend interaction model

- The frontend should call backend APIs under `/api/v1/`.
- Browser requests should operate with session cookies and CSRF-aware protected writes.
- The frontend should support session restore and authenticated user bootstrap on app load.
- Unauthorized and forbidden responses should map cleanly to login, access-denied, or role-restricted UI states.

### 5. Shared UI posture

- The foundation should support later navigation, state management, and layout units without locking those details prematurely.
- Reusable patterns for loading, empty states, errors, and protected-route behavior should be anticipated at the design level.
- Role-aware experiences should remain unified inside one app rather than split into separate frontend applications at this stage.

## Inputs

- ADR-001 recommended stack
- Recommended architecture
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure

## Outputs

- Frontend initialization baseline for React + Vite
- Session-aware frontend/backend integration expectations
- Role-aware application shell direction for later UI units

## User flow

1. User loads the React application.
2. App bootstraps configuration, API client behavior, and session-aware auth state.
3. App restores authenticated identity if a valid session exists.
4. App selects the appropriate role-aware experience shell.
5. Later feature units render navigation, pages, and forms inside this shared frontend foundation.

## Acceptance criteria

- React + Vite is defined as the frontend foundation.
- Session-based browser integration with the Django backend is documented.
- Role-aware app expectations are defined for students, company users, and admins.
- Initialization scope is clearly separated from later routing, state, and layout detail.
- No application code is produced in this unit.

## Out of scope

- Concrete React source code
- Final routing tree
- Final global state library choice
- Final component library choice
- Detailed page-level UI implementation
