# NFR design: U1-4-base-api-structure

## How NFRs are addressed

- Security is addressed through JWT bearer auth, explicit role boundaries, and a standard error format that avoids internal leakage.
- Privacy is addressed by clearly separating student-only and company-only access and by keeping matching outputs rule-based and permission-aware.
- Performance is addressed by keeping endpoints resource-oriented and response bodies focused on practical client needs.
- Reliability is addressed through a consistent `/api/v1/` prefix, common success/error envelopes, and predictable endpoint semantics.
- Accessibility is addressed indirectly by requiring understandable explanation and error payloads that UI layers can present clearly.
- Maintainability is addressed through versioning, consistent naming, and domain-based endpoint grouping.

## Tradeoffs

- JWT is defined here because the user requested a token-based API contract, even though final auth implementation details may still be refined during backend implementation.
- The contract avoids overdesigning admin APIs in this unit so the main student and company flows stay clear.
- The endpoint set is practical and implementation-ready, but some details such as pagination conventions and refresh-token policy are intentionally deferred.

## Monitoring

- Later backend units should validate that implemented routes still match these endpoint names and response shapes.
- Later auth and RBAC units should confirm that JWT handling and authorization rules remain aligned with the security design.
- API changes after this baseline should be tracked explicitly to avoid frontend/backend drift.

## Testing approach

- Review endpoint coverage against the required domains.
- Check request/response consistency across the contract.
- Check that student-only and company-only rules are explicit.
- Check that matching endpoints remain rule-based.
- Run `./scripts/aidlc-check.sh`.
