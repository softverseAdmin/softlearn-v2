# NFR requirements: U7-4-vacancy-list

## Security

- Vacancy-list access must respect the visibility posture of the requesting context.
- Unauthorized draft, removed, or cross-company vacancy exposure must be prevented and auditable.

## Privacy

- Company-owned non-public vacancy data must remain controlled until later visibility rules allow broader access.
- Vacancy-list behavior must not expose protected student data.

## Performance

- Vacancy-list reads should remain responsive for management and later discovery workflows.
- Empty, visible, and no-results states should load predictably without unstable delays.

## Reliability

- The same visibility context and vacancy state should produce the same list outcome.
- Conflicting active-versus-removed list results for the same vacancy set should be prevented.

## Accessibility

- Vacancy summaries, empty states, and no-visible-results states should be represented clearly and understandably.
- List views should remain navigable and readable for keyboard and assistive-technology users.

## Maintainability

- Vacancy listing should build on the shared vacancy, security, visibility, and routing baselines.
- The unit should stay focused on list-form retrieval rather than absorbing detail, search filters, or matching logic.
