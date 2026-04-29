# NFR design: U6-1-student-learning-summary

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership checks and audit-friendly handling of unauthorized learning-summary access attempts.
- Privacy is addressed by treating learning summary as protected student learning data and deferring any outward sharing to later visibility units.
- Performance is addressed by focusing on responsive summary reads and stable access to course participation evidence.
- Reliability is addressed through consistent ownership, duplicate-prevention expectations, and stable structured summary records.
- Accessibility is addressed by requiring clear progress and completion labels plus navigable summary views.
- Maintainability is addressed by keeping student learning summary separate from exam results, company-facing visibility, and readiness scoring while reusing existing learning and frontend baselines.

## Tradeoffs

- Keeping learning-summary detail high-level preserves flexibility for later implementation, but later teams must define exact filtering, pagination, and richer aggregation behavior explicitly.
- Treating learning summary as student-owned protected data improves privacy and auditability, though later company-facing use cases must be designed carefully to avoid accidental overexposure.

## Monitoring

- Later implementation should monitor unauthorized learning-summary access attempts, missing summary data, duplicate summary records, and unusual read-failure patterns.
- Later visibility and readiness units should confirm they consume the same protected learning-summary baseline rather than inventing alternate learning-evidence summary models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, frontend, routing, and privacy baselines.
- Check that student learning summary remains protected, student-owned, and separate from exam-result, company-visibility, and readiness behavior.
- Check that summary views avoid exposing protected data beyond allowed student-facing learning evidence.
- Run `./scripts/aidlc-check.sh`.
