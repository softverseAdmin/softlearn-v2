# Inception v1 AI matching strategy

## Principle

Start with an explainable, auditable rule-based scoring model before adding heavier AI approaches.

## Initial scoring dimensions

- Skill match score
- Course completion score
- Exam score
- Language level score
- Location and work-style score

## Delivery path

1. Start with explainable rule-based scoring.
2. Add weighted scoring once baseline logic is stable.
3. Introduce embedding or vector search later if discovery quality needs improvement.
4. Add LLM-based explanation or recommendation later, only if auditability remains acceptable.

## Guardrails

- Matching outcomes must be explainable.
- Matching inputs must respect privacy and consent rules.
- Companies should only see the information they are allowed to access.
