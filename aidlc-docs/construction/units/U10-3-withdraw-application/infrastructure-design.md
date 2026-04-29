# Infrastructure design: U10-3-withdraw-application

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected student-facing transition path for moving an application into a withdrawn state with traceable history.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for withdrawal-policy refinements

## External services

- None required for the baseline withdraw-application flow
- External workflow, AI, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected student-owned withdrawal of allowed applications.
- Later AWS-compatible deployment should preserve the same ownership, lifecycle, and audit posture for withdrawal events.
- Withdrawal behavior must remain compatible with later company review, interview, and notification workflows.

## Database impact

- The baseline relies on protected updates to **Application** current status and **ApplicationStatusHistory** or equivalent transition storage.
- Withdrawal should preserve stable linkage to the existing application record rather than deleting student application history.
- The unit should not create shortlist, rejection, interview, or notification records directly.
