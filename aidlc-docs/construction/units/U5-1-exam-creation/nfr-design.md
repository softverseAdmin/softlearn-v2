# NFR design: U5-1-exam-creation

## How NFRs are addressed

- Security is addressed by requiring protected, role-approved exam authoring and audit-friendly handling of exam-configuration changes.
- Privacy is addressed by keeping exam creation separate from student attempts, results, and later company-visible outcomes.
- Performance is addressed by focusing on responsive protected authoring flows and predictable validation feedback.
- Reliability is addressed through stable creation outcomes and duplicate-prevention expectations for exam identity.
- Accessibility is addressed by requiring clear form structure and understandable validation and draft-state feedback.
- Maintainability is addressed by keeping exam creation separate from later question, delivery, scoring, and results units while reusing existing platform baselines.

## Tradeoffs

- Keeping the exam-definition model high-level preserves flexibility for later implementation, but later teams must document the exact required metadata and lifecycle fields clearly.
- Enforcing a draft-first, protected authoring posture improves integrity and operational control, though later publication workflows must be defined explicitly.

## Monitoring

- Later implementation should monitor failed exam-definition validations, unauthorized authoring attempts, and audit events for exam-configuration changes.
- Later exam-taking and scoring units should confirm they consume the same exam baseline rather than inventing alternate exam identifiers or visibility rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, routing, and admin-protection baselines.
- Check that exam creation remains protected, auditable, and separate from question, attempt, and scoring behavior.
- Check that student and company access are excluded from authoring behavior.
- Run `./scripts/aidlc-check.sh`.
