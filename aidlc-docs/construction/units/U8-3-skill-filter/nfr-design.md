# NFR design: U8-3-skill-filter

## How NFRs are addressed

- Security is addressed by constraining skill-filter results to the visible student job set and preventing hidden vacancy exposure.
- Privacy is addressed by keeping non-public company vacancy skill data controlled outside allowed student-visible contexts.
- Performance is addressed by focusing on responsive structured filter interactions and predictable filtered-result states.
- Reliability is addressed through consistent filter-result expectations on the same visible job set and selected skills.
- Accessibility is addressed by requiring clear skill-filter controls, clear actions, and understandable no-match states.
- Maintainability is addressed by keeping the skill filter separate from other filters, bookmarks, and matching while reusing existing job-list and taxonomy baselines.

## Tradeoffs

- Keeping skill-filter behavior high-level preserves flexibility for later implementation, but later teams must document exact multi-select, required-versus-preferred handling, and taxonomy UX clearly.
- Reusing the structured skill taxonomy improves consistency, though later discovery UX still needs explicit design for combined filter behavior.

## Monitoring

- Later implementation should monitor invalid skill-filter inputs, hidden-vacancy exposure attempts, unusual no-result patterns, and inconsistent filter-state transitions.
- Later bookmark and matching units should confirm they consume the same filtered visible-job baseline rather than inventing alternate skill-filtered result sets.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that the skill filter remains stable, visibility-aware, and separate from other filters, bookmarks, and matching behavior.
- Check that hidden or removed vacancies do not leak into skill-filtered results.
- Run `./scripts/aidlc-check.sh`.
