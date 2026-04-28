# NFR requirements: U1-7-global-state-management

## Security

- Shared state must avoid exposing sensitive credentials or browser-auth material in unsafe client storage.
- Session-aware state should reflect authenticated status and user context without duplicating security decisions that belong to the backend.
- Logout and auth-failure flows should clear or invalidate sensitive shared client context predictably.

## Privacy

- Global state should keep only the minimum cross-feature identity and role information needed by the client.
- Privacy-sensitive student or company data should not be elevated into shared state unless multiple routes genuinely require it.
- Shared state patterns must not widen visibility beyond what backend APIs already authorize.

## Performance

- The state model should avoid unnecessary global re-renders caused by over-centralized state.
- Shared state should support efficient app bootstrap and session restore behavior.
- The design should support later server-state caching or fetch reuse without forcing everything into one store.

## Reliability

- Auth/session and user-context state should remain consistent across route changes, logout, restore, and backend auth failures.
- Shared state boundaries should be stable enough that later frontend units can reuse them predictably.
- The same app context should produce consistent derived navigation and guard behavior.

## Accessibility

- Shared state should support app-wide loading, error, and notification behavior that can be presented clearly in accessible UI patterns.
- State transitions that affect the whole app should allow clear user feedback and orientation.

## Maintainability

- Shared state ownership should remain explicit so later units know what belongs globally and what stays local.
- The design should support incremental frontend growth without forcing a full rewrite of state patterns.
- Global state should be modular rather than one undifferentiated store.
