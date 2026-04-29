# Infrastructure design: U9-4-language-level-matching

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving a structured language-match factor consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for language-matching rule refinements

## External services

- None required for the baseline language-level-matching flow
- External AI, translation, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected language-factor evaluation using structured student language data and vacancy language requirements.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture and protected student-data boundaries.
- Language-level-matching behavior must remain compatible with later aggregate scoring and matched-view workflows.

## Database impact

- The baseline relies on structured student language data, **VacancyLanguageRequirement** records, and later **MatchFactor** storage or equivalent factor output handling.
- Later aggregate scoring and matched-view units should consume the same language-factor baseline rather than creating conflicting language-fit models.
- The unit should not create aggregate match results or application records directly.
