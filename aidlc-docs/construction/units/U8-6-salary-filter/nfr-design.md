# NFR design: U8-6-salary-filter

## How NFRs are addressed

- Security is addressed by constraining salary-filter results to the visible student job set and preventing hidden vacancy exposure.
- Privacy is addressed by keeping non-public company compensation data controlled outside allowed student-visible contexts.
- Performance is addressed by focusing on responsive salary-filter interactions and predictable filtered-result states.
- Reliability is addressed through consistent filter-result expectations on the same visible job set and selected salary criteria.
- Accessibility is addressed by requiring clear salary-filter controls, clear actions, and understandable no-match states.
- Maintainability is addressed by keeping the salary filter separate from other filters, bookmarks, and matching while reusing existing job-list baselines.

## Tradeoffs

- Keeping salary-filter behavior high-level preserves flexibility for later implementation, but later teams must document exact salary normalization, currency handling, and missing-data behavior clearly.
- Supporting salary-aware filtering improves job-search usefulness, though later vacancy-domain work may need to refine exactly which compensation fields are visible and searchable.

## Monitoring

- Later implementation should monitor malformed salary-filter inputs, hidden-vacancy exposure attempts, unusual missing-salary patterns, and inconsistent filter-state transitions.
- Later bookmark and matching units should confirm they consume the same filtered visible-job baseline rather than inventing alternate salary-filtered result sets.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that the salary filter remains stable, visibility-aware, and separate from other filters, bookmarks, and matching behavior.
- Check that hidden or removed vacancies do not leak into salary-filtered results.
- Run `./scripts/aidlc-check.sh`.
