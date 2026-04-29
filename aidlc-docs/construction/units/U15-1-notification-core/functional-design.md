# Functional design: U15-1-notification-core

## Purpose

Define the baseline notification-core flow so the platform has one deterministic event-driven notification model for later application, interview, and exam-result notifications.

## User story

As the platform and as end users, I need a stable notification core so important events can produce traceable notifications consistently across the product.

## Functional requirements

### 1. Notification-core scope

- This unit covers notification core only.
- The baseline should support:
  - defining the core notification record and event-trigger posture
  - storing notification type, target user, delivery channel, and read-state metadata
  - supporting deterministic event-to-notification mapping for later domain-specific units
  - returning stable outcomes when a notification event is invalid, duplicated, or suppressed by policy
- application-specific notification rules, interview-specific notification rules, email delivery detail, push-notification delivery, and external messaging providers remain separate later units.

### 2. Authorization and visibility behavior

- Only authorized users may view notifications addressed to them.
- Notification generation must respect role boundaries, consent posture, and hidden-data rules.
- Notification content must not leak protected data in a way that bypasses existing visibility rules.
- Notification creation and read-state changes should remain auditable.

### 3. Notification-core behavior

- The baseline should support a shared notification model with deterministic event-driven creation rules.
- Each notification should preserve type, recipient, payload summary, delivery state, and read-state metadata in a stable format.
- Notification content should remain summary-oriented and must not replace secure domain views for protected data.
- This unit must not lock the platform into any external delivery provider.

### 4. Frontend and API alignment

- The capability should integrate with the shared `/api/v1/` baseline, session-aware protected operations, and standard event-trigger envelopes.
- Notification orchestration should stay backend-driven and auditable rather than relying on ad hoc client-only state.
- User-facing notification views should stay aligned with protected role routes and the shared app-shell baseline where applicable.
- Delivery behavior should remain deterministic and explainable, especially while email remains simulated or log-based.

### 5. Relationship to later units

- U15-2 through U15-4 define the domain-specific events that should map into this core notification model.
- U15-5 email notification service uses this core model for simulated email channel behavior.
- Later dashboard units may show notification counts without redefining notification semantics.
- Privacy and permission units must continue to constrain what notification content may reveal.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U10-2 application status tracking
- U12-6 interview-status-tracking
- U6-2 student exam results summary

## Outputs

- Baseline notification-core model
- Event-driven notification record expectations
- Integration expectations for application, interview, exam-result, and email units

## User flow

1. A valid platform event occurs in an approved product workflow.
2. Backend maps the event to the shared notification model and checks recipient and visibility rules.
3. The platform records the notification with stable metadata and delivery state.
4. The target user retrieves the notification through protected user-specific views or channels.
5. Later domain-specific notification units reuse the same core notification posture.

## Acceptance criteria

- Notification core behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Domain-specific trigger definitions, and Push-notification delivery.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Domain-specific trigger definitions
- Push-notification delivery
- External messaging providers
- Heavy analytics
