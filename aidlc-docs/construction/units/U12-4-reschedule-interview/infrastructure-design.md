# Infrastructure design: U12-4-reschedule-interview

## Infrastructure impact

This unit does not provision new infrastructure, but it defines the baseline reschedule interview path that later implementation must support within the existing local-first, AWS-compatible direction.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for interview-policy refinements

## External services

- None required for the baseline interview-management flow
- Calendar, conferencing, and external scheduling services remain out of scope unless a later unit explicitly allows them

## Deployment impact

- Local-first development must support the protected workflow defined in this unit.
- Later AWS-compatible deployment should preserve the same authorization, privacy, audit, and deterministic behavior.
- Adjacent units must integrate with this baseline without redefining its core responsibilities.

## Database impact

- The baseline relies on protected use of **Interview**, **InterviewSchedule**, **InterviewHistory**, and **InterviewAvailability** or equivalent records.
- Stored records should remain traceably linked to actor, workflow context, and audit history where applicable.
- The unit should not create unrelated records or schema expectations outside its narrow scope.
