# Unit: U5-5-answer-submission

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected student exam submission that records durable attempt and answer data tied to the authenticated student and shared exam context.

## Out of Scope

Draft saves, autosave recovery, non-finalized submissions, and company/admin submission control.

## Dependencies

Depends on shared exam, question, and option records plus protected student exam-taking routes.

## Acceptance Criteria

Students can submit one full answer set for an eligible attempt, and the platform records structured attempt data safely.

## Risks

If submission validation is weak, inconsistent answer payloads can produce broken scoring and history records.

## Open Questions

Draft-attempt workflows can be layered later if they preserve the same final submission ownership and traceability.

## Last Updated

2026-05-01

