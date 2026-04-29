# Unit: U20-1-student-dashboard-redesign

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Redesign the protected student dashboard into a professional, action-first SaaS experience focused on roadmap learning progress, exam gating, and learner next steps.

## Out of Scope

Company and admin dashboards, auth redesign, dedicated roadmap learning workspace, premium purchase flow, and mobile bottom navigation.

## Dependencies

Depends on CHG-002, the accepted stack, auth/RBAC/API baselines, existing student learning and exam summary units, and the current student dashboard implementation.

## Acceptance Criteria

The unit documents and implements an action-first student dashboard that is minimal, role-safe, mobile-friendly, and explicit about the learner's next step.

## Risks

Because the underlying domain model does not yet provide a full roadmap graph, the redesign must derive a compact preview from existing deterministic learning and exam signals without inventing opaque logic.

## Open Questions

Later units can deepen roadmap topology, premium gating, and mobile navigation while keeping this dashboard action model intact.

## Last Updated

2026-04-29
