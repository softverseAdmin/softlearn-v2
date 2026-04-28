# AI-DLC state

- **Project status:** inception and early construction planning
- **Baseline version:** v1
- **Technology decision:** recommended local-first stack defined, ADR-001 proposed for acceptance
- **Current active unit:** None

## Active units

| Unit | Stage | Status |
| --- | --- | --- |
| None | N/A | none |

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
| U1-2-authentication-core | Session-based authentication baseline completed for signup, login, logout, session restore, password change, and password reset across students, company users, and admins. |
| U1-3-role-based-access-control | RBAC baseline completed for student, company, and admin roles with ownership, company-boundary, and policy-gated access rules. |
| U1-4-base-api-structure | Base REST API contract completed for auth, profiles, learning, exams, jobs, matching, applications, interviews, and notifications. Sequencing exception recorded in CHG-001. |
| U1-5-frontend-app-initialization | React + Vite frontend foundation completed for a session-aware, role-aware web app integrated with the Django backend. |
| U1-6-routing-and-navigation | Routing and navigation baseline completed for public, protected, and role-specific frontend flows with session-aware guards and fallback states. |
| U1-7-global-state-management | Global state management baseline completed for auth/session context, user context, and shared app-shell state without over-centralizing feature state. |
| U1-8-base-ui-layout | Base UI layout baseline completed for shared public/authenticated shells, role-aware navigation framing, and reusable page structure conventions. |
| U2-1-student-registration | Student registration baseline completed for minimum account creation, validation outcomes, session establishment, and entry into the student experience. |
| U2-2-student-login | Student login baseline completed for credential entry, validation outcomes, session establishment, and entry into the authenticated student experience. |
| U2-3-student-profile-basic | Student basic profile baseline completed for authenticated self-service viewing and updating of core student profile information. |
| U2-4-student-profile-skills | Student skill-management baseline completed for authenticated self-service maintenance of structured student skill records aligned to the shared taxonomy. |
| U2-5-student-profile-education | Student education-management baseline completed for authenticated self-service maintenance of structured education history records. |
| U2-6-student-profile-experience | Student experience-management baseline completed for authenticated self-service maintenance of structured work and project experience records. |
| U2-7-student-profile-language-level | Student language-level baseline completed for authenticated self-service maintenance of structured language records aligned to the shared taxonomy and basic profile summary. |
| U2-8-student-resume-management | Student resume-management baseline completed for authenticated self-service maintenance of resume metadata and optional protected resume files. |

## Open CHG

| CHG | Summary | Status |
| --- | --- | --- |
| None | No open change requests. CHG-001 is accepted and closed. | N/A |

## Stage status summary

| Stage | Overall status |
| --- | --- |
| Functional Design | U0-1 through U0-8, U1-1 through U1-8, and U2-1 through U2-8 completed; U2-9 is the next unstarted unit |
| NFR Requirements | U0-1 through U0-8, U1-1 through U1-8, and U2-1 through U2-8 completed; U2-9 is the next unstarted unit |
| NFR Design | U0-1 through U0-8, U1-1 through U1-8, and U2-1 through U2-8 completed; U2-9 is the next unstarted unit |
| Infrastructure Design | U0-1 through U0-8, U1-1 through U1-8, and U2-1 through U2-8 completed; U2-9 is the next unstarted unit |
| Code Generation | Documentation/code-generation planning completed for U0-1 through U0-8, U1-1 through U1-8, and U2-1 through U2-8; application code remains blocked until ADR-001 is accepted |
