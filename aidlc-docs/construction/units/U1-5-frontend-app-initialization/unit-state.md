# Unit: U1-5-frontend-app-initialization

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the frontend foundation for a React + Vite web app that supports authenticated student, company, and admin workflows.

## Out of Scope

Concrete React source code, final routing tree, final global state choice, final component library choice, and page-level UI implementation.

## Dependencies

Depends on ADR-001, architecture, authentication, RBAC, and base API structure.

## Acceptance Criteria

- React + Vite is defined as the frontend foundation.
- Session-based browser integration with the Django backend is documented.
- Role-aware app expectations are defined for students, company users, and admins.
- No application code is produced.

## Risks

If the frontend foundation is vague or inconsistent, later routing, layout, and state units will drift and rework the app shell.

## Open Questions

Exact folder structure depth, final state library choice, and component library choice can be refined in later frontend units.

## Last Updated

2026-04-29
