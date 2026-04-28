# NFR design: U3-3-company-profile-basic

## How NFRs are addressed

- Security is addressed by requiring authenticated company access, company-boundary-scoped self-service behavior, and protected update handling aligned with the shared auth model.
- Privacy is addressed by limiting this unit to the company’s own core profile fields and preventing cross-company access.
- Performance is addressed by keeping the profile scope narrow and by avoiding unnecessary cross-app state duplication.
- Reliability is addressed through explicit read, update, validation-error, and unexpected-error outcomes.
- Accessibility is addressed by requiring clear form structure and user-presentable validation and success feedback.
- Maintainability is addressed by keeping the unit focused on basic company profile fields while reusing the existing frontend, routing, and API baselines.

## Tradeoffs

- A narrow company basic-profile unit is easier to implement and review, but it means later units must extend the company profile gradually rather than trying to solve everything at once.
- Reusing the same company profile endpoint for both read and update keeps the model simple, but later units must stay disciplined about field scope.
- Keeping most editable field state local to the profile screen improves clarity, though later shell or dashboard views may still need carefully scoped derived company summary state.

## Monitoring

- Later implementation should monitor profile load failures, repeated validation errors, and update success/failure rates.
- Later company-detail units should confirm that new fields extend this baseline without weakening company-boundary rules.
- Any future change that broadens company basic-profile scope significantly should be reviewed explicitly to avoid overlapping later units.

## Testing approach

- Review the unit against the API, auth, RBAC, routing, layout, and frontend-state baselines.
- Check that core company profile fields, company-boundary ownership, and update outcomes are all covered.
- Check that the unit stays separate from description, hiring preferences, and company-user management units.
- Run `./scripts/aidlc-check.sh`.
