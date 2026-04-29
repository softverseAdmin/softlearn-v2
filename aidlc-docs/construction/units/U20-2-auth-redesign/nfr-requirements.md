# NFR requirements: U20-2-auth-redesign

## Security

- Auth UI must remain aligned to the existing session-based login and signup flow.
- The redesign must not leak sensitive error details or create new insecure browser-side auth behavior.

## Privacy

- Public auth pages must collect only the minimum required fields for the selected role.
- Company-specific fields should not appear for student signup.

## Performance

- Auth pages should render quickly with lightweight marketing content and no heavy media payloads.
- Desktop value-panel content should collapse cleanly on mobile.

## Reliability

- Form errors must remain clear and recoverable.
- Role switching in signup must reliably show the correct fields and submit the correct payload.

## Accessibility

- Inputs, buttons, toggles, and links must remain keyboard reachable and clearly labeled.
- Layout changes must preserve readable spacing and contrast on mobile and desktop.

## Maintainability

- Shared auth-shell structure should avoid duplicating layout logic between login and signup.
- Auth pages should continue to use the existing auth context and route flow rather than inventing a separate auth state layer.
