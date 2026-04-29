# NFR requirements: U14-1-exam-category

## Security

- Exam category must require authenticated, authorized, and role-appropriate handling.
- Sensitive records, transitions, or summaries must remain auditable and protected against unauthorized access.

## Privacy

- Exam category must not expose student, company, or admin data beyond approved boundaries.
- Visibility outcomes must remain consent-aware or policy-bound wherever protected data is involved.

## Performance

- Exam category should complete responsively enough for the associated workflow.
- The design should avoid unnecessary duplicate processing, unstable aggregation, or overly heavy queries.

## Reliability

- The same valid request should produce the same stable outcome.
- Invalid state, missing dependencies, or conflicting updates must return stable results rather than ambiguous behavior.

## Accessibility

- Later user-facing exam category states should be representable clearly in protected browser workflows.

## Maintainability

- The unit should build on shared authorization, API, and domain baselines.
- The unit should stay focused on exam category rather than absorbing adjacent workflows.
