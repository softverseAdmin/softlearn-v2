# NFR requirements: U4-4-lesson-creation

## Security

- Lesson creation must require authenticated, privileged access aligned with protected authoring rules.
- Students and company users must not gain lesson-authoring capability through this unit.

## Privacy

- Lesson creation should remain independent from protected student data.
- Authoring inputs should remain limited to what is necessary to define the lesson.

## Performance

- Lesson-authoring interactions should remain responsive for form-based use.
- Validation feedback should return predictably.

## Reliability

- Lesson creation should produce stable validation outcomes for the same invalid input.
- Successful lesson creation should persist a predictable course-linked lesson record and ordering state.

## Accessibility

- The lesson-creation flow should support understandable form structure, labels, and validation messages.
- Success and failure states should remain clear and accessible.

## Maintainability

- Lesson creation should reuse protected routing, layout, and validation baselines.
- The unit should stay focused on lesson authoring rather than absorbing lesson delivery or progress logic.
