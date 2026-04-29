# NFR requirements: U7-6-vacancy-skill-tags

## Security

- Vacancy skill-tag management must enforce authenticated company ownership and company-boundary rules.
- Unauthorized cross-company updates to skill requirements must be prevented and auditable.

## Privacy

- Vacancy skill tags operate on company-owned requirement data and must not expose protected student data.
- Non-public vacancy requirements must remain controlled until later visibility rules allow broader access.

## Performance

- Protected vacancy skill-tag reads and writes should remain responsive for company management workflows.
- Validation feedback should return predictably and clearly.

## Reliability

- Valid skill-requirement changes should produce one stable requirement-set outcome for the intended vacancy.
- Duplicate or conflicting skill requirements for the same vacancy should be prevented.

## Accessibility

- Skill-tag forms and validation outcomes should be understandable and navigable.
- Required and preferred states should be represented clearly to company users.

## Maintainability

- Vacancy skill tags should build on the shared vacancy, skill taxonomy, security, and route baselines.
- The unit should stay focused on structured skill requirements rather than absorbing language, location, or matching logic.
