# NFR design: U7-5-vacancy-detail

## How NFRs are addressed

- Security is addressed by requiring context-appropriate visibility checks and audit-friendly handling of unauthorized vacancy-detail exposure attempts.
- Privacy is addressed by preserving controlled visibility for company-owned non-public vacancy detail and excluding student data entirely.
- Performance is addressed by focusing on responsive detail reads and stable visible or unavailable states.
- Reliability is addressed through consistent active-vacancy rules, detail-shape expectations, and prevention of conflicting detail outcomes.
- Accessibility is addressed by requiring clear structured field presentation and understandable hidden or removed-state behavior.
- Maintainability is addressed by keeping vacancy detail separate from search, applications, bookmarks, and matching while reusing existing vacancy and routing baselines.

## Tradeoffs

- Keeping vacancy-detail behavior high-level preserves flexibility for later implementation, but later teams must document exact field density, related sections, and context-specific visibility rules clearly.
- Supporting both company-management and later discovery contexts improves reuse, though later UX units must still define distinct route and interaction behavior explicitly.

## Monitoring

- Later implementation should monitor unauthorized vacancy-detail exposure attempts, inconsistent visible-state outcomes, missing detail fields, and unusual not-found patterns.
- Later search, application, and matching units should confirm they consume the same visible-vacancy detail baseline rather than inventing alternate detail records.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Check that vacancy detail remains stable, context-aware, and separate from search, applications, bookmarks, and matching behavior.
- Check that removed or unauthorized vacancies do not leak into visible detail outcomes.
- Run `./scripts/aidlc-check.sh`.
