# Code generation: U1-8-base-ui-layout

## Implementation plan

No application code for this unit.

This unit defines the base UI layout baseline only. Later frontend units may implement shared shell components, public/authenticated layout wrappers, headers, navigation frames, and page composition primitives from this design.

## Files to create or update

- `aidlc-docs/construction/units/U1-8-base-ui-layout/unit-state.md`
- `aidlc-docs/construction/units/U1-8-base-ui-layout/functional-design.md`
- `aidlc-docs/construction/units/U1-8-base-ui-layout/nfr-requirements.md`
- `aidlc-docs/construction/units/U1-8-base-ui-layout/nfr-design.md`
- `aidlc-docs/construction/units/U1-8-base-ui-layout/infrastructure-design.md`
- `aidlc-docs/construction/units/U1-8-base-ui-layout/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against frontend initialization, routing, and global state baselines.
- Confirm the shared public/authenticated layout model and page structure conventions are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the layout baseline is rejected or replaced by an approved revision.

## Review checklist

- Public and authenticated shell model documented
- Role-aware layout behavior documented
- Shared page composition conventions documented
- Generic layout shell kept separate from feature-specific pages
- No application code introduced
