# NFR design: U6-2-student-exam-results-summary

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership checks and audit-friendly handling of unauthorized exam-results-summary access attempts.
- Privacy is addressed by treating exam-results summary as protected student assessment data and deferring any outward sharing to later visibility units.
- Performance is addressed by focusing on responsive summary reads and stable access to exam outcome evidence.
- Reliability is addressed through consistent ownership, duplicate-prevention expectations, and stable structured summary records.
- Accessibility is addressed by requiring clear score and pass/fail labels plus navigable summary views.
- Maintainability is addressed by keeping student exam-results summary separate from company-facing visibility, privacy filtering, and readiness scoring while reusing existing exam and frontend baselines.

## Tradeoffs

- Keeping exam-results-summary detail high-level preserves flexibility for later implementation, but later teams must define exact filtering, aggregation, and richer detail behavior explicitly.
- Treating exam-results summary as student-owned protected data improves privacy and auditability, though later company-facing use cases must be designed carefully to avoid accidental overexposure.

## Monitoring

- Later implementation should monitor unauthorized exam-results-summary access attempts, missing summary data, duplicate summary records, and unusual read-failure patterns.
- Later visibility and readiness units should confirm they consume the same protected exam-results-summary baseline rather than inventing alternate assessment-summary models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, frontend, routing, and privacy baselines.
- Check that student exam-results summary remains protected, student-owned, and separate from company-facing visibility, privacy filtering, and readiness behavior.
- Check that summary views avoid exposing protected data beyond allowed student-facing assessment evidence.
- Run `./scripts/aidlc-check.sh`.
