# NFR requirements: U20-1-student-dashboard-redesign

## Security

- Student dashboard access must remain protected by the existing authenticated student route and backend role checks.
- Dashboard actions and links must not create paths to company-only or admin-only behavior.
- The redesign must not introduce external AI APIs, client-side secrets, or browser-stored privileged data.

## Privacy

- The dashboard may surface only the student's own learning, exam, and interview data.
- Privacy-sensitive visibility rules must remain intact, especially around exam-sharing state and company-facing information boundaries.
- The UI should avoid unnecessary exposure of detailed raw records when a smaller summary is sufficient.

## Performance

- The dashboard should load from one primary API request.
- The page should render a useful loading state quickly and avoid heavy visualizations or oversized client bundles.
- Roadmap preview content should remain compact so it does not require large data transfers for the initial dashboard view.

## Reliability

- The dashboard must return stable fallback content when the student has no learning history, no exams, or no interviews.
- Missing optional sections must not break the full page.
- Deterministic next-action selection must remain consistent for the same user state.

## Accessibility

- The redesign must preserve semantic headings, keyboard reachability, visible focus, and sufficient color contrast.
- Roadmap states must not rely on color alone; labels or icons are required.
- Mobile layout must maintain readable spacing and tap targets.

## Maintainability

- Student dashboard UI should be split into focused components rather than one monolithic page body.
- API response types should be explicit and shared through typed frontend interfaces.
- Styling should move toward the redesign system without forcing unrelated pages to be rewritten in the same unit.
