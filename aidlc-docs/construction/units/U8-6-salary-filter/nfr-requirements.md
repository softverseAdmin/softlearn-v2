# NFR requirements: U8-6-salary-filter

## Security

- Salary-filter behavior must respect the visible vacancy posture for authenticated students.
- Filtered results must not leak hidden, removed, or unauthorized vacancies.

## Privacy

- Salary-filter behavior must not expose protected student data.
- Non-public company vacancy compensation data must remain controlled until visibility rules allow student browsing.

## Performance

- Salary-filter interactions should remain responsive enough for interactive browsing.
- Filtered, cleared, missing-salary-aware, and no-match states should update predictably without unstable delays.

## Reliability

- The same visible job set and selected salary criteria should produce the same filtered result set.
- Conflicting filtered-versus-default list outcomes for the same visibility state should be prevented.

## Accessibility

- Salary-filter controls, clear actions, and no-match states should be represented clearly and understandably.
- The filter experience should remain navigable for keyboard and assistive-technology users.

## Maintainability

- The salary filter should build on the shared job-list, visibility, and frontend baselines.
- The unit should stay focused on salary filtering rather than absorbing other filters, bookmarks, or matching logic.
