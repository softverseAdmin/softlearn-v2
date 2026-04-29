# Infrastructure design: U15-4-exam-result-notifications

## Infrastructure impact

This unit does not provision new infrastructure, but it defines the baseline exam result notifications path that later implementation must support within the existing local-first, AWS-compatible direction.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional notification-mode and log-sink settings for simulated delivery

## External services

- No external messaging provider is required for the baseline notification flow
- Email behavior remains simulated or log-based unless a later approved change introduces a real delivery provider

## Deployment impact

- Local-first development must support the protected workflow defined in this unit.
- Later AWS-compatible deployment should preserve the same authorization, privacy, audit, and deterministic behavior.
- Adjacent units must integrate with this baseline without redefining its core responsibilities.

## Database impact

- The baseline relies on protected use of **Notification**, **ExamAttempt**, and **ExamResultSummary** or equivalent records.
- Stored records should remain traceably linked to actor, workflow context, and audit history where applicable.
- The unit should not create unrelated records or schema expectations outside its narrow scope.
