# NFR requirements: U1-4-base-api-structure

## Security

- Protected endpoints must require authenticated session-based browser access.
- API contracts must make authorization boundaries explicit between student and company roles.
- Error responses must avoid leaking sensitive internal implementation details.
- Interview and matching APIs must only expose data the caller is allowed to see.

## Privacy

- Student data access must remain permission-aware and role-aware.
- Matching responses must only include explanations and profile-derived data allowed by visibility rules.
- API contracts should avoid exposing hidden or inferred personal attributes.

## Performance

- The API design should support common list and detail operations efficiently.
- Matching and jobs endpoints should support ranking and filtering without requiring opaque server behavior.
- Response shapes should remain predictable and not over-fetch unrelated data by default.

## Reliability

- Response envelopes and error formats should remain consistent across domains.
- Core APIs should be deterministic enough for frontend integration and automated tests.
- Action endpoints such as exam attempts, applications, and interviews should return stable status values.

## Accessibility

- API explanation fields and error messages should be simple enough to support clear UI presentation.
- Contracts should support building understandable user experiences for students and company users.

## Maintainability

- Route naming should remain domain-oriented and predictable.
- Versioning under `/api/v1/` should allow future change without breaking all clients.
- The base contract should be reusable across later implementation units.
