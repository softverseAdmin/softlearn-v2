# NFR design: U1-5-frontend-app-initialization

## How NFRs are addressed

- Security is addressed by aligning the frontend with session-based browser auth, CSRF-aware writes, and clear handling of unauthorized and forbidden states.
- Privacy is addressed by designing the frontend as a role-aware consumer of backend-authorized data rather than a place where visibility rules are invented.
- Performance is addressed by keeping initialization lightweight and by anticipating shared bootstrap and API-client behavior instead of repeated feature-specific setup.
- Reliability is addressed through a consistent app-shell model, stable auth restore behavior, and shared error/loading handling expectations.
- Accessibility is addressed by requiring understandable shared UI states that later page-level units can reuse.
- Maintainability is addressed by separating app bootstrap, auth/session concerns, API integration, and later UI composition into distinct responsibilities.

## Tradeoffs

- One shared frontend application keeps early delivery simpler, but it requires disciplined role-aware boundaries inside the same client.
- Deferring routing, state-library, and component-library detail keeps this unit focused, but later units must stay aligned with this baseline instead of making ad hoc decisions.
- Session-based browser auth is a better fit for the current architecture, but it requires deliberate frontend handling for CSRF and session restore.

## Monitoring

- Later implementation should monitor frontend auth bootstrap failures, repeated unauthorized responses, and major API error patterns.
- Later UI units should show how their initialization and protected-route behavior maps back to this foundation.
- Any future proposal to split the frontend by role or move to a different browser auth posture should be reviewed explicitly.

## Testing approach

- Review the unit against ADR-001, architecture, auth, RBAC, and API baseline documents.
- Check that React + Vite, session-based integration, and role-aware app behavior are all covered.
- Check that the unit stays focused on initialization rather than page-level UI implementation.
- Run `./scripts/aidlc-check.sh`.
