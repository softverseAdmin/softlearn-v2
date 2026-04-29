# NFR requirements: U7-3-vacancy-delete

## Security

- Vacancy deletion must enforce authenticated company ownership and company-boundary rules.
- Unauthorized vacancy-removal attempts or cross-company deletion must be prevented and auditable.

## Privacy

- Vacancy deletion operates on company-owned data and must not expose protected student data.
- Removed vacancy state and any retained audit history must remain controlled.

## Performance

- Protected vacancy-delete actions should complete responsively for company management workflows.
- Confirmation and outcome feedback should return predictably and clearly.

## Reliability

- Valid vacancy-removal actions should produce one stable removal outcome in the intended company context.
- Conflicting active-versus-removed states for the same vacancy should be prevented.

## Accessibility

- Vacancy-delete confirmations and outcomes should be understandable and navigable.
- Active, removed, invalid, and blocked-removal states should be represented clearly to company users.

## Maintainability

- Vacancy deletion should build on the shared company, vacancy, security, and route baselines.
- The unit should stay focused on vacancy removal rather than absorbing listing, requirement-tag, application, or matching behavior.
