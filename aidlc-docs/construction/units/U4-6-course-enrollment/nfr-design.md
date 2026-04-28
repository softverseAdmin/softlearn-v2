# NFR design: U4-6-course-enrollment

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership for enrollment creation and by rejecting duplicate or unauthorized requests predictably.
- Privacy is addressed by treating enrollment as protected student learning data and keeping it out of unrelated access paths.
- Performance is addressed by focusing on a responsive enrollment action with immediate, understandable outcomes.
- Reliability is addressed through stable duplicate-handling and consistent creation of the student-course relationship.
- Accessibility is addressed by requiring clear enrollment actions and readable success or validation messaging.
- Maintainability is addressed by keeping enrollment separate from lesson progress and completion while reusing existing platform baselines.

## Tradeoffs

- Keeping enrollment distinct from lesson-viewing implementation reduces coupling, but later access-control implementation must wire the two together carefully.
- Deferring unenrollment and prerequisite policy keeps the baseline focused, though later units must document those behaviors if introduced.

## Monitoring

- Later implementation should monitor duplicate-enrollment attempts and unexpected enrollment failures.
- Later progress and completion units should confirm they attach state to the enrollment baseline defined here.

## Testing approach

- Review the unit against the requirements, security, data-model, API, routing, and layout baselines.
- Check that student ownership and duplicate-handling behavior are explicit.
- Check that enrollment remains separate from progress and completion logic.
- Run `./scripts/aidlc-check.sh`.
