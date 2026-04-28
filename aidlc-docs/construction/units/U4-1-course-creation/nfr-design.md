# NFR design: U4-1-course-creation

## How NFRs are addressed

- Security is addressed by treating course creation as a privileged protected action governed by authenticated admin-style access and deny-by-default rules.
- Privacy is addressed by keeping course authoring separate from student-private data and by limiting the baseline to course-definition fields only.
- Performance is addressed by focusing on a responsive authoring form with predictable validation handling.
- Reliability is addressed through stable validation outcomes and a clear persisted-course result after successful creation.
- Accessibility is addressed by requiring understandable form structure and clear validation and success states.
- Maintainability is addressed by keeping course creation separate from later listing, lesson, enrollment, and admin-management expansions while reusing platform baselines.

## Tradeoffs

- Keeping creation separate from broader management reduces drift, but it means later units must add editing and publication controls deliberately.
- Recommending a non-public initial state improves safety, though later publication workflows must make visibility transitions explicit.

## Monitoring

- Later implementation should monitor repeated validation failures and unexpected creation errors in protected authoring flows.
- Later admin-management units should confirm they extend the same course-authoring baseline rather than replacing it inconsistently.

## Testing approach

- Review the unit against the requirements, security, data-model, RBAC, API, routing, and layout baselines.
- Check that protected authoring boundaries are explicit.
- Check that course creation remains separate from later learning-consumption workflows.
- Run `./scripts/aidlc-check.sh`.
