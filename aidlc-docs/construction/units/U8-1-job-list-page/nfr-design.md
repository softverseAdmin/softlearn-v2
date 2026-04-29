# NFR design: U8-1-job-list-page

## How NFRs are addressed

- Security is addressed by requiring student-visible vacancy checks and preventing exposure of draft, removed, or unauthorized jobs.
- Privacy is addressed by keeping company non-public vacancy data controlled and excluding student-sensitive data entirely.
- Performance is addressed by focusing on responsive list reads and stable student browsing states.
- Reliability is addressed through consistent visible-vacancy rules and prevention of conflicting student list outcomes.
- Accessibility is addressed by requiring clear job summaries and understandable empty-state behavior.
- Maintainability is addressed by keeping the job list page separate from search controls, bookmarks, and matching while reusing existing vacancy and frontend baselines.

## Tradeoffs

- Keeping the job-list-page baseline high-level preserves flexibility for later implementation, but later teams must document exact pagination, ordering, and page-layout behavior clearly.
- Building on the visible vacancy baseline improves consistency, though later discovery UX still needs explicit design for search, filtering, and ranking.

## Monitoring

- Later implementation should monitor unauthorized vacancy exposure attempts, inconsistent student-visible list results, missing summary fields, and unusual empty-result patterns.
- Later search, bookmark, and matching units should confirm they consume the same visible job baseline rather than inventing alternate browseable vacancy sets.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that the student job list page remains stable, visibility-aware, and separate from search, bookmark, and matching behavior.
- Check that removed or unauthorized vacancies do not leak into student-visible job results.
- Run `./scripts/aidlc-check.sh`.
