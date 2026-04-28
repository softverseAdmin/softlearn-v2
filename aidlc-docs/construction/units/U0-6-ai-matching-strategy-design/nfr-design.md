# NFR design: U0-6-ai-matching-strategy-design

## How NFRs are addressed

- Security is addressed by limiting matching to explicit structured data and by avoiding personal inference or hidden heuristics.
- Privacy is addressed by requiring consent-aware inputs and visibility-controlled outputs.
- Performance is addressed by keeping the score model simple, weighted, and deterministic.
- Reliability is addressed by defining stable rules, fixed match bands, and explainable factor outputs.
- Accessibility is addressed by requiring plain-language explanation rules.
- Maintainability is addressed by making the strategy tunable through weights, thresholds, and rule definitions rather than model retraining.

## Tradeoffs

Explainability is prioritized over recommendation sophistication in the first version.
The rule-based strategy may be less adaptive than ML-driven ranking, but it is safer, cheaper, easier to validate, and better aligned with early product trust.

## Monitoring

Future matching units should report how scores are calculated, stored, and exposed.
Any later proposal to introduce real AI or ML should be treated as a separate decision rather than assumed evolution.

## Testing approach

Review the scoring model, explanation rules, ranking rules, stored fields, and limitation statements for clarity, auditability, and privacy alignment.
Run `./scripts/aidlc-check.sh`.
