# NFR requirements: U11-5-candidate-notes

## Security

- Candidate notes must require authenticated, authorized, and role-appropriate handling.
- Sensitive records, transitions, or summaries must remain auditable and protected against unauthorized access.

## Privacy

- Candidate notes must not expose student, company, or admin data beyond approved boundaries.
- Visibility outcomes must remain consent-aware or policy-bound wherever protected data is involved.

## Performance

- Candidate notes should complete responsively enough for the associated workflow.
- The design should avoid unnecessary duplicate processing, unstable aggregation, or overly heavy queries.

## Reliability

- The same valid request should produce the same stable outcome.
- Invalid state, missing dependencies, or conflicting updates must return stable results rather than ambiguous behavior.

## Accessibility

- Later user-facing candidate notes states should be representable clearly in protected browser workflows.

## Maintainability

- The unit should build on shared authorization, API, and domain baselines.
- The unit should stay focused on candidate notes rather than absorbing adjacent workflows.
