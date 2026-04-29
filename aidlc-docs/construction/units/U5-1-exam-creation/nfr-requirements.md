# NFR requirements: U5-1-exam-creation

## Security

- Exam creation must enforce authenticated, role-approved authoring access.
- Exam-definition writes must remain controlled and auditable because exam configuration affects assessment integrity.

## Privacy

- Exam creation must not expose student results, attempt data, or protected exam internals outside authorized management contexts.
- Later exam-delivery and company-visibility flows must not bypass the controlled authoring boundaries defined here.

## Performance

- Protected exam-creation reads and writes should remain responsive for authorized operators.
- Validation feedback should return in a predictable way that supports efficient content-management work.

## Reliability

- Valid exam-definition submissions should produce one stable exam record outcome.
- Duplicate or conflicting exam records for the same intended assessment identity should be prevented.

## Accessibility

- Protected exam-creation forms and validation outcomes should be understandable and navigable.
- Draft, invalid, and successfully created states should be represented clearly to authorized operators.

## Maintainability

- Exam creation should build on the shared exam-domain, security, and route baselines.
- The unit should stay focused on exam definition rather than absorbing question authoring, scoring, results, or retake logic.
