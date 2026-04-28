# Functional design: U3-5-company-hiring-preferences

## Purpose

Define the baseline company hiring-preferences flow so an authenticated company user can manage organization-level hiring defaults that guide later vacancy and candidate-review workflows.

## User story

As an authenticated company user, I need to manage company hiring preferences so the platform can represent the organization’s default hiring direction consistently across later vacancy and candidate-review workflows.

## Functional requirements

### 1. Hiring-preferences scope

- This unit covers company-owned hiring-preference records attached to the authenticated company context.
- The baseline should support the core hiring-preference actions:
  - view current hiring preferences
  - add or set hiring preferences
  - update hiring preferences
  - clear or replace hiring preferences where product rules allow
- Hiring preferences should remain separate from basic company identity, narrative description, vacancy-specific requirements, and company membership behavior.

### 2. Structured hiring-preference records

- The hiring-preference model should support structured organization-level defaults rather than only unbounded free-text notes.
- The baseline may include company-level preference areas such as:
  - target roles or hiring focus
  - default language expectations
  - default location or work-style preferences
  - default experience or readiness direction
- Vacancy-specific required skills, language levels, and other requisition details remain separate later vacancy units.

### 3. Read and update behavior

- Authenticated company users must be able to view their own hiring preferences.
- Authenticated company users must be able to add, set, update, and clear hiring preferences in their own company context.
- Validation failures such as malformed preference values, unsupported combinations, or unauthorized updates must return stable, user-presentable outcomes.
- Successful updates should reflect predictably in the company experience and later vacancy-setup or candidate-review-adjacent workflows.

### 4. Ownership and authorization

- Only authenticated users bound to the same company context may manage that company’s hiring preferences through this self-service flow.
- Company users must not access or modify another company’s private preference data.
- Hiring-preference access must remain consistent with the RBAC baseline and company-boundary rules.

### 5. Frontend behavior

- The company hiring-preferences screen or subsection belongs inside the authenticated company route area and shared layout shell.
- Most editable preference state should remain local to the feature rather than promoted to global state unless later reuse justifies it.
- Loading, empty, success, and validation-error states should be represented clearly.

### 6. Relationship to later units

- This unit defines company-level hiring defaults only.
- Vacancy creation, vacancy skill/language requirements, candidate-review logic, and company user management remain separate units.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-3 role-based access control
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U3-3 company profile basic
- U3-4 company profile description

## Outputs

- Baseline company hiring-preferences flow
- Structured hiring-preference ownership and validation expectations
- Integration expectations for later vacancy and candidate-review workflows

## User flow

1. Authenticated company user enters the hiring-preferences area.
2. Frontend loads the company’s current hiring-preference state.
3. User adds, updates, or clears the allowed preference fields.
4. Backend validates the change against company ownership and structured preference rules.
5. Frontend reflects the updated preference state and any validation or error outcomes clearly.

## Acceptance criteria

- Company hiring-preferences behavior is documented clearly.
- Structured preference scope and validation outcomes are defined.
- Company-boundary and protected-route behavior are aligned with session auth and RBAC.
- Company-level defaults are separated from vacancy-specific requirement units.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy-specific requirements and requisition publishing
- Candidate scoring or matching-calculation logic
- Company membership behavior
