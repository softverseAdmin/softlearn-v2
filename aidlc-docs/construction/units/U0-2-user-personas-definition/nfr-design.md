# NFR design: U0-2-user-personas-definition

## How NFRs are addressed

- Security is addressed by distinguishing learner, recruiter, engineer reviewer, and admin trust boundaries instead of treating all company-side or internal users as one audience.
- Privacy is addressed by explicitly reflecting learner control over visibility and company dependence on permission-limited access.
- Performance is addressed indirectly by identifying recurring usage scenarios that later product design should keep efficient.
- Reliability is addressed by grounding personas in durable motivations, behaviors, and decision patterns rather than speculative demographic detail.
- Accessibility is addressed by acknowledging different language comfort, confidence, and experience levels across the personas.
- Maintainability is addressed by using a consistent structure for every persona so later units can reference the same fields.

## Tradeoffs

- Personas are intentionally broad enough to be stable across later units, which means they do not attempt to capture every possible variation in user background.
- The unit prioritizes behavioral clarity over detailed process design.
- Keeping the personas stack-neutral reduces implementation guidance now, but avoids biasing later technology decisions.

## Monitoring

- Use review feedback to catch missing user groups or unrealistic assumptions before feature decomposition and architecture decisions go deeper.
- Compare later units against these personas to ensure learner, recruiter, reviewer, and admin workflows remain differentiated.
- Revisit persona fit through explicit document changes if platform scope expands significantly.

## Testing approach

- Verify that all five requested personas are documented.
- Verify that each persona includes background, goals, pain points, technical level, and platform usage scenarios.
- Verify that the personas collectively cover learning, exams, matching, vacancy review, interviews, privacy, and admin oversight.
- Confirm no technology stack or application-code detail is introduced.
- Run `./scripts/aidlc-check.sh`.
