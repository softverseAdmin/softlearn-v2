# NFR requirements: U8-7-bookmark-jobs

## Security

- Job bookmarking must enforce authenticated student ownership of bookmark records.
- Hidden, removed, or unauthorized vacancies must not be bookmarkable through this baseline.

## Privacy

- Bookmark records are protected student preference data and must not be exposed to companies or other students.
- Bookmark behavior must not expose protected student data beyond the owning student context.

## Performance

- Bookmark save and unsave actions should remain responsive enough for interactive job browsing.
- Saved, unsaved, and already-saved states should update predictably without unstable delays.

## Reliability

- The same bookmark action on the same visible job should produce a stable outcome.
- Duplicate bookmarks and conflicting saved-versus-unsaved states for the same student and job should be prevented.

## Accessibility

- Bookmark controls and saved-state feedback should be represented clearly and understandably.
- The bookmark experience should remain navigable for keyboard and assistive-technology users.

## Maintainability

- Bookmark jobs should build on the shared student, vacancy, visibility, and frontend baselines.
- The unit should stay focused on bookmark state rather than absorbing applications, recommendations, or matching logic.
