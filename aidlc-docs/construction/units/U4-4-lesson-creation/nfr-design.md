# NFR design: U4-4-lesson-creation

## How NFRs are addressed

- Security is addressed by treating lesson creation as a privileged authoring action aligned with the protected course-creation posture.
- Privacy is addressed by keeping lesson authoring separate from student-owned state and limiting the baseline to lesson-definition fields.
- Performance is addressed by focusing on responsive lesson-authoring interactions and predictable validation handling.
- Reliability is addressed through stable course-linked lesson creation outcomes and explicit ordering validation.
- Accessibility is addressed by requiring understandable form structure and clear authoring feedback states.
- Maintainability is addressed by keeping lesson creation separate from lesson viewing, progress, and completion while reusing platform baselines.

## Tradeoffs

- Defining only baseline lesson creation keeps the unit reviewable, but later units must add editing and richer content workflows deliberately.
- Requiring stable lesson ordering early improves later progress logic, though final authoring UX details remain for implementation.

## Monitoring

- Later implementation should monitor repeated lesson-authoring validation failures and unexpected protected-action errors.
- Later lesson and progress units should confirm they reuse the same lesson-ordering baseline rather than recalculating structure independently.

## Testing approach

- Review the unit against the requirements, security, data-model, RBAC, routing, and layout baselines.
- Check that lesson creation remains course-scoped and protected.
- Check that lesson ordering expectations are documented clearly.
- Run `./scripts/aidlc-check.sh`.
