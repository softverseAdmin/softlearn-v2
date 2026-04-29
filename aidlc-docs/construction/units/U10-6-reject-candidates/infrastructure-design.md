# Infrastructure design: U10-6-reject-candidates

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected company-facing action path for moving an application into a rejected state with traceable history.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for rejection-policy refinements

## External services

- None required for the baseline reject-candidates flow
- External AI, workflow, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected company-side rejection actions for authorized application contexts.
- Later AWS-compatible deployment should preserve the same company-boundary, lifecycle, and audit posture for rejection events.
- Rejection behavior must remain compatible with later notification, interview, and candidate-review workflows.

## Database impact

- The baseline relies on protected updates to **Application** current status and **ApplicationStatusHistory** or equivalent transition storage.
- Rejection should preserve stable linkage to the existing application record rather than deleting historical candidate-review evidence.
- The unit should not create notification, interview, or offer records directly.
