# NFR design: U20-1-student-dashboard-redesign

## How NFRs are addressed

- Security and role isolation stay anchored in the existing protected student route and backend `roles=[User.Role.STUDENT]` guard.
- Privacy is preserved by reusing student-owned summaries and exposing only the new action-oriented dashboard shape.
- Performance is addressed by keeping the redesign on one dashboard request and using a compact roadmap preview instead of a full roadmap workspace.
- Accessibility is addressed through semantic section structure, descriptive buttons, explicit labels for node states, and responsive spacing.
- Maintainability is addressed by isolating the redesigned dashboard into dedicated components and typed response contracts.

## Tradeoffs

- The dashboard redesign introduces a richer API shape, but that complexity is preferred over forcing the frontend to derive hidden logic from disconnected raw metrics.
- This unit provides a preview-level roadmap rather than a full roadmap editor or topic reader so the page can stay minimal and focused.
- Tailwind-based redesign foundations may coexist with existing legacy CSS during the transition to avoid rewriting the entire frontend in one unit.

## Monitoring

- Existing frontend build and lint validation should continue to catch integration regressions.
- Backend tests should confirm the student dashboard response shape and next-action behavior for representative states.
- Later product monitoring can add usage metrics for dashboard CTA clicks, but that is outside this unit.

## Testing approach

- Update backend tests for the student dashboard response contract and action-state logic.
- Build and lint the frontend after component and style changes.
- Verify the dashboard renders useful states for empty, in-progress, and exam-required learners.
