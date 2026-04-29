# NFR design: U20-2-auth-redesign

## How NFRs are addressed

- Security is preserved by keeping the auth endpoints, session creation, and redirect behavior unchanged.
- Performance is addressed by using CSS-driven layout and text content rather than heavy illustrations.
- Accessibility is addressed through semantic form controls, visible labels, and responsive spacing.
- Maintainability is addressed by moving shared auth-page framing into a reusable component.

## Tradeoffs

- Forgot-password behavior remains an inline guidance affordance because a real password-reset flow is outside this unit.
- The redesign improves perception and UX without changing backend auth capabilities.

## Monitoring

- Existing frontend build and lint checks should catch integration issues.
- Existing backend auth tests continue to protect login/signup behavior.

## Testing approach

- Build and lint the frontend after auth-page changes.
- Run backend tests to ensure auth flows still behave correctly.
- Validate the AI-DLC repository state after unit completion.
