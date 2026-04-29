# NFR design: U6-4-privacy-filter-for-results

## How NFRs are addressed

- Security is addressed by requiring authenticated identity checks, company-boundary enforcement, approved access context, and audit-friendly handling of unauthorized result-access attempts.
- Privacy is addressed by making student privacy settings, consent posture, and explicit visibility rules the source of filtered result outcomes.
- Performance is addressed by focusing on predictable filter evaluation and stable visible, hidden, or partial outcomes.
- Reliability is addressed through deterministic filtering expectations and duplicate-prevention for the same result-sharing context.
- Accessibility is addressed by requiring filtered outcomes to remain clearly representable without leaking hidden data.
- Maintainability is addressed by keeping privacy filtering separate from company-view UI and readiness scoring while reusing existing privacy, learning, and exam baselines.

## Tradeoffs

- Keeping result filtering high-level preserves flexibility for later implementation, but later teams must define exact field-level matrices, exception paths, and support-review behavior explicitly.
- Defaulting to restricted outcomes improves privacy safety and auditability, though it may require later UX work to make hidden-data states clear to company users.

## Monitoring

- Later implementation should monitor unauthorized result-access attempts, inconsistent filter outcomes, missing consent-state data, and unusual visibility-decision patterns.
- Later company-view and readiness units should confirm they consume the same filtered-result baseline rather than inventing alternate visibility rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, privacy, consent, and company-boundary baselines.
- Check that result privacy filtering remains deterministic, protected, auditable, and separate from company-view UI detail and readiness behavior.
- Check that hidden learning and exam result data cannot leak through filtered responses.
- Run `./scripts/aidlc-check.sh`.
