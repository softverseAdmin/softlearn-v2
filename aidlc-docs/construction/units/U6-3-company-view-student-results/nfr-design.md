# NFR design: U6-3-company-view-student-results

## How NFRs are addressed

- Security is addressed by requiring authenticated company identity checks, company-boundary enforcement, approved review context, and audit-friendly handling of unauthorized access attempts.
- Privacy is addressed by treating company-visible results as a filtered subset of protected student data and deferring exact filter logic to the dedicated privacy-filter unit.
- Performance is addressed by focusing on responsive company-side summary reads and stable visible or no-access outcomes.
- Reliability is addressed through consistent authorization and visibility inputs plus stable structured result-view records.
- Accessibility is addressed by requiring clear company-visible result labels, hidden-data handling, and navigable review views.
- Maintainability is addressed by keeping company result access separate from privacy-filter rule definition and readiness scoring while reusing existing privacy, learning, and exam baselines.

## Tradeoffs

- Keeping company-visible result detail high-level preserves flexibility for later implementation, but later teams must define exact workflow entry points, field-level visibility, and detail depth explicitly.
- Treating company access as filtered and context-bound improves privacy and auditability, though it requires later teams to document authorization and consent interactions carefully.

## Monitoring

- Later implementation should monitor unauthorized company result-access attempts, inconsistent visibility outcomes, missing authorized result data, and unusual cross-company access patterns.
- Later privacy-filter and readiness units should confirm they consume the same protected company-access baseline rather than inventing alternate company result-view models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, privacy, routing, and company-boundary baselines.
- Check that company-side student results remain protected, consent-aware, and separate from privacy-filter rule definition and readiness behavior.
- Check that result views avoid exposing hidden learning or exam data beyond the allowed company-facing summary.
- Run `./scripts/aidlc-check.sh`.
