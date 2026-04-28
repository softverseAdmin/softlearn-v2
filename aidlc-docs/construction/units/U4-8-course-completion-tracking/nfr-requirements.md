# NFR requirements: U4-8-course-completion-tracking

## Security

- Course-completion data must enforce authenticated ownership and approved access rules.
- Completion records must not be exposed to company or admin contexts outside explicit policy and audit expectations.

## Privacy

- Course completion is protected student learning evidence and must respect privacy and consent rules.
- Downstream use of completion data must not bypass future visibility controls.

## Performance

- Completion-state reads should remain responsive for student learning views.
- Completion evaluation should support understandable user feedback without unstable delays.

## Reliability

- The same lesson-progress state should produce the same course-completion outcome.
- Conflicting or duplicate completion records for the same enrollment should be prevented.

## Accessibility

- Completion and in-progress states should be represented clearly and understandably.
- Student-facing learning status should remain accessible and unambiguous.

## Maintainability

- Course completion should build on the shared learning-domain, privacy, and route baselines.
- The unit should stay focused on completion evidence rather than absorbing certificates, readiness scoring, or company-facing exposure logic.
