# NFR design: U5-9-exam-retake-policy

## How NFRs are addressed

- Security is addressed by treating retake evaluation as a protected backend decision step with audit-friendly handling of rule-sensitive and history-sensitive inputs.
- Privacy is addressed by keeping retake-policy outcomes inside protected assessment boundaries and deferring outward visibility to later units.
- Performance is addressed by focusing on predictable eligibility timing and stable access-decision states.
- Reliability is addressed through deterministic rule application, duplicate-prevention, and consistent use of attempt-history inputs.
- Accessibility is addressed by requiring retake outcomes and unavailable-decision states to remain representable clearly in later user-facing contexts.
- Maintainability is addressed by keeping retake policy separate from history presentation, scoring, and company-facing visibility while reusing the shared exam-domain model.

## Tradeoffs

- Keeping retake policy high-level preserves flexibility for later implementation, but later teams must document exact cooldown, maximum-attempt, and exception rules explicitly.
- Requiring explicit history-aware rule-based decisions improves fairness and auditability, though it limits ad hoc operational overrides unless those are designed carefully later.

## Monitoring

- Later implementation should monitor missing eligibility inputs, failed retake evaluations, duplicate-decision attempts, and unusual override or reevaluation patterns.
- Later exam-access and visibility units should confirm they consume the same retake-policy baseline rather than inventing alternate eligibility rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, privacy, and exam-integrity baselines.
- Check that retake policy remains deterministic, protected, traceable, and separate from history presentation and company-facing visibility behavior.
- Check that rule-sensitive and history-sensitive inputs are not exposed through unauthorized paths.
- Run `./scripts/aidlc-check.sh`.
