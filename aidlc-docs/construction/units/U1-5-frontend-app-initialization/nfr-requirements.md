# NFR requirements: U1-5-frontend-app-initialization

## Security

- The frontend foundation must assume authenticated browser sessions rather than exposing token-first browser storage patterns.
- Protected write flows must support CSRF-aware request behavior.
- Role-restricted views and actions should be hidden or disabled in the client, while still relying on backend enforcement as the final authority.
- Shared error handling should avoid leaking sensitive backend details.

## Privacy

- The frontend should only request and display data the current user is allowed to see.
- Role-aware UX should avoid casually exposing student-sensitive or company-sensitive information outside allowed contexts.
- Session restore and auth bootstrap flows should minimize unnecessary exposure of identity or protected profile data.

## Performance

- App bootstrap should remain lightweight enough for normal interactive startup in local-first development.
- Shared initialization patterns should avoid unnecessary duplicate auth or configuration requests.
- The foundation should support later code-splitting and route-level loading if needed.

## Reliability

- Auth restore, unauthorized handling, and API error handling should behave consistently across the app.
- Shared frontend foundations should remain stable enough that later feature units can reuse them without redesign.
- The app shell should tolerate partial backend failures by surfacing clear UI states rather than undefined behavior.

## Accessibility

- Shared loading, error, and auth states should support understandable UI presentation.
- The frontend foundation should support accessible navigation, clear focus handling, and readable feedback patterns in later units.

## Maintainability

- The initialization design should keep app bootstrap, auth/session handling, API integration, and UI concerns clearly separated.
- The foundation should support later routing, navigation, and global state units without forcing major rework.
- One primary frontend application should remain the default until scale or operational needs justify a split.
