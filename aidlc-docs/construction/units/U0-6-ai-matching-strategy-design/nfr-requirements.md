# NFR requirements: U0-6-ai-matching-strategy-design

## Security

Matching should only use structured data the platform is authorized to process.
The design must avoid hidden or inferred attributes that could create unsafe or unfair outcomes.

## Privacy

Matching inputs and outputs must honor consent and visibility rules.
Matching should not infer personal data beyond what the user and company have explicitly provided.
Companies should only see explanations and student data that privacy rules allow.

## Performance

The strategy should allow efficient rule calculation and ranking later, even if the current unit is conceptual.
The score design should remain simple enough for predictable recalculation and ordering.

## Reliability

Matching rules should be deterministic enough to explain and audit.
The same input set should always produce the same score and match level.

## Accessibility

Explanations should be understandable to product and review stakeholders.
The explanation format should be simple enough for students and company users to understand why a result was ranked the way it was.

## Maintainability

The strategy should be easy to tune through weights and rule updates without redesigning the whole matching system.
The v1 design should remain fully usable without requiring future AI upgrades.
