# NFR requirements: U9-8-matched-jobs-for-student

## Security

- Student-facing matched-jobs access must require authenticated student identity.
- The list must not expose hidden vacancies or company-internal restricted data.

## Privacy

- Student explanations should use only approved vacancy-visible and student-owned information.
- Recommendation presentation must not reveal protected company-only evaluation details.

## Performance

- Ranked matched-job retrieval should complete responsively enough for student discovery workflows.
- List rendering should remain stable with later pagination or refresh refinements.

## Reliability

- The same student context and visible vacancy set should produce the same matched-job ordering and explanation posture.
- Stale, duplicate, or conflicting matched-job entries should be prevented.

## Accessibility

- Match levels, strengths, and gaps should be representable clearly in student-facing interfaces.
- Improvement-oriented explanation wording should remain understandable.

## Maintainability

- The unit should build on shared vacancy-visibility, explanation, and aggregate-scoring baselines.
- The unit should stay focused on student-side presentation rather than absorbing scoring, search, or application logic.
