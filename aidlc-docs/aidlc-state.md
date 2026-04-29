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
| U2-9-student-availability-management | Student availability-management baseline completed for authenticated self-service maintenance of structured readiness and availability records. |
| U2-10-student-profile-privacy-settings | Student privacy-settings baseline completed for authenticated self-service control of company visibility over profile and result data, with consent and auditability expectations. |
| U3-1-company-registration | Company-registration baseline completed for minimum company account creation, validation outcomes, session establishment, and entry into the company experience. |
| U3-2-company-login | Company-login baseline completed for credential entry, validation outcomes, session establishment, and entry into the authenticated company experience. |
| U3-3-company-profile-basic | Company basic-profile baseline completed for authenticated self-service viewing and updating of core organization identity fields. |
| U3-4-company-profile-description | Company profile-description baseline completed for authenticated self-service management of narrative organization description content. |
| U3-5-company-hiring-preferences | Company hiring-preferences baseline completed for authenticated self-service management of structured organization-level hiring defaults. |
| U3-6-company-user-management | Company user-management baseline completed for authenticated management of company-member accounts within a single company context. |
| U4-1-course-creation | Protected course-creation baseline completed for authorized platform operators to create structured course records before student-facing discovery and participation. |
| U4-2-course-listing | Course-listing baseline completed early while correcting a unit-mapping mistake; dedicated course-detail, enrollment, and lesson units remain separate. |
| U4-3-course-detail-page | Course-detail baseline completed for student-facing inspection of a single course before enrollment or lesson participation. |
| U4-4-lesson-creation | Protected lesson-creation baseline completed for authorized platform operators to add structured, ordered lessons to an existing course. |
| U4-5-lesson-viewing | Lesson-viewing baseline completed for authorized student access to structured lesson content within the learning experience. |
| U4-6-course-enrollment | Course-enrollment baseline completed for authenticated students to create protected, student-owned enrollment records. |
| U4-7-lesson-progress-tracking | Lesson-progress baseline completed for protected, enrollment-linked tracking of a student’s lesson-level learning state. |
| U4-8-course-completion-tracking | Course-completion baseline completed for deterministic, protected learning evidence derived from enrollment-linked lesson progress. |
| U5-1-exam-creation | Protected exam-creation baseline completed for authorized platform operators to create structured exam records before question authoring, student attempts, and scoring behavior. |
| U5-2-question-creation | Protected question-creation baseline completed for authorized platform operators to attach structured question records to an existing exam before answer-option authoring and student delivery. |
| U5-3-answer-options-management | Protected answer-options baseline completed for authorized platform operators to manage structured candidate answers for an existing question before student submission and scoring. |
| U5-4-exam-taking-ui | Protected exam-taking UI baseline completed for authenticated students to view and navigate available exams without mixing in submission or scoring behavior. |
| U5-5-answer-submission | Protected answer-submission baseline completed for authenticated students to record traceable exam-attempt responses before scoring and result presentation. |
| U5-6-score-calculation | Deterministic score-calculation baseline completed for protected evaluation of submitted exam attempts before pass/fail and result-summary behavior. |
| U5-7-pass-fail-logic | Deterministic pass/fail baseline completed for classifying scored exam attempts with explicit rule-based outcome states. |
| U5-8-exam-history | Protected exam-history baseline completed for authenticated students to review structured records of their own exam attempts and outcomes. |
| U5-9-exam-retake-policy | Deterministic retake-policy baseline completed for evaluating repeat-attempt eligibility from exam history and explicit exam rules. |
| U6-1-student-learning-summary | Protected student learning-summary baseline completed for authenticated students to review structured course participation, progress, and completion evidence. |
| U6-2-student-exam-results-summary | Protected student exam-results-summary baseline completed for authenticated students to review structured exam outcome evidence. |
| U6-3-company-view-student-results | Protected company-side student-results baseline completed for authorized company users to review only allowed student learning and exam result evidence. |
| U6-4-privacy-filter-for-results | Privacy-filter baseline completed for consent-aware filtering of company-visible learning and exam result evidence. |
| U6-5-readiness-score-calculation | Deterministic readiness-score baseline completed for explainable, privacy-aware calculation from learning and exam evidence. |
| U7-1-vacancy-create | Protected vacancy-creation baseline completed for authorized company users to create structured vacancy records before later management, search, and matching workflows. |
| U7-2-vacancy-edit | Protected vacancy-edit baseline completed for authorized company users to update company-owned vacancy records while preserving stable vacancy identity. |
| U7-3-vacancy-delete | Protected vacancy-delete baseline completed for authorized company users to remove or retire company-owned vacancies with stable inactive-state behavior. |
| U7-4-vacancy-list | Vacancy-list baseline completed for stable visibility-aware vacancy summaries used by later management and discovery contexts. |
| U7-5-vacancy-detail | Vacancy-detail baseline completed for stable visibility-aware retrieval of a single vacancy record before applications and matching workflows. |
| U7-6-vacancy-skill-tags | Structured vacancy-skill-tags baseline completed for company-managed skill requirements linked to shared skill taxonomy. |
| U7-7-vacancy-language-requirements | Structured vacancy-language-requirements baseline completed for company-managed language expectations linked to the shared language-level model. |
| U7-8-vacancy-location-settings | Structured vacancy-location-settings baseline completed for company-managed location and work-style expectations linked to vacancy records. |
| U8-1-job-list-page | Student job-list-page baseline completed for browsing the visible active subset of vacancies in list form. |
| U8-2-job-search-bar | Job-search-bar baseline completed for refining the visible student job list with a general search query. |
| U8-3-skill-filter | Structured skill-filter baseline completed for narrowing visible jobs using vacancy skill requirements. |
| U8-4-language-filter | Structured language-filter baseline completed for narrowing visible jobs using vacancy language requirements. |
| U8-5-location-filter | Structured location-filter baseline completed for narrowing visible jobs using vacancy location and work-style settings. |
| U8-6-salary-filter | Salary-filter baseline completed for narrowing visible jobs using approved salary-ready vacancy data. |
| U8-7-bookmark-jobs | Bookmark-jobs baseline completed for student-owned saving and unsaving of visible jobs for later review. |
| U9-1-skill-matching | Deterministic skill-matching baseline completed for comparing structured student skills with vacancy skill requirements using explainable rule-based scoring inputs. |
| U9-2-course-completion-matching | Deterministic course-completion-matching baseline completed for deriving learning-progress evidence used in later aggregate matching without exposing hidden logic. |
| U9-3-exam-score-matching | Deterministic exam-score-matching baseline completed for converting protected exam evidence into explainable readiness inputs for matching. |
| U9-4-language-level-matching | Deterministic language-level-matching baseline completed for comparing structured student language records with vacancy language requirements using explainable rule-based outcomes. |
| U9-5-location-preference-matching | Deterministic location-preference-matching baseline completed for comparing structured student work-location preferences with vacancy location and work-style settings. |
| U9-6-match-score-calculation | Deterministic aggregate match-score baseline completed for combining approved factor outputs and profile-completeness signals into explainable recommendation scores. |
| U9-7-matched-student-list-for-company | Company-facing matched-student-list baseline completed for privacy-safe ranked candidate recommendations derived from approved aggregate match results. |
| U9-8-matched-jobs-for-student | Student-facing matched-jobs baseline completed for visible ranked job recommendations derived from approved aggregate match results. |
| U10-1-apply-to-job | Student-owned apply-to-job baseline completed for protected application creation against visible vacancies with deterministic duplicate-prevention and initial status-history behavior. |
| U10-2-application-status-tracking | Shared application-status-tracking baseline completed for authoritative current status and auditable lifecycle history across student and company workflows. |
| U10-3-withdraw-application | Student-owned withdraw-application baseline completed for deterministic cancellation of allowed applications with traceable lifecycle updates. |
| U10-4-company-view-applications | Company-view-applications baseline completed for authorized privacy-safe review of applications submitted to company-owned vacancies. |
| U10-5-shortlist-candidates | Company-side shortlist-candidates baseline completed for deterministic shortlist actions with traceable shortlist and lifecycle evidence. |
| U10-6-reject-candidates | Company-side reject-candidates baseline completed for deterministic rejection actions with auditable terminal-state handling. |
| U11-1-student-profile-preview-for-company | Company-side student-profile-preview baseline completed for authorized review of a permission-controlled student summary in approved candidate-review contexts. |
| U11-2-view-student-learning-record | Company-side view-student-learning-record baseline completed for authorized review of the permitted subset of student learning evidence. |
| U11-3-view-student-exam-results | Company-side view-student-exam-results baseline completed for authorized review of only the exam evidence explicitly allowed by privacy and consent rules. |
| U11-4-candidate-shortlist | Company-side candidate-shortlist baseline completed for protected review of already-shortlisted candidates without redefining shortlist action rules. |
| U11-5-candidate-notes | Company-side candidate-notes baseline completed for protected company-internal note capture and review within authorized candidate contexts. |
| U12-1-interview-request | Interview-request baseline completed for authorized creation of the initial interview record and requested-state history from valid candidate contexts. |
| U12-2-availability-selection | Interview-availability-selection baseline completed for structured capture of participant availability against an existing requested interview. |
| U12-3-interview-schedule-confirmation | Interview-schedule-confirmation baseline completed for moving interviews into a confirmed scheduled state with traceable history. |
| U12-4-reschedule-interview | Reschedule-interview baseline completed for explicit interview rescheduling with preserved prior schedule evidence and ordered history. |
| U12-5-cancel-interview | Cancel-interview baseline completed for moving eligible interviews into a cancelled terminal state with preserved history. |
| U12-6-interview-status-tracking | Interview-status-tracking baseline completed for maintaining authoritative current status and ordered history across the full interview lifecycle. |
| U13-1-meeting-url-input | Meeting-url-input baseline completed for protected capture of a provider-aware meeting link against a valid interview context. |
| U13-2-zoom-link-support | Zoom-link-support baseline completed for provider-specific handling of Zoom meeting URLs using format recognition only. |
| U13-3-google-meet-support | Google-meet-support baseline completed for provider-specific handling of Google Meet URLs using format recognition only. |
| U13-4-teams-support | Teams-support baseline completed for provider-specific handling of Microsoft Teams URLs using format recognition only. |
| U13-5-custom-url-support | Custom-url-support baseline completed for protected handling of approved non-provider-specific meeting URLs. |
| U13-6-meeting-link-validation | Meeting-link-validation baseline completed for deterministic format-based validation across Zoom, Google Meet, Teams, and approved custom URLs. |
| U14-1-exam-category | Exam-category baseline completed for stable student-facing organization of exams and preparation materials into reusable categories. |
| U14-2-practice-question-bank | Practice-question-bank baseline completed for protected student preparation using reusable question content kept separate from official exams. |
| U14-3-mock-exam | Mock-exam baseline completed for exam-like preparation attempts that remain separate from official scored exam records. |
## Open CHG

| CHG | Summary | Status |
| --- | --- | --- |
| None | No open change requests. CHG-001 is accepted and closed. | N/A |
## Stage status summary

| Stage | Overall status |
| --- | --- |
| Functional Design | U0-1 through U0-8, U1-1 through U1-8, U2-1 through U2-10, U3-1 through U3-6, U4-1 through U4-8, U5-1 through U5-9, U6-1 through U6-5, U7-1 through U7-8, U8-1 through U8-7, U9-1 through U9-8, U10-1 through U10-6, U11-1 through U11-5, U12-1 through U12-6, U13-1 through U13-6, and U14-1 through U14-3 completed; U14-4-study-plan is the next unstarted unit. U4-2 remained intentionally documented early while the rest of Phase 4 was completed in sequence around it. |
| NFR Requirements | U0-1 through U0-8, U1-1 through U1-8, U2-1 through U2-10, U3-1 through U3-6, U4-1 through U4-8, U5-1 through U5-9, U6-1 through U6-5, U7-1 through U7-8, U8-1 through U8-7, U9-1 through U9-8, U10-1 through U10-6, U11-1 through U11-5, U12-1 through U12-6, U13-1 through U13-6, and U14-1 through U14-3 completed; U14-4-study-plan is the next unstarted unit. U4-2 remained intentionally documented early while the rest of Phase 4 was completed in sequence around it. |
| NFR Design | U0-1 through U0-8, U1-1 through U1-8, U2-1 through U2-10, U3-1 through U3-6, U4-1 through U4-8, U5-1 through U5-9, U6-1 through U6-5, U7-1 through U7-8, U8-1 through U8-7, U9-1 through U9-8, U10-1 through U10-6, U11-1 through U11-5, U12-1 through U12-6, U13-1 through U13-6, and U14-1 through U14-3 completed; U14-4-study-plan is the next unstarted unit. U4-2 remained intentionally documented early while the rest of Phase 4 was completed in sequence around it. |
| Infrastructure Design | U0-1 through U0-8, U1-1 through U1-8, U2-1 through U2-10, U3-1 through U3-6, U4-1 through U4-8, U5-1 through U5-9, U6-1 through U6-5, U7-1 through U7-8, U8-1 through U8-7, U9-1 through U9-8, U10-1 through U10-6, U11-1 through U11-5, U12-1 through U12-6, U13-1 through U13-6, and U14-1 through U14-3 completed; U14-4-study-plan is the next unstarted unit. U4-2 remained intentionally documented early while the rest of Phase 4 was completed in sequence around it. |
| Code Generation | Documentation/code-generation planning completed for U0-1 through U0-8, U1-1 through U1-8, U2-1 through U2-10, U3-1 through U3-6, U4-1 through U4-8, U5-1 through U5-9, U6-1 through U6-5, U7-1 through U7-8, U8-1 through U8-7, U9-1 through U9-8, U10-1 through U10-6, U11-1 through U11-5, U12-1 through U12-6, U13-1 through U13-6, and U14-1 through U14-3; application code remains blocked until ADR-001 is accepted. U4-2 remained intentionally documented early while the rest of Phase 4 was completed in sequence around it. |
