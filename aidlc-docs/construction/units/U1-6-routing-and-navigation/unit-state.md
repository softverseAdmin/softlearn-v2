# Unit: U1-6-routing-and-navigation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the routing and navigation baseline for the shared React frontend across public, authenticated, and role-specific workflows.

## Out of Scope

Concrete router code, final page tree for every domain feature, final visual navigation design, and page-level UI implementation.

## Dependencies

Depends on frontend initialization, authentication, RBAC, API structure, and requirements baseline.

## Acceptance Criteria

- Public, protected, and role-specific route groups are defined.
- Route guards align with session auth and RBAC.
- Role-aware navigation expectations are documented.
- No application code is produced.

## Risks

If routing and navigation rules are inconsistent, later frontend units will drift into broken guard behavior, unclear menus, and unsafe role exposure.

## Open Questions

Exact nested route depth, breadcrumb strategy, and final menu presentation can be refined in later frontend units.

## Last Updated

2026-04-29
