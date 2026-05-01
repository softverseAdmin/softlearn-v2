# Unit: U18-4-manage-exams

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement protected admin exam management using a shared `Exam` domain model with create, update, list, and deactivate flows.

## Out of Scope

Bulk-import tooling, external exam-platform synchronization, proctoring workflows, question authoring, and heavy assessment analytics.

## Dependencies

Depends on authentication, role permissions, admin routing, base API structure, and the exam-results domain surfaces that reuse exam records.

## Acceptance Criteria

Admins can manage shared exam records through protected APIs and UI routes, exam data is reusable by linked exam results, and non-admin users cannot access the management surface.

## Risks

If exam management diverges from the assessment domain, later question, scoring, and history units can drift into duplicate records and inconsistent result reporting.

## Open Questions

Future units can add questions, answer options, and exam delivery flows as long as they continue to reuse the shared exam model introduced here.

## Last Updated

2026-04-30
