# NFR design: U1-6-routing-and-navigation

## How NFRs are addressed

- Security is addressed through protected-route assumptions, role-aware guard behavior, and explicit separation between frontend route checks and backend authorization.
- Privacy is addressed by keeping route visibility and navigation role-aware while still treating backend policy enforcement as authoritative.
- Performance is addressed by defining shared route groups and guard behavior once so later units do not duplicate routing logic.
- Reliability is addressed through stable fallback outcomes for unknown, unauthorized, forbidden, and session-expired states.
- Accessibility is addressed by requiring route outcomes and navigation states that can be explained clearly in the UI.
- Maintainability is addressed by organizing routes by access pattern and domain area instead of by ad hoc page additions.

## Tradeoffs

- A single shared router is simpler for the current stage, but it requires disciplined role-aware route boundaries within one frontend app.
- Defining a baseline route model now reduces later drift, but some exact page trees and navigation details are intentionally deferred.
- Guarding routes in the frontend improves UX, but backend authorization remains necessary and must stay authoritative.

## Monitoring

- Later implementation should monitor repeated unauthorized, forbidden, not-found, and session-expiry navigation outcomes.
- Later frontend units should map their routes back to these baseline route groups rather than inventing parallel navigation models.
- Any future change that splits the app by role or substantially changes route behavior should be reviewed explicitly.

## Testing approach

- Review the unit against frontend foundation, auth, RBAC, and requirements baselines.
- Check that public, protected, student, company, and admin route groups are all covered.
- Check that navigation and redirect behavior is described for session-expiry, forbidden, and unknown-route flows.
- Run `./scripts/aidlc-check.sh`.
