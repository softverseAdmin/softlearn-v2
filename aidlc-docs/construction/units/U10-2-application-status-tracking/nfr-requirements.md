# NFR requirements: U10-2-application-status-tracking

## Security

- Application status tracking must run in a protected, auditable context.
- Unauthorized users must not access or alter application state or history.

## Privacy

- Status visibility must respect student ownership and company-boundary access rules.
- Status history must not leak protected candidate or company information outside approved contexts.

## Performance

- Current-status retrieval and history access should complete responsively enough for application-review workflows.
- Status updates should avoid unstable race-like outcomes that leave lifecycle state ambiguous.

## Reliability

- The same application state should produce the same current-status result and ordered history.
- Conflicting current statuses and missing transition history should be prevented.

## Accessibility

- Later user-facing status labels and history timelines should be representable clearly and consistently across roles.

## Maintainability

- The unit should build on shared authorization, audit, and application-domain baselines.
- The unit should stay focused on lifecycle tracking rather than absorbing action-specific workflow logic.
