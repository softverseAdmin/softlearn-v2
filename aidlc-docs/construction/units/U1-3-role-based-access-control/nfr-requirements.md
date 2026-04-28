# NFR requirements: U1-3-role-based-access-control

## Security

- Authorization must be enforced on every protected read and write.
- Deny-by-default behavior is required when a rule is missing or ambiguous.
- Role grants must not bypass ownership, organization-boundary, privacy, or consent controls.
- Admin privileges must remain scoped and reviewable rather than globally implicit.

## Privacy

- RBAC must work with privacy-aware student visibility rules rather than replacing them.
- Company users must not gain access to student profile or exam data outside approved contexts.
- Admin visibility into sensitive data should remain purposeful and audit-friendly.

## Performance

- Authorization checks should be simple and predictable enough to apply across common interactive requests.
- The RBAC model should avoid forcing excessive repeated permission branching in each feature unit.

## Reliability

- Equivalent requests in the same role and context should yield consistent authorization outcomes.
- Denied actions should use stable response behavior so frontend flows remain predictable.
- Role and scope definitions should be durable enough for reuse across later units.

## Accessibility

- Authorization failures should be representable with clear, understandable UI messages.
- The model should support frontend experiences that can explain why an action is unavailable without leaking protected data.

## Maintainability

- Roles and permission categories should remain domain-oriented and reusable.
- Later units should extend the baseline rather than redefining core role meaning.
- Authorization logic should stay separate from authentication and separate from business-feature implementation details.
