# NFR design: U2-7-student-profile-language-level

## How NFRs are addressed

- Security is addressed by authenticated self-service ownership, protected-write handling, and explicit rejection of unauthorized or malformed language changes.
- Privacy is addressed by treating student language levels as protected student data and limiting this unit to the student’s own management flow.
- Performance is addressed by keeping the language-management scope narrow and by avoiding unnecessary global-state dependence for feature-local editing.
- Reliability is addressed through stable handling of invalid taxonomy references, unsupported language types, and alignment between detailed language records and profile summaries.
- Accessibility is addressed by requiring understandable selection controls, validation feedback, and clear empty-state behavior for language records.
- Maintainability is addressed by anchoring this unit to the shared language taxonomy and keeping it separate from other student-profile subdomains.

## Tradeoffs

- Requiring taxonomy-backed language levels improves consistency for matching and filtering, but it reduces the flexibility of unconstrained free-text language descriptions.
- Keeping the detailed language records authoritative improves consistency, but it requires later implementations to synchronize any simpler profile-summary fields carefully.
- Deferring certification-proof workflows keeps this unit reviewable, though richer evidence models may need dedicated later units.

## Monitoring

- Later implementation should monitor failed language updates, repeated invalid-taxonomy submissions, and summary/detail drift issues.
- Later matching and vacancy-language units should confirm they consume the same language taxonomy rather than introducing divergent identifiers.
- Later privacy reviews should confirm company/admin access to student language levels is policy-gated and auditable where required.

## Testing approach

- Review the unit against the requirements, data-model, security, matching, RBAC, frontend foundation, routing, state, and layout baselines.
- Check that language management remains structured, self-service, and aligned with the shared language taxonomy.
- Check that the relationship between detailed language records and basic-profile language summaries is documented clearly.
- Run `./scripts/aidlc-check.sh`.
