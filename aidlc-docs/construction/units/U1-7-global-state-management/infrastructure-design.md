# Infrastructure design: U1-7-global-state-management

## Infrastructure impact

This unit does not provision infrastructure, but it defines frontend runtime expectations that later local development, browser execution, and deployment setups must support consistently.

## Environment variables

- Frontend environment mode settings
- Backend API base URL
- Optional feature flags or client configuration settings later if shared app behavior requires them
- No browser-side secret storage is introduced by this unit

## External services

- None required by the state-management baseline itself
- Later analytics, monitoring, or error-tracking integrations may consume shared app state transitions but are not part of this unit

## Deployment impact

- Local-first development should preserve the same shared-state behavior as later deployed environments.
- Later deployment changes should not force a different auth/session or app-shell state model in the client.
- Client hydration or server-render concerns are out of scope because this frontend remains a React + Vite app, not a server-rendered framework baseline.

## Database impact

- No direct database impact from the frontend state baseline itself
- Shared state depends indirectly on backend APIs backed by the relational system of record
