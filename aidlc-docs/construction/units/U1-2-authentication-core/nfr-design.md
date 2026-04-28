# NFR design: U1-2-authentication-core

## How NFRs are addressed

- Security is addressed by choosing server-managed session auth, explicit logout and invalidation behavior, CSRF protection for authenticated writes, and a clear separation between authentication and authorization.
- Privacy is addressed by minimizing auth response payloads and avoiding unnecessary exposure of user or account state.
- Performance is addressed by using session-backed browser auth instead of forcing token refresh behavior for every user flow.
- Reliability is addressed through explicit lifecycle rules for login, logout, restore, reset, and repeated auth actions.
- Accessibility is addressed by requiring stable, understandable outcomes that UI layers can present clearly.
- Maintainability is addressed by keeping the auth core focused on identity establishment while later units own RBAC and visibility rules.

## Tradeoffs

- Session-based auth is a better fit than JWT for the current browser-first, local-first architecture, but it requires deliberate CSRF handling and shared frontend/backend origin expectations.
- Keeping auth core narrow reduces early complexity, but some enterprise and federation scenarios are intentionally deferred.
- Hosted identity remains possible later, but choosing it now would add cost and integration complexity before the product needs it.

## Monitoring

- Later implementation should log login success/failure, logout, password reset initiation/completion, and privileged admin auth events.
- Later security and admin units should confirm session handling, CSRF behavior, and auditability remain aligned with the baseline.
- Auth-related changes after this baseline should be reviewed carefully because they affect all protected workflows.

## Testing approach

- Review the design against ADR-001, architecture, and security baseline documents.
- Check that signup, login, logout, session restore, password change, and password reset are all covered.
- Check that auth does not claim to solve RBAC or privacy authorization by itself.
- Confirm the design matches browser session auth rather than JWT-first auth.
- Run `./scripts/aidlc-check.sh`.
