# NFR design: U8-2-job-search-bar

## How NFRs are addressed

- Security is addressed by constraining query results to the visible student job set and preventing hidden vacancy exposure.
- Privacy is addressed by keeping non-public company vacancy data controlled even when search terms overlap hidden records.
- Performance is addressed by focusing on responsive query interactions and predictable searched or cleared result states.
- Reliability is addressed through consistent query-result expectations on the same visible job set.
- Accessibility is addressed by requiring clear search input behavior, clear-query actions, and understandable no-match states.
- Maintainability is addressed by keeping the job search bar separate from structured filters, bookmarks, and matching while reusing existing job-list and frontend baselines.

## Tradeoffs

- Keeping search-bar behavior high-level preserves flexibility for later implementation, but later teams must document exact match fields, debounce rules, and query normalization clearly.
- Reusing the visible job baseline improves consistency, though later search UX still needs explicit design for ranking and combined filter behavior.

## Monitoring

- Later implementation should monitor unusual no-result patterns, hidden-vacancy exposure attempts, malformed query handling, and inconsistent query-state transitions.
- Later filter, bookmark, and matching units should confirm they consume the same searched visible-job baseline rather than inventing alternate result sets.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that the job search bar remains stable, visibility-aware, and separate from structured filters, bookmarks, and matching behavior.
- Check that hidden or removed vacancies do not leak into searched results.
- Run `./scripts/aidlc-check.sh`.
