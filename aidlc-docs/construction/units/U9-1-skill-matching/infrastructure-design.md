# Infrastructure design: U9-1-skill-matching

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving a structured skill-match factor consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for skill-matching rule refinements

## External services

- None required for the baseline skill-matching flow
- External AI, taxonomy-enrichment, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected skill-factor evaluation using structured student skill data and vacancy skill requirements.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture and protected student-data boundaries.
- Skill-matching behavior must remain compatible with later aggregate scoring and matched-view workflows.

## Database impact

- The baseline relies on structured student skill data, **VacancySkillRequirement** records, and later **MatchFactor** storage or equivalent factor output handling.
- Later aggregate scoring and matched-view units should consume the same skill-factor baseline rather than creating conflicting skill-fit models.
- The unit should not create aggregate match results or application records directly.
