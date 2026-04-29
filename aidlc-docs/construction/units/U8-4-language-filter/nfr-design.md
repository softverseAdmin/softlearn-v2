# NFR design: U8-4-language-filter

## How NFRs are addressed

- Security is addressed by constraining language-filter results to the visible student job set and preventing hidden vacancy exposure.
- Privacy is addressed by keeping non-public company vacancy language data controlled outside allowed student-visible contexts.
- Performance is addressed by focusing on responsive structured filter interactions and predictable filtered-result states.
- Reliability is addressed through consistent filter-result expectations on the same visible job set and selected language criteria.
- Accessibility is addressed by requiring clear language-filter controls, clear actions, and understandable no-match states.
- Maintainability is addressed by keeping the language filter separate from other filters, bookmarks, and matching while reusing existing job-list and shared-language-model baselines.

## Tradeoffs

- Keeping language-filter behavior high-level preserves flexibility for later implementation, but later teams must document exact minimum-level, multi-select, and level-comparison behavior clearly.
- Reusing the shared language-level model improves consistency, though later discovery UX still needs explicit design for combined filter behavior.

## Monitoring

- Later implementation should monitor invalid language-filter inputs, hidden-vacancy exposure attempts, unusual no-result patterns, and inconsistent filter-state transitions.
- Later bookmark and matching units should confirm they consume the same filtered visible-job baseline rather than inventing alternate language-filtered result sets.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that the language filter remains stable, visibility-aware, and separate from other filters, bookmarks, and matching behavior.
- Check that hidden or removed vacancies do not leak into language-filtered results.
- Run `./scripts/aidlc-check.sh`.
