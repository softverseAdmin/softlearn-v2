# NFR requirements: U9-7-matched-student-list-for-company

## Security

- Company-facing matched-student access must require authenticated authorized company users.
- The list must not expose protected student data or cross-company vacancy data.

## Privacy

- Matched-student presentation must respect consent-aware visibility rules and privacy filters.
- Explanations must remain informative without leaking protected student details.

## Performance

- Ranked matched-student retrieval should complete responsively enough for recruiter review workflows.
- List rendering should remain stable with pagination or filtering refinements added later.

## Reliability

- The same authorized company context and match-result set should produce the same matched-student ordering and explanation posture.
- Stale, duplicate, or conflicting matched-student entries should be prevented.

## Accessibility

- Match levels, strengths, and gaps should be representable clearly in company-facing interfaces.
- Privacy-driven masking states should still be understandable to authorized users.

## Maintainability

- The unit should build on shared authorization, privacy, and aggregate-scoring baselines.
- The unit should stay focused on company-side presentation rather than absorbing scoring or downstream workflow logic.
