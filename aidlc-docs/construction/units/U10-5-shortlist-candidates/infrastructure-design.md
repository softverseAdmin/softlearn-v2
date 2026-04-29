# Infrastructure design: U10-5-shortlist-candidates

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected company-facing action path for creating shortlist state and related lifecycle evidence.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for shortlist-policy refinements

## External services

- None required for the baseline shortlist-candidates flow
- External AI, workflow, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected company-side shortlist actions for authorized application contexts.
- Later AWS-compatible deployment should preserve the same company-boundary, lifecycle, and audit posture for shortlist events.
- Shortlist behavior must remain compatible with later shortlist-view, interview, and notification workflows.

## Database impact

- The baseline relies on protected creation or update of **ShortlistEntry**, plus **Application** and **ApplicationStatusHistory** updates or equivalent lifecycle storage where needed.
- Shortlist state should remain traceably linked to its application or candidate-review context.
- The unit should not create interview, offer, or notification records directly.
