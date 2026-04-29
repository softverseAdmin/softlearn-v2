# NFR requirements: U5-3-answer-options-management

## Security

- Answer-options management must enforce authenticated, role-approved authoring access.
- Option and correctness-related writes must remain controlled and auditable because they affect assessment integrity directly.

## Privacy

- Answer-options management must not expose student attempt data, result data, or protected correctness details outside authorized management contexts.
- Later exam-delivery and results workflows must not bypass the controlled authoring boundaries defined here.

## Performance

- Protected option-management reads and writes should remain responsive for authorized operators.
- Validation feedback should return in a predictable way that supports efficient content-management work.

## Reliability

- Valid answer-option changes should produce one stable option-set outcome for the intended question.
- Duplicate, conflicting, or improperly ordered option sets should be prevented.

## Accessibility

- Protected answer-options management forms and validation outcomes should be understandable and navigable.
- Invalid, saved, and reordered states should be represented clearly to authorized operators.

## Maintainability

- Answer-options management should build on the shared exam-domain, security, and route baselines.
- The unit should stay focused on candidate-answer definition rather than absorbing exam-taking, scoring, results, or retake logic.
