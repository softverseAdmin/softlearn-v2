# NFR requirements: U7-2-vacancy-edit

## Security

- Vacancy editing must enforce authenticated company ownership and company-boundary rules.
- Unauthorized vacancy-update attempts or cross-company edits must be prevented and auditable.

## Privacy

- Vacancy editing operates on company-owned data and must not expose protected student data.
- Visibility-impacting updates must remain controlled until later publication rules define broader access.

## Performance

- Protected vacancy-edit reads and writes should remain responsive for company management workflows.
- Validation feedback should return predictably and clearly.

## Reliability

- Valid vacancy updates should produce one stable updated vacancy outcome in the intended company context.
- Conflicting vacancy updates or silent identity drift should be prevented.

## Accessibility

- Vacancy-edit forms and validation outcomes should be understandable and navigable.
- Draft, invalid, and successfully updated states should be represented clearly to company users.

## Maintainability

- Vacancy editing should build on the shared company, vacancy, security, and route baselines.
- The unit should stay focused on vacancy updates rather than absorbing deletion, requirement-tag, listing, or matching behavior.
