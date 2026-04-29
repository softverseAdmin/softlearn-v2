# NFR requirements: U10-5-shortlist-candidates

## Security

- Shortlist actions must require authenticated authorized company access tied to company-owned vacancy context.
- Shortlist transitions and records must be created in a protected, auditable context.

## Privacy

- Shortlisting must not expose student data beyond approved company-visible boundaries.
- Shortlist outcomes must remain within authorized company review contexts.

## Performance

- Shortlist handling should complete responsively enough for recruiter review workflows.
- Repeated shortlist attempts should not create unstable duplicate state.

## Reliability

- The same valid shortlist request should produce the same shortlist-state outcome.
- Conflicting shortlist records and missing status-history updates should be prevented.

## Accessibility

- Later company-facing shortlist outcomes and already-shortlisted states should be representable clearly.

## Maintainability

- The unit should build on shared authorization, application lifecycle, and shortlist-domain baselines.
- The unit should stay focused on the shortlist action rather than absorbing shortlist-view management.
