# NFR requirements: U4-2-course-listing

## Security

- Course-listing access must follow the platform’s approved authentication and authorization posture.
- Course-list reads must not expose protected student-specific data unnecessarily.
- Later detail, enrollment, or progress actions must remain outside this unit’s read-only discovery scope.

## Privacy

- Course-listing browsing should avoid unnecessary coupling to student-private profile data.
- If later personalization is introduced, it must not leak hidden student information in the catalog experience.

## Performance

- Course-list reads should remain responsive for interactive browsing.
- The design should support understandable loading behavior for the listing experience.

## Reliability

- Course-list requests should produce predictable outcomes for the same catalog state.
- Empty catalog and unexpected backend failure states should surface stable user-facing outcomes.

## Accessibility

- Course-list views should support understandable structure, navigation, and clear content hierarchy.
- Empty, loading, and error states should remain accessible and unambiguous.

## Maintainability

- Course listing should reuse the shared routing, layout, and frontend-state baselines.
- This unit should stay focused on course browsing rather than absorbing detail, enrollment, or lesson logic.
- Later learning units should extend this baseline instead of redefining course-discovery behavior independently.
