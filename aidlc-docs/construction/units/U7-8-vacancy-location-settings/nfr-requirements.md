# NFR requirements: U7-8-vacancy-location-settings

## Security

- Vacancy location-settings management must enforce authenticated company ownership and company-boundary rules.
- Unauthorized cross-company updates to vacancy location settings must be prevented and auditable.

## Privacy

- Vacancy location settings operate on company-owned requirement data and must not expose protected student data.
- Non-public vacancy settings must remain controlled until later visibility rules allow broader access.

## Performance

- Protected vacancy location-setting reads and writes should remain responsive for company management workflows.
- Validation feedback should return predictably and clearly.

## Reliability

- Valid location-setting changes should produce one stable requirement-set outcome for the intended vacancy.
- Duplicate or conflicting location settings for the same vacancy should be prevented.

## Accessibility

- Location-setting forms and validation outcomes should be understandable and navigable.
- Work-style and location states should be represented clearly to company users.

## Maintainability

- Vacancy location settings should build on the shared vacancy, security, and route baselines.
- The unit should stay focused on structured location expectations rather than absorbing skill, language, or matching logic.
