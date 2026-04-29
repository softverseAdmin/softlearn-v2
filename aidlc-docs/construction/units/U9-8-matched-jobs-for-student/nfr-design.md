# NFR design: U9-8-matched-jobs-for-student

## How NFRs are addressed

- Security is addressed by requiring authenticated student access and restricting results to visible vacancies only.
- Privacy is addressed by shaping explanations around approved student-owned and vacancy-visible information.
- Performance is addressed by focusing on predictable ranked retrieval for recommendation browsing flows.
- Reliability is addressed through stable ranking consumption, duplicate-prevention expectations, and deterministic visibility behavior.
- Accessibility is addressed by requiring match explanations and improvement guidance to remain clearly representable.
- Maintainability is addressed by keeping student-side matched-job presentation separate from aggregate scoring, search, and bookmark logic.

## Tradeoffs

- Separating matched jobs from general search preserves clearer user intent, but later teams must ensure the two experiences stay consistent on vacancy visibility rules.
- Student-friendly explanations improve actionability, though later teams must keep them aligned with the same factor vocabulary used in aggregate scoring.

## Monitoring

- Later implementation should monitor hidden-vacancy leakage, stale match entries, explanation inconsistencies, and unusual recommendation refresh behavior.
- Later application and bookmark-adjacent units should confirm they only consume student-visible match results produced under this baseline.

## Testing approach

- Review the unit against the requirements, security, vacancy-visibility, job-search, bookmark, and aggregate-scoring baselines.
- Check that student matched-job presentation remains deterministic, visible-only, and separate from aggregate scoring and search behavior.
- Check that hidden vacancies and protected company data cannot leak through the matched-jobs list.
- Run `./scripts/aidlc-check.sh`.
