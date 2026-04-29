# NFR requirements: U10-6-reject-candidates

## Security

- Rejection actions must require authenticated authorized company access tied to company-owned vacancy context.
- Rejection transitions and history entries must be created in a protected, auditable context.

## Privacy

- Rejection must not expose student data beyond approved company-visible boundaries.
- Rejection outcomes must remain within authorized company review and student-owned visibility contexts.

## Performance

- Rejection handling should complete responsively enough for recruiter review workflows.
- Repeated rejection attempts should not create unstable terminal-state behavior.

## Reliability

- The same valid rejection request should produce the same terminal-state outcome.
- Conflicting rejection transitions and missing status-history evidence should be prevented.

## Accessibility

- Later company- and student-facing rejection outcomes should be representable clearly, including terminal-state and blocked-action conditions.

## Maintainability

- The unit should build on shared authorization, application lifecycle, and audit baselines.
- The unit should stay focused on the rejection action rather than absorbing communication or interview logic.
