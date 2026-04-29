# NFR design: U20-3-company-dashboard-redesign

## How NFRs are addressed

- Security and role isolation stay anchored in the existing protected company route and backend `roles=[User.Role.COMPANY]` guard.
- Privacy is preserved by reusing company review-access rules and only exposing exam-based score values when the student's visibility settings allow them.
- Performance is addressed by keeping the redesign on one dashboard request and using compact action sections instead of heavy analytics or charts.
- Accessibility is addressed through semantic section structure, descriptive links, visible status labels, and responsive spacing.
- Maintainability is addressed by isolating the redesigned company dashboard into dedicated components and typed response contracts.

## Tradeoffs

- The redesign introduces a richer API shape, but that is preferred over forcing the frontend to infer hiring priorities from unrelated raw metrics.
- The active-jobs section remains honest about the current baseline and does not fabricate per-vacancy applicant counts that the data model cannot support yet.
- This unit focuses on review-ready summaries rather than full candidate evaluation or vacancy management so the page can stay minimal and action-first.

## Monitoring

- Existing frontend build and lint validation should continue to catch integration regressions.
- Backend tests should confirm the company dashboard response contract and visibility-aware score behavior.
- Later product monitoring can add dashboard CTA analytics, but that is outside this unit.

## Testing approach

- Update backend tests for the company dashboard response contract and score visibility behavior.
- Build and lint the frontend after component and type changes.
- Verify useful company-dashboard states for empty, candidate-heavy, and interview-heavy companies.
