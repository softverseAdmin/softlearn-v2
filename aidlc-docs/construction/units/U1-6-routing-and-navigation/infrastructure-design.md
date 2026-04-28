# Infrastructure design: U1-6-routing-and-navigation

## Infrastructure impact

This unit does not provision infrastructure, but it defines frontend runtime behavior that later local development, hosting, and reverse-routing setups must support.

## Environment variables

- Frontend base URL
- Backend API base URL
- Optional frontend route base path if deployment later requires it
- Environment mode settings that keep local routing behavior predictable

## External services

- None required by the routing baseline itself
- Later analytics or error-tracking tools may observe navigation behavior, but they are not part of this unit

## Deployment impact

- Local frontend development should support client-side routing alongside the backend API.
- Later AWS-compatible deployment should preserve deep-link and refresh behavior for frontend routes.
- Hosting and reverse-proxy configuration can be refined later without changing the route model defined here.

## Database impact

- No direct database impact from the frontend routing baseline itself
- Routes indirectly depend on backend-authenticated and role-aware domain data
