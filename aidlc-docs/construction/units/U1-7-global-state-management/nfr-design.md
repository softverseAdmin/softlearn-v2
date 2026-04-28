# NFR design: U1-7-global-state-management

## How NFRs are addressed

- Security is addressed by keeping browser auth session handling separate from unsafe client credential storage and by clearing shared auth context on logout or auth failure.
- Privacy is addressed by minimizing what identity or domain data is promoted into shared state and by treating backend authorization as authoritative.
- Performance is addressed through a state-ownership model that keeps local state local and avoids unnecessary global reactivity.
- Reliability is addressed by defining stable shared state for session, user context, and app-shell behavior across route changes and restore flows.
- Accessibility is addressed by supporting app-wide loading and error states that UI layers can present clearly.
- Maintainability is addressed by separating shared state categories and discouraging a one-store-for-everything pattern.

## Tradeoffs

- A modest shared state model is easier to reason about now, but some exact implementation details are intentionally deferred to later frontend units.
- Keeping server-owned data closer to fetch layers reduces duplication, but it requires later units to be disciplined about what truly belongs in shared client state.
- Avoiding an overgrown global store improves maintainability, but it means later units must think carefully before promoting state upward.

## Monitoring

- Later implementation should monitor auth restore failures, repeated global error states, and state-related navigation inconsistencies.
- Later frontend units should show whether new shared state belongs in the existing categories or should remain local.
- Any proposal to move significant domain data into shared global state should be reviewed explicitly to avoid client-state sprawl.

## Testing approach

- Review the unit against frontend initialization, routing, auth, and API baselines.
- Check that auth/session, user context, and app-shell state are covered.
- Check that the design distinguishes shared state from local page state clearly.
- Run `./scripts/aidlc-check.sh`.
