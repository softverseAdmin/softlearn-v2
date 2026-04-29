# NFR design: U5-2-question-creation

## How NFRs are addressed

- Security is addressed by requiring protected, role-approved question authoring and audit-friendly handling of question-definition changes.
- Privacy is addressed by keeping question creation separate from student attempts, results, and later company-visible outcomes.
- Performance is addressed by focusing on responsive protected authoring flows and predictable validation feedback.
- Reliability is addressed through stable creation outcomes, exam-link integrity, and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear form structure and understandable validation and authoring-state feedback.
- Maintainability is addressed by keeping question creation separate from later answer-option, delivery, scoring, and results units while reusing existing platform baselines.

## Tradeoffs

- Keeping the question-definition model high-level preserves flexibility for later implementation, but later teams must document the exact supported question-type behaviors clearly.
- Enforcing protected authoring and exam-linked validation improves integrity and operational control, though later editing workflows must be defined explicitly.

## Monitoring

- Later implementation should monitor failed question-definition validations, unauthorized authoring attempts, invalid exam references, and audit events for question-configuration changes.
- Later answer-option, exam-taking, and scoring units should confirm they consume the same question baseline rather than inventing alternate question identifiers or visibility rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, routing, and admin-protection baselines.
- Check that question creation remains protected, exam-linked, auditable, and separate from answer-options, submission, and scoring behavior.
- Check that student and company access are excluded from authoring behavior.
- Run `./scripts/aidlc-check.sh`.
