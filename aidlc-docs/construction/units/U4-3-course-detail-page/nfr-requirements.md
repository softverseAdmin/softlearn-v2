# NFR requirements: U4-3-course-detail-page

## Security

- Course-detail access must follow the approved discovery and route-protection posture.
- Course detail must not expose protected student-owned learning state unless later units explicitly authorize it.

## Privacy

- The detail page should remain centered on shared course data rather than student-private records.
- Any future personalization must not leak hidden student data in the course-detail experience.

## Performance

- Single-course detail reads should remain responsive for interactive browsing.
- Loading states should be understandable and predictable.

## Reliability

- Requests for the same course should return stable outcomes for the same catalog state.
- Missing, unavailable, or failed detail reads should surface consistent user-facing states.

## Accessibility

- The detail page should present a clear information hierarchy, readable structure, and understandable actions.
- Fallback states should remain accessible and unambiguous.

## Maintainability

- The unit should reuse shared routing, layout, and API baselines.
- Course detail should stay focused on viewing a single course rather than taking on enrollment, lesson rendering, or progress computation.
