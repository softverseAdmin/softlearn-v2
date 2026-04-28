# Infrastructure design: U0-6-ai-matching-strategy-design

## Infrastructure impact

No AI or ML infrastructure is required for this unit. The design only requires structured application data and later deterministic score calculation.

## Environment variables

None.

## External services

None. This rule-based design does not depend on external AI services, embeddings, model hosting, or third-party inference providers.

## Deployment impact

No special deployment tier is required by the conceptual design. Later implementation may use ordinary application workers or scheduled recalculation jobs, but not AI infrastructure.

## Database impact

The current strategy depends on structured platform data only. The conceptual storage should support match scores, explanations, matched skills, missing skills, and calculation timestamps.
