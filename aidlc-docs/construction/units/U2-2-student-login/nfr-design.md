# NFR design: U2-2-student-login

## How NFRs are addressed

- Security is addressed by aligning the login flow with the shared auth baseline, browser session establishment, and stable error behavior.
- Privacy is addressed by limiting login to credential entry and minimum session-establishment context rather than broader student data handling.
- Performance is addressed by keeping the login step narrow and reusing existing auth/session restore patterns instead of duplicating new session logic.
- Reliability is addressed through explicit outcomes for success, invalid credentials, validation failure, and unexpected backend errors.
- Accessibility is addressed by requiring understandable form feedback and predictable post-login transitions.
- Maintainability is addressed by reusing the existing auth, routing, state, and layout baselines instead of inventing a separate login architecture.

## Tradeoffs

- A minimal login flow is easier to reason about and safer to maintain, but richer security steps such as MFA are intentionally deferred.
- Immediate entry into the student experience after successful login is convenient, but it requires careful coordination with shared route and state behavior.
- Keeping company and admin login specialization out of this unit keeps the scope narrow, though it defers multi-role UX detail to later work.

## Monitoring

- Later implementation should monitor login success/failure rates, repeated invalid-credential attempts, and auth restore problems after login.
- Later auth and frontend units should confirm that login outcomes still map cleanly into session restore, protected routing, and student-shell behavior.
- Any future change that adds MFA, verification gates, or alternative login methods should be reviewed as an explicit extension of this baseline.

## Testing approach

- Review the unit against auth, API, frontend foundation, routing, state, layout, and student-registration baselines.
- Check that student login fields and post-success session behavior are both covered.
- Check that the unit stays separate from password reset and later student-profile workflows.
- Run `./scripts/aidlc-check.sh`.
