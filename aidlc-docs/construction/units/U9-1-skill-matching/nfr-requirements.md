# NFR requirements: U9-1-skill-matching

## Security

- Skill matching must run in a protected, auditable context.
- Student skill data and vacancy requirement data must not be exposed through unauthorized access paths.

## Privacy

- Skill matching must respect the protected nature of student profile data.
- Downstream sharing of skill-match outcomes must not bypass later visibility controls.

## Performance

- Skill matching should complete responsively enough to support later aggregate matching workflows.
- The comparison path should avoid unstable delays that make factor-level state ambiguous.

## Reliability

- The same student skill set and vacancy skill set should produce the same skill-match outcome.
- Conflicting skill-match records for the same comparison context should be prevented.

## Accessibility

- Later user-facing communication of skill-match strengths and gaps should be based on clear, structured factor outputs.
- Missing-skill and partial-fit states should be representable understandably.

## Maintainability

- Skill matching should build on the shared skill taxonomy, explainability, privacy, and audit baselines.
- The unit should stay focused on the skill factor rather than absorbing other match factors or aggregate scoring.
