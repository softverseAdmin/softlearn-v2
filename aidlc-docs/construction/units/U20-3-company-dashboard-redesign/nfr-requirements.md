# NFR requirements: U20-3-company-dashboard-redesign

## Security

- Company dashboard access must remain protected by the existing authenticated company route and backend role checks.
- Dashboard actions and links must not create paths to student-only or admin-only behavior.
- The redesign must not introduce external AI APIs, client-side secrets, or browser-stored privileged data.

## Privacy

- Candidate details shown on the dashboard must stay within the existing company access and student visibility rules.
- Exam-based score display must only use data that is explicitly shareable to the company.
- The dashboard should prefer summary-level candidate information over unnecessary sensitive detail.

## Performance

- The dashboard should load from one primary API request.
- The redesigned page should avoid heavy charts and large client-side data transformations.
- Candidate cards and interview items should stay intentionally compact for fast first render.

## Reliability

- The dashboard must return stable fallback content when the company has no active jobs, no candidates, or no interviews.
- Missing optional score data must not break candidate review cards.
- The same company state should always produce the same ordering and analytics values.

## Accessibility

- The redesign must preserve semantic headings, keyboard reachability, visible focus, and sufficient color contrast.
- Status and score states must not rely on color alone.
- Mobile and tablet layouts must preserve readable spacing and tap targets.

## Maintainability

- Company dashboard UI should be split into focused components rather than one large page body.
- API response types should be explicit and shared through typed frontend interfaces.
- The redesign should reuse existing company candidate and interview data where possible instead of duplicating separate business rules in the frontend.
