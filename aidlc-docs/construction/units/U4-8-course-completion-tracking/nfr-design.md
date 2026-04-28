# NFR design: U4-8-course-completion-tracking

## How NFRs are addressed

- Security is addressed by treating course completion as protected student learning evidence governed by ownership, policy, and audit-friendly access boundaries.
- Privacy is addressed by explicitly preventing downstream sharing from bypassing later consent and visibility rules.
- Performance is addressed by focusing on responsive completion-state reads and understandable completion feedback.
- Reliability is addressed through deterministic completion derivation from lesson-progress state and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear representation of completion and non-completion states.
- Maintainability is addressed by keeping completion separate from certificates, readiness scoring, and company-facing exposure while reusing existing learning and privacy baselines.

## Tradeoffs

- Keeping completion derivation high-level preserves flexibility for implementation, but later teams must document the exact deterministic rule set clearly.
- Treating completion as protected evidence improves privacy and future auditability, though later company-facing features must explicitly govern what may be shared.

## Monitoring

- Later implementation should monitor failed completion evaluations, conflicting source-state conditions, and unauthorized access attempts.
- Later readiness and visibility units should confirm they consume the same completion baseline rather than inventing alternate course-finished signals.

## Testing approach

- Review the unit against the requirements, security, data-model, privacy, routing, and lesson-progress baselines.
- Check that completion remains deterministic and enrollment-linked.
- Check that completion remains separate from readiness scoring and company-facing visibility behavior.
- Run `./scripts/aidlc-check.sh`.
