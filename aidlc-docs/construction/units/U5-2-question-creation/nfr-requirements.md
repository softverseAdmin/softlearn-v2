# NFR requirements: U5-2-question-creation

## Security

- Question creation must enforce authenticated, role-approved authoring access.
- Question-definition writes must remain controlled and auditable because question content affects assessment integrity.

## Privacy

- Question creation must not expose student attempt data, result data, or protected exam internals outside authorized management contexts.
- Later exam-delivery and results workflows must not bypass the controlled authoring boundaries defined here.

## Performance

- Protected question-creation reads and writes should remain responsive for authorized operators.
- Validation feedback should return in a predictable way that supports efficient content-management work.

## Reliability

- Valid question-definition submissions should produce one stable question record outcome linked to the intended exam.
- Duplicate or conflicting question records and invalid ordering inside the same exam should be prevented.

## Accessibility

- Protected question-creation forms and validation outcomes should be understandable and navigable.
- Draft, invalid, and successfully created states should be represented clearly to authorized operators.

## Maintainability

- Question creation should build on the shared exam-domain, security, and route baselines.
- The unit should stay focused on question definition rather than absorbing answer-options, scoring, results, or retake logic.
