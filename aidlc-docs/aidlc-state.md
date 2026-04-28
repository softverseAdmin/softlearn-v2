# AI-DLC state

- **Project status:** inception and early construction planning
- **Baseline version:** v1
- **Technology decision:** recommended local-first stack defined, ADR-001 proposed for acceptance
- **Current active unit:** U1-2-authentication-core

## Active units

| Unit | Stage | Status |
| --- | --- | --- |
| U1-2-authentication-core | Functional Design | active |

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
| U0-8-deployment-and-infra-strategy | Deployment strategy baseline completed for local-first delivery now and AWS-compatible deployment later. |
| U1-1-project-initialization | Repository bootstrap and AI-DLC operating scaffold completed. Sequencing exception recorded in CHG-001. |
| U1-4-base-api-structure | Base REST API contract completed for auth, profiles, learning, exams, jobs, matching, applications, interviews, and notifications. Sequencing exception recorded in CHG-001. |

## Open CHG

| CHG | Summary | Status |
| --- | --- | --- |
| None | No open change requests. CHG-001 is accepted and closed. | N/A |

## Stage status summary

| Stage | Overall status |
| --- | --- |
| Functional Design | U0-1 through U0-8 and U1-1/U1-4 completed; U1-2 is active and U1-3 is pending |
| NFR Requirements | U0-1 through U0-8 and U1-1/U1-4 completed; U1-2 is active and U1-3 is pending |
| NFR Design | U0-1 through U0-8 and U1-1/U1-4 completed; U1-2 is active and U1-3 is pending |
| Infrastructure Design | U0-1 through U0-8 and U1-1/U1-4 completed; U1-2 is active and U1-3 is pending |
| Code Generation | Documentation/code-generation planning completed for U0-1 through U0-8 and U1-1/U1-4; application code remains blocked until ADR-001 is accepted |
