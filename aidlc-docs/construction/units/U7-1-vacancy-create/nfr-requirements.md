# NFR requirements: U7-1-vacancy-create

## Security

- Vacancy creation must enforce authenticated company ownership and company-boundary rules.
- Unauthorized vacancy creation attempts or cross-company record creation must be prevented and auditable.

## Privacy

- Vacancy creation operates on company-owned data and must not expose protected student data.
- Draft or unpublished vacancy state must remain controlled until later visibility rules allow broader access.

## Performance

- Protected vacancy-creation reads and writes should remain responsive for company authoring workflows.
- Validation feedback should return predictably and clearly.

## Reliability

- Valid vacancy submissions should produce one stable vacancy outcome in the intended company context.
- Duplicate or conflicting vacancy records caused by inconsistent creation inputs should be prevented.

## Accessibility

- Vacancy-creation forms and validation outcomes should be understandable and navigable.
- Draft, invalid, and successfully created states should be represented clearly to company users.

## Maintainability

- Vacancy creation should build on the shared company, vacancy, security, and route baselines.
- The unit should stay focused on vacancy record creation rather than absorbing later requirement-tag, listing, or matching behavior.
