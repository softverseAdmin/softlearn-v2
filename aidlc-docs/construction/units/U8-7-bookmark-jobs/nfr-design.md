# NFR design: U8-7-bookmark-jobs

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership, visible-job eligibility checks, and prevention of bookmarking hidden vacancies.
- Privacy is addressed by treating bookmarks as protected student preference data unavailable to companies or other students.
- Performance is addressed by focusing on responsive save and unsave actions with predictable bookmark-state feedback.
- Reliability is addressed through stable bookmark outcomes and duplicate-prevention for the same student and job.
- Accessibility is addressed by requiring clear bookmark controls and understandable saved-state feedback.
- Maintainability is addressed by keeping bookmarking separate from applications, recommendations, and matching while reusing existing student discovery baselines.

## Tradeoffs

- Keeping bookmark behavior high-level preserves flexibility for later implementation, but later teams must document exact saved-job list behavior, ordering, and cross-page bookmark synchronization clearly.
- Treating bookmarks as protected student-owned state improves privacy and clarity, though later product teams must be careful if they want to reuse bookmarks as downstream signals.

## Monitoring

- Later implementation should monitor duplicate bookmark attempts, hidden-vacancy bookmark attempts, unusual save or unsave failure patterns, and inconsistent saved-state transitions.
- Later application and matching units should confirm they consume the same student-owned bookmark baseline rather than inventing alternate saved-job models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that bookmarking remains protected, student-owned, and separate from applications and matching behavior.
- Check that hidden or removed vacancies cannot leak into bookmark state through this baseline.
- Run `./scripts/aidlc-check.sh`.
