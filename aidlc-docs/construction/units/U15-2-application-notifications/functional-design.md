# Functional design: U15-2-application-notifications

## Purpose

Define the baseline application-notifications flow so important application lifecycle events create deterministic user notifications through the shared notification core.

## User story

As a student and as a company user, I need application notifications so I can track important application changes without polling every application detail view.

## Functional requirements

### 1. Application-notifications scope

- This unit covers application notifications only.
- The baseline should support:
  - mapping approved application lifecycle events into notifications
  - supporting student and company recipient routing where policy allows it
  - preserving summary-safe notification content for application events
  - returning stable outcomes when an application event should not produce a notification
- interview notifications, email delivery detail, push-delivery channels, marketing notifications, and custom user rules beyond approved preferences remain separate later units.

### 2. Authorization and visibility behavior

- Application notifications must only be delivered to authorized student or company recipients for the relevant application context.
- Notification content must not reveal protected candidate or company data beyond what the recipient is already allowed to see.
- Application notifications must respect visibility, consent, and company-boundary rules.
- Notification creation and delivery attempts should remain auditable.

### 3. Application-notification behavior

- The baseline should support event-driven notifications for meaningful application lifecycle changes such as submission, shortlist progression, rejection, or withdrawal where policy allows them.
- Notification content should remain summary-oriented and direct users back to protected application views for detailed information.
- Repeated or duplicate lifecycle events should not create uncontrolled notification spam.
- This unit should not redefine the shared application status model or notification core.

### 4. Frontend and API alignment

- The capability should integrate with the shared `/api/v1/` baseline, session-aware protected operations, and standard event-trigger envelopes.
- Notification orchestration should stay backend-driven and auditable rather than relying on ad hoc client-only state.
- User-facing notification views should stay aligned with protected role routes and the shared app-shell baseline where applicable.
- Delivery behavior should remain deterministic and explainable, especially while email remains simulated or log-based.

### 5. Relationship to later units

- U10 application lifecycle units provide the core events consumed here.
- U15-1 notification core defines the shared notification record and delivery posture used here.
- U15-5 email notification service may later send selected application notifications as simulated email without changing trigger rules.
- Later dashboard units may surface application-notification counts without redefining application-notification semantics.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-1 apply-to-job
- U10-2 application-status-tracking
- U10-3 withdraw-application
- U10-5 shortlist-candidates
- U10-6 reject-candidates
- U15-1 notification-core

## Outputs

- Baseline application-notification flow
- Recipient-routing and summary-content expectations
- Integration expectations for email delivery and dashboard aggregation

## User flow

1. An approved application lifecycle event occurs.
2. Backend evaluates the event against application-notification trigger rules and recipient eligibility.
3. The platform creates notification-core records with summary-safe application content.
4. Authorized recipients receive the notification through protected notification views or channels.
5. Later email and dashboard features reuse the same application-notification posture.

## Acceptance criteria

- Application notifications behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Interview-specific notifications, and Push-delivery channels.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Interview-specific notifications
- Push-delivery channels
- Marketing notifications
- Custom delivery providers
