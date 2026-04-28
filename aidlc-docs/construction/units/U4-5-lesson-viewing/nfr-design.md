# NFR design: U4-5-lesson-viewing

## How NFRs are addressed

- Security is addressed by making lesson content deny-by-default and by requiring approved student access before lesson payloads are exposed.
- Privacy is addressed by keeping the baseline centered on lesson content rather than broader student-private learning-state records.
- Performance is addressed by focusing on responsive lesson loads and understandable navigation between lessons.
- Reliability is addressed through stable outcomes for authorized, unauthorized, missing, and unexpected-error lesson reads.
- Accessibility is addressed by requiring readable lesson structure and clear route navigation.
- Maintainability is addressed by keeping lesson viewing separate from enrollment, progress, and completion while reusing shared platform baselines.

## Tradeoffs

- Deferring the exact authorization source keeps this unit aligned with the roadmap, but later enrollment implementation must make lesson-access rules explicit.
- Keeping progress writes out of the viewing unit reduces coupling, though later progress tracking must integrate carefully with the lesson experience.

## Monitoring

- Later implementation should monitor unauthorized lesson-access attempts and repeated lesson-load failures.
- Later learning units should confirm they reuse the same lesson sequencing and access posture rather than redefining them independently.

## Testing approach

- Review the unit against the requirements, security, data-model, routing, and layout baselines.
- Check that lesson access remains protected and deny-by-default.
- Check that lesson-viewing behavior remains separate from enrollment and progress updates.
- Run `./scripts/aidlc-check.sh`.
