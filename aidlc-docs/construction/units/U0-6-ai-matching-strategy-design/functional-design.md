# Functional design: U0-6-ai-matching-strategy-design

## Purpose

Define a practical, explainable, non-AI matching strategy for connecting students and jobs using deterministic rule-based scoring.

## User story

As a platform team, we need a matching strategy that is useful in the first production version, easy to explain to users, and safe to operate without relying on real AI or opaque ranking models.

## Functional requirements

### 1. Product naming rule

- The product-facing name may refer to this as "AI matching", but the actual first implementation must be deterministic and rule-based.

### 2. Required matching inputs

Use structured platform data only:

- student skills
- desired job type
- desired work location
- Japanese level
- English level
- learning progress
- exam results
- resume completeness
- company job requirements
- required skills
- preferred skills
- location
- employment type
- experience level

### 3. Score design

- Define a weighted score from 0 to 100.
- Use the following initial weights:
  - Skill match: 40
  - Language match: 20
  - Location / remote preference: 15
  - Learning progress / exam readiness: 15
  - Profile completeness: 10

### 4. Match classification

- 80-100: Strong Match
- 60-79: Good Match
- 40-59: Possible Match
- 0-39: Low Match

### 5. Explanation rules

- Every match must generate human-readable explanations based on the rule outputs.
- Explanations must show both positive fit and missing requirements where relevant.

### 6. Ranking rules

- Highest score first
- Newer jobs prioritized when scores are equal
- Completed company profiles prioritized when scores are equal
- Expired or closed jobs excluded

### 7. Data storage requirements

Store at least:

- student_id
- job_id
- score
- match_level
- matched_skills
- missing_skills
- explanation
- calculated_at

### 8. Limitation rules

- No real AI in v1
- No ML, LLM, embeddings, or external AI service
- No automated hiring decisions
- Matching is recommendation support only

### 9. Future path

- Future AI/ML upgrades may be evaluated later only after enough reliable platform data exists.
- The current version remains rule-based.

## Inputs

- Requirements baseline
- Persona needs
- High-level data model
- Feature breakdown for matching and readiness units
- Technology decision direction that favors local-first, rule-based logic

## Outputs

- Rule-based matching strategy document
- A scoring model that later product units can implement consistently
- Explainability rules for student-facing and company-facing match outputs

## User flow

1. Define the structured inputs that matching is allowed to use.
2. Define weighted rule-based scoring from 0 to 100.
3. Define classification, explanation, ranking, and storage behavior.
4. Document the limitations and future upgrade path.

## Acceptance criteria

- Initial approach is rule-based, explainable, and auditable.
- Matching inputs are limited to structured platform data.
- Score design, classification, explanation, ranking, and storage are documented.
- The document clearly states that v1 does not use real AI.
- No application code is introduced.

## Out of scope

Production scoring engine implementation, ML systems, embeddings, LLM integration, and model operations.
