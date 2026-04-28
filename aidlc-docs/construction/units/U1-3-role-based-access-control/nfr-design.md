# NFR design: U1-3-role-based-access-control

## How NFRs are addressed

- Security is addressed through deny-by-default authorization, explicit role categories, ownership and company-boundary checks, and the requirement that privacy-sensitive actions apply extra policy checks instead of relying on role alone.
- Privacy is addressed by treating RBAC as one layer in the access decision, with visibility and consent rules still required for student-sensitive data.
- Performance is addressed by defining a consistent authorization decision order that later units can reuse without bespoke checks everywhere.
- Reliability is addressed by requiring stable, repeatable authorization outcomes for the same role and context.
- Accessibility is addressed by expecting authorization failures to map cleanly to understandable UI states and messages.
- Maintainability is addressed by separating authentication, RBAC, privacy policy, and domain logic into distinct responsibilities.

## Tradeoffs

- A simple baseline role model is easier to apply consistently now, but some fine-grained capabilities are intentionally deferred to later privacy, consent, and admin units.
- Deny-by-default improves security, but it requires careful review so legitimate workflows are not accidentally blocked in later feature units.
- Keeping admin access scoped and policy-bound adds design complexity, but it better matches the platform’s privacy and audit requirements.

## Monitoring

- Later implementation should log denied privileged actions, company access to protected student data, consent-sensitive visibility decisions, and admin actions affecting sensitive records.
- Later domain units should show how their authorization checks map back to these baseline role categories.
- Any change that broadens role permissions after this baseline should be reviewed explicitly and, if it changes accepted behavior, tracked with CHG.

## Testing approach

- Review the role model against inception requirements, architecture, and security baseline documents.
- Check that student, company, and admin permissions are separated clearly.
- Check that ownership, organization boundary, and policy-gated access are all present.
- Confirm the unit does not treat authentication alone as sufficient authorization.
- Run `./scripts/aidlc-check.sh`.
