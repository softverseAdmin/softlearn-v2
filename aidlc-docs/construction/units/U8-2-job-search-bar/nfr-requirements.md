# NFR requirements: U8-2-job-search-bar

## Security

- Job-search-bar behavior must respect the visible vacancy posture for authenticated students.
- Query results must not leak draft, removed, or unauthorized vacancies.

## Privacy

- Job-search-bar behavior must not expose protected student data.
- Non-public company vacancy data must remain controlled even when query terms overlap hidden records.

## Performance

- Search-bar interactions should remain responsive enough for interactive student browsing.
- Queried, cleared, and no-match states should update predictably without unstable delays.

## Reliability

- The same visible job set and query should produce the same result set.
- Conflicting searched-versus-default list outcomes for the same visibility state should be prevented.

## Accessibility

- Search input, clear actions, and no-match states should be represented clearly and understandably.
- The search-bar experience should remain navigable for keyboard and assistive-technology users.

## Maintainability

- The job search bar should build on the shared job-list, visibility, and frontend baselines.
- The unit should stay focused on general query behavior rather than absorbing structured filter, bookmark, or matching logic.
