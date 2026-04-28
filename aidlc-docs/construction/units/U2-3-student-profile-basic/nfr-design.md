# NFR design: U2-3-student-profile-basic

## How NFRs are addressed

- Security is addressed by requiring authenticated student access, ownership-scoped self-service behavior, and protected update handling aligned with the shared auth model.
- Privacy is addressed by limiting this unit to the student’s own basic profile fields and deferring broader visibility concerns to later privacy units.
- Performance is addressed by keeping the basic profile scope narrow and by avoiding unnecessary cross-app state duplication.
- Reliability is addressed through explicit read, update, validation-error, and unexpected-error outcomes.
- Accessibility is addressed by requiring clear form structure and user-presentable validation and success feedback.
- Maintainability is addressed by keeping the unit focused on basic profile fields while reusing the existing frontend, routing, and API baselines.

## Tradeoffs

- A narrow basic profile unit is easier to implement and review, but it means later units must extend the student profile gradually rather than trying to solve everything at once.
- Reusing the same student profile endpoint for both read and update keeps the model simple, but later units must stay disciplined about field scope.
- Keeping most editable field state local to the profile screen improves clarity, though it requires later units to justify any shared-profile state carefully.

## Monitoring

- Later implementation should monitor profile load failures, repeated validation errors, and update success/failure rates.
- Later privacy and student-detail units should confirm that new fields extend this baseline without weakening ownership or visibility rules.
- Any future change that broadens basic-profile scope significantly should be reviewed explicitly to avoid overlapping later units.

## Testing approach

- Review the unit against the API, auth, RBAC, routing, layout, and frontend-state baselines.
- Check that basic profile fields, self-service ownership, and update outcomes are all covered.
- Check that the unit stays separate from later skills, education, experience, resume, and privacy units.
- Run `./scripts/aidlc-check.sh`.
