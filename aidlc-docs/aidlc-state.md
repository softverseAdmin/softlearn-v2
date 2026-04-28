# AI-DLC state

- **Project status:** inception and early construction planning
- **Baseline version:** v1
- **Technology decision:** recommended local-first stack defined, pending ADR-001 acceptance
- **Current active unit:** U0-8-deployment-and-infra-strategy

## Active units

| Unit | Stage | Status |
| --- | --- | --- |
| U0-8-deployment-and-infra-strategy | Functional Design | active |

## Completed units

| Unit | Notes |
| --- | --- |
| U0-1-platform-requirements-definition | Baseline platform requirements completed for inception v1 without selecting a stack. |
| U0-2-user-personas-definition | Persona baseline completed for learners, company roles, and admins without selecting a stack. |
| U0-3-core-features-breakdown | Domain-based feature roadmap completed through production readiness without selecting a stack. |
| U0-4-technology-selection-and-architecture | Recommended stack defined as Django + React + PostgreSQL + native session auth, built locally first and kept AWS-compatible for later deployment. |
| U0-5-data-model-high-level-design | Conceptual data model completed across identity, learning, hiring, privacy, matching, and audit domains. |
| U0-6-ai-matching-strategy-design | Rule-based matching strategy completed with deterministic scoring, explanations, ranking, and stored match-result requirements. |
| U0-7-security-and-compliance-design | Security and compliance baseline completed for privacy, consent, authorization, audit logging, exam integrity, meeting-link validation, and admin protection. |
| U1-1-project-initialization | Repository bootstrap and AI-DLC operating scaffold completed. |
| U1-4-base-api-structure | Base REST API contract completed for auth, profiles, learning, exams, jobs, matching, applications, interviews, and notifications. |

## Open CHG

| CHG | Summary | Status |
| --- | --- | --- |
| None | No open change requests. | N/A |

## Stage status summary

| Stage | Overall status |
| --- | --- |
| Functional Design | U0-1 through U0-7 and U1-1/U1-4 completed; next units pending |
| NFR Requirements | U0-1 through U0-7 and U1-1/U1-4 completed; next units pending |
| NFR Design | U0-1 through U0-7 and U1-1/U1-4 completed; next units pending |
| Infrastructure Design | U0-1 through U0-7 and U1-1/U1-4 completed; next units pending |
| Code Generation | Still blocked for application code until ADR-001 is formally accepted |
