# NFR design: U3-1-company-registration

## How NFRs are addressed

- Security is addressed by aligning company registration with the shared session-auth model, secure credential handling, and strict role separation.
- Privacy is addressed by limiting registration to minimum initial company-account data.
- Performance is addressed by requiring responsive submission and transition behavior.
- Reliability is addressed through explicit duplicate-email, invalid-input, and unexpected-failure outcomes, plus consistent session-establishment behavior after success.
- Accessibility is addressed by requiring understandable public-form structure and clear feedback states.
- Maintainability is addressed by keeping company registration narrowly focused on initial company account creation while reusing the shared frontend and auth baselines.

## Tradeoffs

- A narrow company-registration baseline is easier to review and keeps Phase 3 ordered, but it means later company-profile units must complete the richer employer setup flow.
- Reusing the shared registration API posture improves consistency, though later implementation may still need role-specific validation and UX differences.
- Immediate session establishment after company registration is convenient, but it requires careful alignment with shared route and state behavior.

## Monitoring

- Later implementation should monitor failed company-registration attempts, repeated duplicate-email outcomes, and registration-success/auth-transition mismatches.
- Later company onboarding units should confirm they build on this baseline without redefining role identity or session behavior.

## Testing approach

- Review the unit against the requirements, security, auth, RBAC, API, frontend foundation, routing, state, and layout baselines.
- Check that company registration remains separate from login, company profile setup, and company user management units.
- Run `./scripts/aidlc-check.sh`.
