# NFR requirements: U9-6-match-score-calculation

## Security

- Match-score calculation must run in a protected, auditable context.
- Factor inputs and aggregate results must not be exposed through unauthorized access paths.

## Privacy

- Match-score calculation must respect the protected nature of student profile, learning, and exam data.
- Downstream sharing of aggregate match results must not bypass later visibility and consent controls.

## Performance

- Aggregate match scoring should complete responsively enough to support ranked recommendation workflows.
- The aggregation path should avoid unstable delays that make score or rank state ambiguous.

## Reliability

- The same factor set and weighting model should produce the same aggregate match outcome.
- Conflicting aggregate scores for the same student-vacancy comparison should be prevented.

## Accessibility

- Later user-facing communication of aggregate scores and explanations should be based on clear structured outputs.
- Match levels, strengths, and gaps should be representable understandably.

## Maintainability

- Match-score calculation should build on the shared explainability, privacy, audit, and rule-based matching baselines.
- The unit should stay focused on aggregation rather than absorbing matched-list presentation or application logic.
