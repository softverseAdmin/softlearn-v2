# NFR design: U3-2-company-login

## How NFRs are addressed

- Security is addressed by aligning company login with the shared session-auth model, secure credential handling, and strict role separation.
- Privacy is addressed by limiting login to minimum authentication inputs and by keeping protected student or company data outside the login surface.
- Performance is addressed by requiring responsive submission and transition behavior.
- Reliability is addressed through explicit invalid-credential, invalid-input, and unexpected-failure outcomes, plus consistent session-establishment behavior after success.
- Accessibility is addressed by requiring understandable public-form structure and clear feedback states.
- Maintainability is addressed by keeping company login narrowly focused on authenticated company entry while reusing the shared frontend and auth baselines.

## Tradeoffs

- A narrow company-login baseline is easier to review and keeps Phase 3 ordered, but it means later company-experience units must complete the richer post-login employer workflows.
- Reusing the shared login API posture improves consistency, though later implementation may still need role-specific validation and UX differences.
- Immediate entry into the company experience after successful login is convenient, but it requires careful alignment with shared route and state behavior.

## Monitoring

- Later implementation should monitor failed company-login attempts, repeated invalid-credential outcomes, and login-success/auth-transition mismatches.
- Later company workflow units should confirm they build on this baseline without redefining role identity or session behavior.

## Testing approach

- Review the unit against the requirements, security, auth, API, frontend foundation, routing, state, and layout baselines.
- Check that company login remains separate from registration, company profile setup, and company user management units.
- Run `./scripts/aidlc-check.sh`.
