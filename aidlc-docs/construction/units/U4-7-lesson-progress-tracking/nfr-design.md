# NFR design: U4-7-lesson-progress-tracking

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership for lesson-progress reads and writes and by denying unauthorized access by default.
- Privacy is addressed by treating lesson progress as protected student learning data that must not leak through broader discovery or company-facing flows.
- Performance is addressed by focusing on responsive progress reads and writes that fit naturally into lesson participation.
- Reliability is addressed through deterministic lesson-progress records, duplicate-prevention expectations, and stable validation outcomes.
- Accessibility is addressed by requiring understandable progress feedback and avoiding reliance on inaccessible interaction patterns.
- Maintainability is addressed by keeping lesson progress separate from course completion and analytics while reusing shared platform baselines.

## Tradeoffs

- Keeping the progress model high-level preserves flexibility for later UX choices, but implementation must choose a concrete deterministic state model and document it clearly.
- Treating lesson progress as protected data strengthens privacy, though later visibility features must explicitly govern any derived sharing.

## Monitoring

- Later implementation should monitor failed progress writes, repeated invalid transitions, and unexpected ownership violations.
- Later completion and readiness units should confirm they derive from the same lesson-progress baseline rather than bypassing it.

## Testing approach

- Review the unit against the requirements, security, data-model, RBAC, routing, and layout baselines.
- Check that student ownership and duplicate-prevention expectations are explicit.
- Check that lesson progress remains separate from course-completion logic.
- Run `./scripts/aidlc-check.sh`.
