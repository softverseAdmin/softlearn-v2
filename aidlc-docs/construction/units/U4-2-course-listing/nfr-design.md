# NFR design: U4-2-course-listing

## How NFRs are addressed

- Security is addressed by keeping this unit within the approved route and auth posture and by avoiding protected student-specific behavior in the listing baseline.
- Privacy is addressed by keeping course discovery centered on shared course data rather than student-private records.
- Performance is addressed by focusing on responsive list browsing with clear loading behavior.
- Reliability is addressed through explicit handling of empty and unexpected-failure listing outcomes.
- Accessibility is addressed by requiring understandable page structure and clear fallback states for the listing view.
- Maintainability is addressed by keeping course listing separate from detail, enrollment, lessons, and progress while reusing the shared frontend baselines.

## Tradeoffs

- Keeping U4-2 limited to listing makes the learning phase easier to review, but it means the later detail and enrollment units must wire into the listing deliberately.
- A structured listing baseline improves reuse across the product, though richer filtering or recommendation behavior is deferred to later units.
- Leaving anonymous-versus-authenticated browsing flexibility open preserves design space, but later implementation must choose and document a final posture clearly.

## Monitoring

- Later implementation should monitor course-list load failures and repeated empty-state usage patterns.
- Later learning units should confirm they consume the same course-listing baseline rather than duplicating discovery logic.

## Testing approach

- Review the unit against the requirements, data-model, API, routing, layout, and frontend-state baselines.
- Check that course listing remains separate from course-detail, enrollment, and lesson-progress behavior.
- Check that listing and fallback-state behavior are documented clearly.
- Run `./scripts/aidlc-check.sh`.
