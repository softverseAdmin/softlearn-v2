# NFR requirements: U3-5-company-hiring-preferences

## Security

- Company hiring-preference access must require an authenticated company session.
- Only users bound to the owning company context may update that company’s hiring preferences through this flow.
- Protected writes must reject unauthorized or malformed preference changes explicitly.

## Privacy

- Company hiring preferences are company-owned protected data and must not be exposed across company boundaries.
- This self-service flow should expose only the authenticated company’s own preference data in the company context.

## Performance

- Hiring-preference read and update interactions should remain responsive for normal interactive use.
- The flow should avoid unnecessary full-app reload behavior for structured preference updates.

## Reliability

- The same preference data and validation rules should produce consistent read and update outcomes.
- Save success, validation failure, and unexpected backend error states should be predictable.
- Company app-shell state should remain stable while preference operations occur.

## Accessibility

- Hiring-preference forms, validation errors, and success feedback should support clear, accessible UI presentation.
- The screen should support understandable structure inside the shared company layout.

## Maintainability

- Hiring-preference logic should remain focused on company-level defaults only.
- Shared auth, route, layout, and state-management patterns should be reused rather than redefined here.
- Later vacancy-detail and candidate-review units should extend this baseline rather than replacing it.
