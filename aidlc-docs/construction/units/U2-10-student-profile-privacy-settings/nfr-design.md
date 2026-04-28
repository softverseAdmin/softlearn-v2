# NFR design: U2-10-student-profile-privacy-settings

## How NFRs are addressed

- Security is addressed by authenticated self-service ownership, explicit rejection of unauthorized privacy changes, and policy-bound company or admin access.
- Privacy is addressed by making visibility control explicit, consent-aware, and traceable for profile and exam-result sharing.
- Performance is addressed by keeping privacy-management scope narrow and by requiring predictable updates to effective visibility state.
- Reliability is addressed through stable handling of privacy transitions and alignment between current privacy state, consent history, and later access decisions.
- Accessibility is addressed by requiring understandable visibility language, clear effect descriptions, and unambiguous success or warning feedback.
- Maintainability is addressed by keeping this unit focused on student privacy configuration while leaving deeper company-review and override mechanics to later units.

## Tradeoffs

- Explicit student-controlled privacy settings improve trust and auditability, but they require later company-facing features to respect more nuanced visibility states.
- Separating current privacy state from consent-event history improves traceability, though it adds conceptual complexity compared with a single simple flag.
- Deferring fine-grained field-level matrices keeps this unit reviewable, but later visibility units must complete that detail carefully without contradicting this baseline.

## Monitoring

- Later implementation should monitor failed privacy updates, consent-log creation failures, and mismatches between effective privacy state and company-visible outcomes.
- Later privacy and audit reviews should confirm that company access to protected student data remains explainable and policy-gated.
- Any future override or exception path should be reviewed explicitly to ensure it preserves auditability and least-privilege behavior.

## Testing approach

- Review the unit against the requirements, security, data-model, RBAC, and student-profile baselines.
- Check that profile and exam-result visibility controls, consent recording expectations, and auditability expectations are all covered.
- Check that the unit stays separate from later field-level visibility and override-policy detail.
- Run `./scripts/aidlc-check.sh`.
