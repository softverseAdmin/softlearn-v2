# NFR requirements: U20-4-admin-dashboard-redesign

## Security

- Admin dashboard access must remain protected by the existing authenticated admin route and backend role checks.
- Dashboard links and summaries must not weaken existing role boundaries.
- The redesign must not introduce external analytics, AI APIs, or privileged data in client storage.

## Privacy

- The dashboard should prefer compact operational summaries over unnecessary raw user detail.
- Recent activity should expose only the minimum metadata needed for admin operations.
- Revenue must not be fabricated from unrelated data sources.

## Performance

- The dashboard should load from one primary API request.
- The redesign must avoid large charting libraries or expensive client-side aggregation.
- Activity and status sections should stay compact for fast render.

## Reliability

- The dashboard must return stable fallback content when there are no recent users, interviews, or notifications.
- Missing revenue data must not break the layout.
- The same platform state should produce the same stat and status values.

## Accessibility

- The redesign must preserve semantic headings, keyboard reachability, visible focus, and readable spacing.
- Status rows must not rely on color alone.
- Tablet and mobile layouts must remain scannable.

## Maintainability

- The admin dashboard should be implemented with explicit typed response contracts.
- Activity and status rows should be backend-driven rather than recomputed inconsistently on the client.
- The redesign should coexist cleanly with the existing admin management pages.
