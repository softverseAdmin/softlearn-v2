# NFR design: U5-8-exam-history

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership checks and audit-friendly handling of unauthorized history-access attempts.
- Privacy is addressed by treating exam history as protected student assessment data and deferring any outward sharing to later visibility units.
- Performance is addressed by focusing on responsive attempt-summary reads and stable detail access.
- Reliability is addressed through consistent attempt ownership, duplicate-prevention expectations, and stable structured history records.
- Accessibility is addressed by requiring clear attempt summaries, outcome labeling, and navigable history views.
- Maintainability is addressed by keeping exam history separate from retake policy and company-facing visibility while reusing existing frontend and exam baselines.

## Tradeoffs

- Keeping exam-history detail high-level preserves flexibility for later implementation, but later teams must define exact filtering, pagination, and detail-depth behavior explicitly.
- Treating history as student-owned protected data improves privacy and auditability, though later company-facing use cases must be designed carefully to avoid accidental overexposure.

## Monitoring

- Later implementation should monitor unauthorized history-access attempts, missing attempt-summary data, duplicate history records, and unusual read-failure patterns.
- Later retake and visibility units should confirm they consume the same protected history baseline rather than inventing alternate attempt-summary models.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, frontend, routing, and privacy baselines.
- Check that exam history remains protected, student-owned, and separate from retake and company-facing visibility behavior.
- Check that attempt summaries avoid exposing protected exam internals beyond allowed student-facing outcomes.
- Run `./scripts/aidlc-check.sh`.
