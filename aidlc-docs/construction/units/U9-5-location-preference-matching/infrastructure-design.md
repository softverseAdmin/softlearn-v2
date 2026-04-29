# Infrastructure design: U9-5-location-preference-matching

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving a structured location-match factor consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for location-matching rule refinements

## External services

- None required for the baseline location-preference-matching flow
- External AI, mapping, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected location-factor evaluation using structured student preference data and vacancy location settings.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture and protected student-data boundaries.
- Location-preference-matching behavior must remain compatible with later aggregate scoring and matched-view workflows.

## Database impact

- The baseline relies on structured student location-preference data, **VacancyLocationPreference** records, and later **MatchFactor** storage or equivalent factor output handling.
- Later aggregate scoring and matched-view units should consume the same location-factor baseline rather than creating conflicting location-fit models.
- The unit should not create aggregate match results or application records directly.
