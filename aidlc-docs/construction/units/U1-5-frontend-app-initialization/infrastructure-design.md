# Infrastructure design: U1-5-frontend-app-initialization

## Infrastructure impact

This unit does not provision infrastructure, but it defines the frontend runtime posture that later local development, API integration, and deployment units must support.

## Environment variables

- Frontend API base URL
- Frontend environment mode settings for local development
- Optional feature flags or app-mode settings later if needed
- Local origin settings that stay compatible with Django session and CSRF behavior

## External services

- None required by the frontend initialization baseline itself
- Later notification, analytics, or storage-related integrations may appear in downstream units

## Deployment impact

- The frontend should run locally alongside the Django backend during early development.
- Later AWS-compatible deployment should preserve the same frontend-backend boundary and session-aware browser behavior.
- Static asset serving strategy can be refined later without changing this initialization baseline.

## Database impact

- No direct database impact from the frontend foundation itself
- The frontend depends indirectly on backend APIs backed by the relational system of record
