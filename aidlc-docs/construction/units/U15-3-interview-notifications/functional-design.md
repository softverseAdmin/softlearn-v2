# Functional design: U15-3-interview-notifications

## Purpose

Define the baseline interview-notifications flow so important interview lifecycle events create deterministic notifications through the shared notification core.

## User story

As a student and as a company user, I need interview notifications so I can track interview requests, schedule changes, and cancellations in a consistent way.

## Functional requirements

### 1. Interview-notifications scope

- This unit covers interview notifications only.
- The baseline should support:
  - mapping approved interview lifecycle events into notifications
  - routing notifications to the student and company participants of the interview where policy allows it
  - preserving summary-safe notification content for interview events
  - returning stable outcomes when an interview event should not produce a notification
- email delivery detail, push-delivery channels, calendar invite integration, marketing notifications, and custom reminder engines remain separate later units.

### 2. Authorization and visibility behavior

- Interview notifications must only be delivered to authorized interview participants.
- Notification content must not reveal protected interview details or meeting links beyond what the recipient may access.
- Interview notifications must respect company-boundary, privacy, and meeting-link protection rules.
- Notification creation and delivery attempts should remain auditable.

### 3. Interview-notification behavior

- The baseline should support event-driven notifications for meaningful interview events such as request, confirmation, reschedule, and cancellation where policy allows them.
- Notification content should remain summary-oriented and direct users back to protected interview views for details.
- Meeting-link details should only be included when already validated and permitted for the recipient.
- This unit should not redefine interview status tracking or meeting-link validation rules.

### 4. Frontend and API alignment

- The capability should integrate with the shared `/api/v1/` baseline, session-aware protected operations, and standard event-trigger envelopes.
- Notification orchestration should stay backend-driven and auditable rather than relying on ad hoc client-only state.
- User-facing notification views should stay aligned with protected role routes and the shared app-shell baseline where applicable.
- Delivery behavior should remain deterministic and explainable, especially while email remains simulated or log-based.

### 5. Relationship to later units

- U12 interview lifecycle units provide the core events consumed here.
- U13 meeting-link units determine when link data is safe to reference in interview notifications.
- U15-1 notification core defines the shared notification record and delivery posture used here.
- U15-5 email notification service may later send selected interview notifications as simulated email without changing trigger rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U12-1 interview-request
- U12-3 interview-schedule-confirmation
- U12-4 reschedule-interview
- U12-5 cancel-interview
- U12-6 interview-status-tracking
- U13-6 meeting-link-validation
- U15-1 notification-core

## Outputs

- Baseline interview-notification flow
- Participant-routing and summary-content expectations
- Integration expectations for email delivery and meeting-link-safe notifications

## User flow

1. An approved interview lifecycle event occurs.
2. Backend evaluates the event against interview-notification trigger rules and participant eligibility.
3. The platform creates notification-core records with summary-safe interview content.
4. Authorized participants receive the notification through protected notification views or channels.
5. Later email and reminder features reuse the same interview-notification posture.

## Acceptance criteria

- Interview notifications behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Push-delivery channels, and Calendar invite integration.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Push-delivery channels
- Calendar invite integration
- Marketing notifications
- Custom reminder engines
