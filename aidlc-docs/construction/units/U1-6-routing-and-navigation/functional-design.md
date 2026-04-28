# Functional design: U1-6-routing-and-navigation

## Purpose

Define the baseline routing and navigation model for the shared React frontend so students, company users, and admins can move through authenticated workflows consistently and safely.

## User story

As a delivery team, we need a clear routing and navigation baseline so later screens can plug into a predictable app structure with role-aware access, protected routes, and coherent user movement across the product.

## Functional requirements

### 1. Routing model

- Use client-side routing inside the single React + Vite application.
- Define route groups for:
  - public routes
  - authenticated shared routes
  - student routes
  - company routes
  - admin routes
- Keep route naming readable and domain-oriented.

### 2. Public routes

- Public routes should cover at least:
  - landing or entry screen
  - login
  - signup
  - password reset initiation and completion
- Public routes must redirect authenticated users away from pages that no longer apply, such as login after successful session restore.

### 3. Protected routes

- Protected routes require an authenticated browser session.
- Role-restricted routes must apply frontend guard behavior based on the authenticated user role.
- Unauthorized users should be redirected to login or the appropriate access-denied state.
- Role-mismatched users should be redirected to an allowed home area or a clear forbidden state.

### 4. Role-aware route areas

- **Student area** should support routes for profile, learning, exams, job discovery, applications, interviews, notifications, and privacy settings.
- **Company area** should support routes for company profile, vacancies, candidate review, applications, interviews, and notifications.
- **Admin area** should support routes for later management and operational workflows without exposing them to non-admin users.

### 5. Navigation model

- Define a shared navigation structure that can present role-specific menus and destinations.
- Navigation should support:
  - top-level role-aware entry points
  - breadcrumbs or page context later where useful
  - authenticated home/dashboard entry
  - logout access
- Navigation should reflect allowed actions without acting as the only permission boundary.

### 6. Error and fallback routing

- Unknown routes should resolve to a not-found experience.
- Unauthorized, forbidden, and session-expired flows should map to distinct, understandable states.
- Route transitions should support loading and restore behavior during auth bootstrap.

### 7. Relationship to later units

- This unit defines route and navigation structure only.
- Later units may refine page trees, dashboards, menus, and domain-specific navigation details without breaking the baseline route model.

## Inputs

- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- Inception requirements baseline

## Outputs

- Baseline frontend route groups and protected-route behavior
- Role-aware navigation direction for later UI units
- Redirect and fallback rules for auth and access outcomes

## User flow

1. User loads the app and auth restore runs.
2. Router resolves whether the user is authenticated and what role applies.
3. Public, shared, or role-specific route guards decide whether the target route is allowed.
4. Navigation presents the allowed route set for the current user context.
5. Unknown, expired, or forbidden flows route to the appropriate fallback state.

## Acceptance criteria

- Public, protected, and role-specific route groups are defined.
- Route guards are aligned with session auth and RBAC.
- Role-aware navigation expectations are documented.
- Not-found, unauthorized, and forbidden routing behavior is covered.
- No application code is produced in this unit.

## Out of scope

- Concrete React router code
- Final page map for every later feature
- Final visual navigation design
- Breadcrumb implementation detail
- Page-level UI implementation
