# NFR design: U7-4-vacancy-list

## How NFRs are addressed

- Security is addressed by requiring context-appropriate visibility checks and audit-friendly handling of unauthorized vacancy exposure attempts.
- Privacy is addressed by preserving controlled visibility for company-owned non-public vacancies and excluding student data entirely.
- Performance is addressed by focusing on responsive list reads and stable empty or visible result states.
- Reliability is addressed through consistent active-vacancy rules, ordering posture, and prevention of conflicting list outcomes.
- Accessibility is addressed by requiring clear vacancy summaries and understandable empty-state behavior.
- Maintainability is addressed by keeping vacancy listing separate from detail, filters, applications, and matching while reusing existing vacancy and routing baselines.

## Tradeoffs

- Keeping vacancy-list behavior high-level preserves flexibility for later implementation, but later teams must document exact ordering, pagination, and context-specific visibility rules clearly.
- Supporting both company-management and later discovery contexts improves reuse, though later UX units must still define distinct route and filter behavior explicitly.

## Monitoring

- Later implementation should monitor unauthorized vacancy exposure attempts, inconsistent active-state list results, missing summary fields, and unusual empty-result patterns.
- Later detail, search, and matching units should confirm they consume the same visible-vacancy baseline rather than inventing alternate vacancy sets.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that vacancy listing remains stable, context-aware, and separate from detail, search, and matching behavior.
- Check that removed or unauthorized vacancies do not leak into visible list results.
- Run `./scripts/aidlc-check.sh`.
