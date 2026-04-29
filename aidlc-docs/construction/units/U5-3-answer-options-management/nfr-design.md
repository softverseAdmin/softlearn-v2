# NFR design: U5-3-answer-options-management

## How NFRs are addressed

- Security is addressed by requiring protected, role-approved answer-option authoring and audit-friendly handling of correctness-sensitive configuration changes.
- Privacy is addressed by keeping answer-options management separate from student attempts, results, and later company-visible outcomes while protecting correctness details.
- Performance is addressed by focusing on responsive protected authoring flows and predictable validation feedback.
- Reliability is addressed through stable option-set outcomes, question-link integrity, and duplicate-prevention expectations.
- Accessibility is addressed by requiring clear management controls and understandable validation, ordering, and saved-state feedback.
- Maintainability is addressed by keeping answer-options management separate from later delivery, submission, scoring, and results units while reusing existing platform baselines.

## Tradeoffs

- Keeping answer-options management high-level preserves flexibility for later implementation, but later teams must document the exact handling of question types, correctness metadata, and removal rules clearly.
- Protecting correctness-sensitive metadata improves integrity and operational control, though later authoring UX needs explicit design to avoid admin mistakes.

## Monitoring

- Later implementation should monitor failed option-set validations, unauthorized authoring attempts, invalid question references, and audit events for correctness-sensitive changes.
- Later exam-taking, submission, and scoring units should confirm they consume the same answer-option baseline rather than inventing alternate option identifiers or correctness rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, routing, and admin-protection baselines.
- Check that answer-options management remains protected, question-linked, auditable, and separate from exam-taking, submission, and scoring behavior.
- Check that student and company access are excluded from authoring behavior.
- Run `./scripts/aidlc-check.sh`.
