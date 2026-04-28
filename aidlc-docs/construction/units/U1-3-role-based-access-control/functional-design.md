# Functional design: U1-3-role-based-access-control

## Purpose

Define the baseline role-based access control model that decides which authenticated users may perform which protected actions across student, company, and admin workflows.

## User story

As a platform team, we need a consistent authorization model so protected reads and writes are enforced predictably across profiles, learning, exams, vacancies, matching, applications, interviews, notifications, and admin operations.

## Functional requirements

### 1. RBAC model

- Authorization begins only after authentication establishes identity.
- Every protected action must evaluate role, context, ownership or organization boundary, and any privacy or consent rules that apply.
- Default behavior must be deny-by-default unless an allow rule is defined.

### 2. Baseline platform roles

- **Student**
  - access own profile, privacy settings, learning records, exam history, matches, applications, interviews, and notifications
  - cannot access another student’s protected data
  - cannot perform company-only or admin-only actions
- **Company user**
  - access own company profile, vacancies, candidate-review workflow, company-side applications, interviews, and notifications
  - access student data only when allowed by privacy, consent, and workflow context
  - cannot access another company’s private records
- **Admin**
  - access privileged operational and management capabilities
  - privileged access remains scoped, reviewable, and audit-oriented
  - admin access to sensitive student or company data must still be purposeful and policy-bound

### 3. Organization and ownership rules

- Student actions should be limited to the authenticated student’s own records unless a later policy explicitly allows otherwise.
- Company users must be bound to a company membership context.
- Company actions should be restricted to records owned by that same company context.
- Admin actions should be role-scoped rather than globally unrestricted.

### 4. Permission categories

- **Self-service permissions** for a user’s own account and personal workflow records
- **Company management permissions** for company profile, vacancies, candidate review, and interviews
- **Privileged admin permissions** for platform management and controlled oversight
- **Policy-gated permissions** for privacy-sensitive student visibility, exam-result visibility, consent overrides, and audit review

### 5. Authorization decision order

1. Confirm the request is authenticated.
2. Identify the actor’s platform role and organization context if applicable.
3. Check whether the action is role-allowed.
4. Check ownership, company boundary, or admin scope requirements.
5. Apply privacy, consent, and visibility policy where needed.
6. Return allow or deny with a stable error outcome.

### 6. Relationship to later units

- This unit defines the RBAC baseline only.
- Student privacy settings and company visibility rules are refined further in later privacy and consent units.
- Domain units must reuse this model instead of inventing separate permission rules.

## Inputs

- U1-2 authentication core
- Inception security and compliance baseline
- Recommended architecture
- Inception requirements baseline

## Outputs

- Baseline RBAC model for platform roles and protected actions
- Ownership and company-boundary rules for later domain units
- Authorization decision order that later APIs and implementations must follow

## User flow

1. Authenticated user makes a protected request.
2. Backend resolves the actor’s platform role and relevant ownership or organization context.
3. Backend checks whether the requested action is allowed for that role.
4. Backend applies policy-specific visibility or consent checks if sensitive data is involved.
5. Backend allows the action or returns a stable authorization failure.

## Acceptance criteria

- Student, company user, and admin roles are defined clearly.
- Role checks are separated from authentication and from privacy-policy evaluation.
- Ownership, company boundary, and admin-scope rules are documented.
- Authorization decision order is explicit and reusable.
- No application code is produced in this unit.

## Out of scope

- Detailed privacy-setting rules for each domain object
- Fine-grained per-field visibility matrices
- Framework-specific permission classes or middleware code
- Enterprise IAM or cloud IAM integration
- Concrete implementation code
