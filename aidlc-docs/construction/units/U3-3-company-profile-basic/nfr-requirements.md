# NFR requirements: U3-3-company-profile-basic

## Security

- Company basic-profile access must require an authenticated company session.
- Only users bound to the owning company context may update that company’s basic profile through this flow.
- Protected writes must reject unauthorized or malformed profile changes explicitly.

## Privacy

- Company basic-profile data is company-owned protected information and must not be exposed across company boundaries.
- This self-service flow should expose only the authenticated company’s own profile data in the company context.

## Performance

- Company-profile read and update interactions should remain responsive for normal interactive use.
- The flow should avoid unnecessary full-app reload behavior for small profile updates.

## Reliability

- The same profile data and validation rules should produce consistent read and update outcomes.
- Save success, field-validation failure, and unexpected backend error states should be predictable.
- Company app-shell state should remain stable while profile operations occur.

## Accessibility

- Company profile forms, validation errors, and success feedback should support clear, accessible UI presentation.
- The basic company profile screen should support understandable structure inside the shared company layout.

## Maintainability

- Basic company profile logic should remain focused on core company identity fields only.
- Shared auth, route, layout, and state-management patterns should be reused rather than redefined here.
- Later company-detail units should extend this baseline rather than replacing it.
