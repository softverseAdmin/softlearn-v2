# Infrastructure design: U13-6-meeting-link-validation

## Infrastructure impact

This unit does not provision new infrastructure, but it defines the baseline meeting link validation path that later implementation must support within the existing local-first, AWS-compatible direction.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for meeting-link policy refinements

## External services

- No provider API integration is required for the baseline meeting-link flow
- Zoom, Google Meet, Teams, and custom links are handled as validated URL patterns only

## Deployment impact

- Local-first development must support the protected workflow defined in this unit.
- Later AWS-compatible deployment should preserve the same authorization, privacy, audit, and deterministic behavior.
- Adjacent units must integrate with this baseline without redefining its core responsibilities.

## Database impact

- The baseline relies on protected use of **InterviewMeetingLink** and **MeetingLinkValidationResult** or equivalent records.
- Stored records should remain traceably linked to actor, workflow context, and audit history where applicable.
- The unit should not create unrelated records or schema expectations outside its narrow scope.
