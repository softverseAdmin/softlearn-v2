# NFR design: U2-4-student-profile-skills

## How NFRs are addressed

- Security is addressed by authenticated self-service ownership, protected-write handling, and explicit rejection of unauthorized or malformed skill changes.
- Privacy is addressed by treating student skills as protected student data and limiting this unit to the student’s own management flow.
- Performance is addressed by keeping the skill-management scope narrow and by avoiding unnecessary global-state dependence for feature-local editing.
- Reliability is addressed through stable handling of duplicate skills, invalid taxonomy references, and predictable add/remove/update outcomes.
- Accessibility is addressed by requiring understandable empty states, validation feedback, and clear interactive structure for skill management.
- Maintainability is addressed by anchoring this unit to the shared skill taxonomy and keeping it separate from other student-profile subdomains.

## Tradeoffs

- Requiring structured taxonomy-backed skills improves consistency for matching and filtering, but it reduces the flexibility of unconstrained free-text skill entry.
- Keeping skill state mostly local to the feature reduces unnecessary app-wide complexity, though later cross-route profile summaries may need carefully scoped shared state.
- Deferring advanced skill evidence or endorsement models keeps this unit reviewable, but richer credibility signals will need later dedicated units if required.

## Monitoring

- Later implementation should monitor failed skill updates, repeated duplicate-entry attempts, and invalid taxonomy selection errors.
- Later matching and vacancy units should confirm they consume the same skill taxonomy rather than introducing divergent identifiers.
- Later privacy reviews should confirm company/admin access to student skills is policy-gated and auditable where required.

## Testing approach

- Review the unit against the requirements, data-model, security, RBAC, API, routing, layout, and state-management baselines.
- Check that skill management remains structured, self-service, and aligned with the shared taxonomy.
- Check that the unit stays separate from education, experience, resume, privacy, and vacancy-skill requirement units.
- Run `./scripts/aidlc-check.sh`.
