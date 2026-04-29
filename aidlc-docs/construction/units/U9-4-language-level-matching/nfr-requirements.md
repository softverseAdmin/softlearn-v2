# NFR requirements: U9-4-language-level-matching

## Security

- Language-level matching must run in a protected, auditable context.
- Student language data and vacancy requirement data must not be exposed through unauthorized access paths.

## Privacy

- Language-level matching must respect the protected nature of student profile data.
- Downstream sharing of language-match outcomes must not bypass later visibility controls.

## Performance

- Language-level matching should complete responsively enough to support later aggregate matching workflows.
- The comparison path should avoid unstable delays that make factor-level state ambiguous.

## Reliability

- The same student language set and vacancy language set should produce the same language-match outcome.
- Conflicting language-match records for the same comparison context should be prevented.

## Accessibility

- Later user-facing communication of language-fit strengths and gaps should be based on clear, structured factor outputs.
- Below-threshold and partial-fit states should be representable understandably.

## Maintainability

- Language-level matching should build on the shared language model, explainability, privacy, and audit baselines.
- The unit should stay focused on the language factor rather than absorbing other match factors or aggregate scoring.
