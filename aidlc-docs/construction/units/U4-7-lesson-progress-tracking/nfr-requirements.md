# NFR requirements: U4-7-lesson-progress-tracking

## Security

- Lesson-progress reads and writes must enforce authenticated student ownership.
- Unauthorized users must not access or mutate protected lesson-progress data.

## Privacy

- Lesson progress is protected student learning data and must remain subject to ownership, consent, and visibility rules.
- The system must avoid leaking student lesson-progress state through unrelated discovery or course-detail flows.

## Performance

- Progress updates should remain responsive enough to fit naturally into lesson participation.
- Progress reads should support a smooth continuation experience for the student.

## Reliability

- The same progress update should produce predictable outcomes for the same starting state.
- Duplicate or conflicting lesson-progress records must be prevented.

## Accessibility

- Progress-related feedback shown to students should remain understandable and accessible.
- Learning-state updates should not depend on inaccessible-only interaction patterns.

## Maintainability

- Lesson progress should reuse shared auth, RBAC, route, layout, and error-handling baselines.
- The unit should stay focused on lesson-level learning state rather than absorbing course-completion or analytics logic.
