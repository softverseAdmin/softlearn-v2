# NFR requirements: U4-1-course-creation

## Security

- Course creation must require authenticated, privileged access aligned with admin-protection rules.
- Students and company users must not gain course-authoring capability through this unit.
- State-changing course-creation requests must remain compatible with CSRF-protected browser access.

## Privacy

- Course creation should avoid coupling authoring flows to protected student data.
- Authoring metadata should remain limited to what is necessary to define the course.

## Performance

- The course-creation flow should remain responsive for interactive form use.
- Validation feedback should return predictably without unnecessary delay.

## Reliability

- Submitting the same invalid input should produce stable validation outcomes.
- Successful course creation should produce a consistent persisted course record ready for later units.

## Accessibility

- The protected course-creation form should support clear labels, validation messaging, and predictable navigation order.
- Success and failure states should remain understandable and unambiguous.

## Maintainability

- Course creation should reuse shared auth, routing, layout, and error-envelope baselines.
- The unit should stay focused on creating course records rather than absorbing later publishing or lesson-management workflows.
