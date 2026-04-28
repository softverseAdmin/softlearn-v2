# Code generation: U0-4-technology-selection-and-architecture

## Implementation plan

No application code for this inception unit.

This unit completes the stack comparison and architecture recommendation only. The recommendation now assumes local-first development and AWS-compatible deployment later. Application scaffolding remains blocked until ADR-001 is formally accepted.

## Files to create or update

- `aidlc-docs/inception/v1/technology-decision.md`
- `aidlc-docs/inception/v1/architecture.md`
- `aidlc-docs/inception/v1/adr-001-technology-stack.md`
- `aidlc-docs/construction/units/U0-4-technology-selection-and-architecture/functional-design.md`
- `aidlc-docs/construction/units/U0-4-technology-selection-and-architecture/nfr-requirements.md`
- `aidlc-docs/construction/units/U0-4-technology-selection-and-architecture/nfr-design.md`
- `aidlc-docs/construction/units/U0-4-technology-selection-and-architecture/infrastructure-design.md`
- `aidlc-docs/construction/units/U0-4-technology-selection-and-architecture/code-generation.md`
- `aidlc-docs/construction/units/U0-4-technology-selection-and-architecture/unit-state.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review all required comparison categories and criteria.
- Confirm the recommendation is explicit and justified.
- Confirm the architecture doc reflects the selected direction.
- Confirm ADR-001 is updated to a proposed decision.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only decision if the recommendation is rejected or revised before ADR acceptance.

## Review checklist

- Required option categories present
- Criteria documented
- Recommendation justified clearly
- ADR updated to proposed decision
- No application code introduced
