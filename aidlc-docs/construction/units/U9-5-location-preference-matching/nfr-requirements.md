# NFR requirements: U9-5-location-preference-matching

## Security

- Location-preference matching must run in a protected, auditable context.
- Student preference data and vacancy location data must not be exposed through unauthorized access paths.

## Privacy

- Location-preference matching must respect the protected nature of student preference data.
- Downstream sharing of location-match outcomes must not bypass later visibility controls.

## Performance

- Location-preference matching should complete responsively enough to support later aggregate matching workflows.
- The comparison path should avoid unstable delays that make factor-level state ambiguous.

## Reliability

- The same student location inputs and vacancy location inputs should produce the same location-match outcome.
- Conflicting location-match records for the same comparison context should be prevented.

## Accessibility

- Later user-facing communication of location-fit strengths and gaps should be based on clear, structured factor outputs.
- Flexible-fit and mismatch states should be representable understandably.

## Maintainability

- Location-preference matching should build on the shared location-setting, explainability, privacy, and audit baselines.
- The unit should stay focused on the location factor rather than absorbing other match factors or aggregate scoring.
