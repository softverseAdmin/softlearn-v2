# Unit: U20-3-company-dashboard-redesign

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Redesign the protected company dashboard into a hiring-first SaaS surface that tells company users which candidates to review, which jobs are active, and which interviews need attention.

## Out of Scope

Admin dashboard redesign, vacancy CRUD redesign, candidate-detail workflow redesign, and new application-domain modeling beyond the existing baseline.

## Dependencies

Depends on CHG-002, the accepted company dashboard baseline, company access-control rules, existing vacancy/candidate/interview APIs, and the shared protected dashboard route.

## Acceptance Criteria

The company dashboard is documented and implemented as a minimal, action-first, role-safe SaaS hiring workspace with candidate review, active jobs, interview follow-up, and compact analytics.

## Risks

The current baseline does not expose per-vacancy application counts, so the redesign must stay honest about what can be shown in the active-jobs section without inventing hidden data.

## Open Questions

Later units can add richer per-vacancy applicant counts, shortlist pipeline segmentation, and deeper dashboard analytics once the underlying application-to-vacancy model is expanded.

## Last Updated

2026-04-29
