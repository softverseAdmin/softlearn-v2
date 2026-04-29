# NFR requirements: U7-5-vacancy-detail

## Security

- Vacancy-detail access must respect the visibility posture of the requesting context.
- Unauthorized draft, removed, or cross-company vacancy detail exposure must be prevented and auditable.

## Privacy

- Company-owned non-public vacancy detail must remain controlled until later visibility rules allow broader access.
- Vacancy-detail behavior must not expose protected student data.

## Performance

- Vacancy-detail reads should remain responsive for management and later discovery workflows.
- Visible, hidden, removed, and not-found states should load predictably without unstable delays.

## Reliability

- The same visibility context and vacancy state should produce the same detail outcome.
- Conflicting visible-versus-removed detail states for the same vacancy should be prevented.

## Accessibility

- Vacancy-detail fields and unavailable states should be represented clearly and understandably.
- Detail views should remain navigable and readable for keyboard and assistive-technology users.

## Maintainability

- Vacancy detail should build on the shared vacancy, security, visibility, and routing baselines.
- The unit should stay focused on detail-form retrieval rather than absorbing search filters, applications, or matching logic.
