# Code generation: U0-6-ai-matching-strategy-design

## Implementation plan

No application code for this inception unit.

This unit defines the rule-based matching baseline only. Later implementation units may build scoring logic, ranking queries, explanation generation, and recalculation workflows from this document.

## Files to create or update

- `aidlc-docs/inception/v1/ai-matching-strategy.md`
- `aidlc-docs/construction/units/U0-6-ai-matching-strategy-design/functional-design.md`
- `aidlc-docs/construction/units/U0-6-ai-matching-strategy-design/nfr-requirements.md`
- `aidlc-docs/construction/units/U0-6-ai-matching-strategy-design/nfr-design.md`
- `aidlc-docs/construction/units/U0-6-ai-matching-strategy-design/infrastructure-design.md`
- `aidlc-docs/construction/units/U0-6-ai-matching-strategy-design/code-generation.md`
- `aidlc-docs/construction/units/U0-6-ai-matching-strategy-design/unit-state.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review matching inputs, weighted score design, classification rules, explanation rules, ranking rules, storage fields, and limitations.
- Confirm the design is rule-based only.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only strategy if the rule-based approach is rejected or revised.

## Review checklist

- Rule-based start documented
- Score, classification, explanation, and ranking documented
- Privacy constraints visible
- No real AI or external AI services introduced
