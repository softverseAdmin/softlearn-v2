# NFR design: U3-6-company-user-management

## How NFRs are addressed

- Security is addressed by requiring authenticated company access with appropriate member scope, company-boundary checks, and protected update handling aligned with the shared auth and RBAC models.
- Privacy is addressed by limiting this unit to the company’s own member data and preventing cross-company access.
- Performance is addressed by keeping membership-management scope narrow and by avoiding unnecessary cross-app state duplication.
- Reliability is addressed through explicit list, add, update, deactivate, remove, validation-error, and unexpected-error outcomes.
- Accessibility is addressed by requiring clear list and form structure plus user-presentable validation and success feedback.
- Maintainability is addressed by keeping the unit focused on company membership management while reusing the existing frontend, routing, and company-boundary patterns.

## Tradeoffs

- A dedicated company user-management unit improves reviewability and makes company membership explicit, but it requires later company workflows to respect more nuanced member roles and scopes.
- Allowing company-scoped member management improves operational flexibility, though later implementation must carefully define who is allowed to manage which member actions.
- Keeping most editable membership state local to the feature improves clarity, though later dashboards or audit surfaces may still need carefully scoped derived membership summaries.

## Monitoring

- Later implementation should monitor company-member load failures, repeated validation errors, duplicate-member creation attempts, and unexpected removal or deactivation failures.
- Later audit and company workflow units should confirm they extend this baseline without weakening company-boundary or role-scope rules.
- Any future change that broadens company-member powers significantly should be reviewed explicitly to avoid overlapping admin behavior.

## Testing approach

- Review the unit against the auth, RBAC, routing, layout, state, and company-profile baselines.
- Check that company membership management, company-boundary ownership, and role-scope behavior are all covered.
- Check that the unit stays separate from public registration, admin override, and enterprise-IAM concerns.
- Run `./scripts/aidlc-check.sh`.
