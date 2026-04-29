# NFR requirements: U7-7-vacancy-language-requirements

## Security

- Vacancy language-requirements management must enforce authenticated company ownership and company-boundary rules.
- Unauthorized cross-company updates to language requirements must be prevented and auditable.

## Privacy

- Vacancy language requirements operate on company-owned requirement data and must not expose protected student data.
- Non-public vacancy requirements must remain controlled until later visibility rules allow broader access.

## Performance

- Protected vacancy language-requirement reads and writes should remain responsive for company management workflows.
- Validation feedback should return predictably and clearly.

## Reliability

- Valid language-requirement changes should produce one stable requirement-set outcome for the intended vacancy.
- Duplicate or conflicting language requirements for the same vacancy should be prevented.

## Accessibility

- Language-requirement forms and validation outcomes should be understandable and navigable.
- Required and preferred states and minimum-level expectations should be represented clearly to company users.

## Maintainability

- Vacancy language requirements should build on the shared vacancy, language-level model, security, and route baselines.
- The unit should stay focused on structured language expectations rather than absorbing skill, location, or matching logic.
