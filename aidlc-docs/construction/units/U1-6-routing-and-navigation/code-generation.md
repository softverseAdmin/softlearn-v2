# Code generation: U1-6-routing-and-navigation

## Implementation plan

No application code for this unit.

This unit defines the routing and navigation baseline only. Later frontend units may implement route definitions, protected-route wrappers, role-aware menus, not-found screens, and redirect behavior from this design.

## Files to create or update

- `aidlc-docs/construction/units/U1-6-routing-and-navigation/unit-state.md`
- `aidlc-docs/construction/units/U1-6-routing-and-navigation/functional-design.md`
- `aidlc-docs/construction/units/U1-6-routing-and-navigation/nfr-requirements.md`
- `aidlc-docs/construction/units/U1-6-routing-and-navigation/nfr-design.md`
- `aidlc-docs/construction/units/U1-6-routing-and-navigation/infrastructure-design.md`
- `aidlc-docs/construction/units/U1-6-routing-and-navigation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against frontend foundation, auth, RBAC, API, and requirements baselines.
- Confirm route groups, route guards, navigation posture, and fallback states are all covered.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the routing baseline is rejected or replaced by an approved revision.

## Review checklist

- Public/protected/role-specific route groups documented
- Session-aware route guard behavior documented
- Role-aware navigation posture documented
- Not-found and access-fallback states documented
- No application code introduced
