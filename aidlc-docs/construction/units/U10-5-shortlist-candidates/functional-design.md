# Functional design: U10-5-shortlist-candidates

## Purpose

Define the baseline shortlist-candidates flow so authorized company users can promote an eligible application or candidate-review context into shortlist state with traceable workflow evidence.

## User story

As an authorized company user, I need to shortlist a candidate from an application context so I can mark them for deeper review without losing auditability of the hiring workflow.

## Functional requirements

### 1. Shortlist-candidates scope

- This unit covers the company-side shortlist action only.
- The baseline should support:
  - loading one authorized application or candidate-review context
  - validating that shortlist is currently allowed
  - creating or updating shortlist state
  - recording any corresponding application status transition and audit history
- Broader shortlist-list presentation, candidate notes, rejection, interviews, and notifications remain separate later units.

### 2. Authorization and ownership behavior

- Only authorized company users may shortlist candidates for their own company’s vacancies.
- Company users must not shortlist candidates for another company’s vacancy or outside approved review contexts.
- Shortlist action must build on an already authorized application-review surface and reuse company-boundary rules.
- Student-owned and company-visible data boundaries must remain protected during the action.

### 3. Shortlist action behavior

- The baseline should support creating a **ShortlistEntry** or equivalent shortlist-state record tied to the application or candidate context.
- Where the shared lifecycle model requires it, shortlisting should update the application status to **shortlisted** and create corresponding **ApplicationStatusHistory** evidence.
- Repeated shortlist actions against an already-shortlisted target should not create uncontrolled duplicate shortlist state.
- Validation failures such as unauthorized context, invalid application state, withdrawn application, or duplicate shortlist request must return stable outcomes.

### 4. Workflow posture

- Shortlisting should represent a company-side progression signal, not a final hiring decision.
- The action should remain explainable and auditable to later reviewers.
- Shortlisting must not automatically create interviews, offers, or notifications within this unit.
- The baseline should keep shortlist action distinct from later shortlist browsing and note-management experiences.

### 5. Relationship to later units

- U10-4 company view applications should surface the contexts from which shortlist actions are launched.
- U10-6 reject candidates should remain a separate terminal or adverse action and must not be merged into shortlist behavior.
- U11-4 candidate shortlist should own later shortlist-view presentation and management on top of shortlist state created here.
- Later interview and notification units may consume shortlist events, but they must not redefine shortlist authorization or lifecycle rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-2 application status tracking
- U10-4 company view applications

## Outputs

- Baseline company-side shortlist action flow
- Shortlist-entry and lifecycle expectations
- Integration expectations for later shortlist-view, interview, and notification units

## User flow

1. An authorized company user reviews an application in an approved company context.
2. Backend verifies company ownership and current application state.
3. The platform determines whether shortlist is currently allowed.
4. If allowed, the platform creates shortlist state and any required application-status transition evidence.
5. The company user receives a stable shortlist outcome for later shortlist management and candidate review.

## Acceptance criteria

- Shortlist-candidates behavior is documented clearly.
- Authorization, duplicate-prevention, and lifecycle boundaries are defined.
- The unit stays separate from shortlist-view presentation, rejection, and interview workflows.
- Shared lifecycle behavior is reused rather than redefined.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- General application review and shortlist-list presentation
- Rejection, interview, and notification actions
- Candidate note-taking
- Automated hiring decisions
