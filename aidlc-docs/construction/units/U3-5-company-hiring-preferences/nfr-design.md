# NFR design: U3-5-company-hiring-preferences

## How NFRs are addressed

- Security is addressed by requiring authenticated company access, company-boundary-scoped self-service behavior, and protected update handling aligned with the shared auth model.
- Privacy is addressed by limiting this unit to the company’s own structured hiring-default data and preventing cross-company access.
- Performance is addressed by keeping the preference scope narrow and by avoiding unnecessary cross-app state duplication.
- Reliability is addressed through explicit read, update, validation-error, and unexpected-error outcomes.
- Accessibility is addressed by requiring clear form structure and user-presentable validation and success feedback.
- Maintainability is addressed by keeping the unit focused on company-level hiring defaults while reusing the existing frontend, routing, and API-aligned patterns.

## Tradeoffs

- A dedicated hiring-preferences unit improves reviewability and keeps company defaults distinct from vacancy-specific requirements, but it requires later company and vacancy flows to compose several subdomains.
- Structured preference records improve consistency across later workflows, though richer preference models may require later refinement.
- Keeping most editable preference state local to the feature improves clarity, though later vacancy-setup or dashboard surfaces may still need carefully scoped derived preference summaries.

## Monitoring

- Later implementation should monitor preference load failures, repeated validation errors, and update success/failure rates.
- Later vacancy and candidate-review units should confirm that new behaviors extend this baseline without weakening company-boundary rules.
- Any future change that broadens company-level preference scope significantly should be reviewed explicitly to avoid overlapping later units.

## Testing approach

- Review the unit against the auth, RBAC, routing, layout, state, and company-profile baselines.
- Check that hiring preferences, company-boundary ownership, and update outcomes are all covered.
- Check that the unit stays separate from vacancy-specific requirement and candidate-review logic.
- Run `./scripts/aidlc-check.sh`.
