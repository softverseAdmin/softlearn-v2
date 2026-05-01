# Unit: U2-8-student-resume-management

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement authenticated student self-service maintenance of protected resume metadata and active-resume selection inside the profile workspace.

## Out of Scope

Binary file storage integration, final storage-provider selection, company review permissions, and detailed privacy or consent policy units.

## Dependencies

Depends on the data-model, security, matching, architecture, RBAC, frontend foundation, routing, state, layout, and earlier student profile baselines.

## Acceptance Criteria

Students can manage resume metadata through protected backend routes and the student profile UI, and only one resume can remain active at a time.

## Risks

If resume metadata drifts from the shared student profile contract, later readiness, privacy, storage, and company-review behavior will become inconsistent.

## Open Questions

Protected binary upload and storage-serving behavior can be added later without changing the metadata contract shipped here.

## Last Updated

2026-05-01
