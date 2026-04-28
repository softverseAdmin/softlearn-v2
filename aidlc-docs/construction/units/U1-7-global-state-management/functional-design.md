# Functional design: U1-7-global-state-management

## Purpose

Define the baseline global state management model for the shared React frontend so session-aware, role-aware, and cross-page application state is handled consistently.

## User story

As a delivery team, we need a clear state-management baseline so later frontend units can share auth, user context, navigation context, loading, and domain-level UI state without duplicating logic or creating inconsistent app behavior.

## Functional requirements

### 1. State-management scope

- Define which frontend data belongs in shared global state versus local page or component state.
- Keep the global state model focused on cross-route, cross-feature, or session-scoped concerns.
- Avoid turning all UI state into one large shared store.

### 2. Baseline global state categories

- **Auth/session state**
  - authenticated or anonymous status
  - current user summary
  - current role context
  - auth bootstrap and restore status
- **App shell state**
  - active role-aware navigation context
  - global loading/error states where shared behavior is needed
  - layout-level notifications or banners later
- **Reusable workflow state**
  - filters, pagination, and shared query state only when reused across multiple screens
  - domain-level state should remain close to its owning feature unless multiple routes truly need it

### 3. State ownership rules

- Session and current-user context belong in shared state.
- Route-specific form state should remain local unless there is a strong cross-route need.
- Server-owned business data should prefer backend fetch and cache patterns rather than permanent manual duplication in client state.
- Role permissions and route guard decisions may consume shared auth context but should still respect backend-authoritative results.

### 4. Integration with routing and auth

- App bootstrap should initialize auth/session state before protected route behavior is finalized.
- Shared state must support session restore, logout, and auth failure transitions.
- Route guards and role-aware navigation should consume shared auth and user context rather than each implementing their own session logic.

### 5. Error and loading posture

- Shared state should support consistent handling for app bootstrap, auth restore, and major cross-app async states.
- Error handling should allow global UI responses when the whole app is affected, while leaving page-specific errors local where appropriate.

### 6. Relationship to later units

- This unit defines the state-management baseline only.
- Later units may choose the exact implementation shape, hooks, context boundaries, and server-state patterns, as long as they stay aligned with this ownership model.

## Inputs

- U1-2 authentication core
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation

## Outputs

- Baseline ownership model for global versus local frontend state
- Shared state expectations for auth/session, user context, and app shell behavior
- Guidance for later frontend units to avoid inconsistent state patterns

## User flow

1. App bootstraps and initializes shared auth/session state.
2. Router and navigation consume the shared user and role context.
3. Shared app-shell state supports cross-route loading, error, and role-aware behavior.
4. Feature units keep local state local unless a cross-feature need justifies promotion into shared state.

## Acceptance criteria

- Shared global state categories are defined clearly.
- Global versus local state ownership is documented.
- Auth/session, routing, and navigation dependencies are aligned.
- The design avoids over-centralizing all frontend state.
- No application code is produced in this unit.

## Out of scope

- Concrete state-library implementation code
- Final state library selection mechanics beyond the documented direction
- Feature-specific data models for all later domains
- Final caching strategy for every API response
