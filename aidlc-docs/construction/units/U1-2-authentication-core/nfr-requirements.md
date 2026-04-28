# NFR requirements: U1-2-authentication-core

## Security

- Passwords must never be stored or transmitted in reversible form.
- Auth flows must enforce session-based protection for protected browser actions.
- CSRF protection must apply to authenticated state-changing requests.
- Login, logout, password reset, and session invalidation behavior must be explicit and reviewable.
- Authentication must not bypass later authorization, privacy, or consent checks.

## Privacy

- Authentication responses should expose only the minimum user identity data needed for the client session.
- Sensitive user recovery flows should avoid leaking whether an email belongs to a protected account beyond approved product behavior.
- Auth design must preserve separation between identity data and student/company private domain data.

## Performance

- Login, logout, and session restore should remain lightweight enough for normal interactive web use.
- The design should support common browser requests without unnecessary extra auth round-trips.

## Reliability

- Session lifecycle behavior must be consistent across browser refresh, logout, timeout, and password-reset scenarios.
- Failed authentication should return stable, non-ambiguous error shapes for the frontend.
- Password reset and logout must behave predictably even if repeated.

## Accessibility

- Error messages should be simple enough to support clear, accessible UI presentation.
- Auth flows should support accessible frontend forms and understandable recovery paths.

## Maintainability

- Auth responsibilities should stay separate from RBAC and domain modules.
- Session, CSRF, password, and reset rules should be documented once and reused by later units.
- The design should support later hosted identity adoption only if future requirements justify it.
