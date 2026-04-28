# Inception v1 high-level data model

## Goal

Define the conceptual data model for the platform so later schema, API, authorization, matching, and reporting units share the same domain vocabulary.

## Modeling principles

- Keep the model conceptual and implementation-agnostic.
- Favor clear relational boundaries because the platform includes identity, permissions, learning records, exams, vacancies, applications, interviews, and audit trails.
- Treat privacy, consent, and auditability as first-class data concerns.
- Separate platform identities from role-specific profile and workflow data.

## Core entity groups

### 1. Identity and access

- **User**
- **Role**
- **UserRole**
- **Session**
- **ConsentLog**
- **AuditLog**

### 2. Student and learner profile

- **StudentProfile**
- **StudentSkill**
- **StudentEducation**
- **StudentExperience**
- **StudentLanguageLevel**
- **Resume**
- **StudentAvailability**
- **StudentPrivacySetting**

### 3. Company and hiring organization

- **CompanyProfile**
- **CompanyMember**
- **CompanyHiringPreference**

### 4. Learning domain

- **Course**
- **Lesson**
- **Enrollment**
- **LessonProgress**
- **CourseCompletion**

### 5. Exam and exam-preparation domain

- **Exam**
- **ExamCategory**
- **Question**
- **AnswerOption**
- **ExamAttempt**
- **ExamAnswer**
- **PracticeQuestion**
- **MockExam**
- **StudyPlan**
- **PerformanceRecord**

### 6. Vacancy and job-search domain

- **Vacancy**
- **VacancySkillRequirement**
- **VacancyLanguageRequirement**
- **VacancyLocationPreference**
- **JobBookmark**

### 7. Matching and readiness domain

- **Skill**
- **LanguageLevel**
- **MatchResult**
- **MatchFactor**
- **ReadinessScore**

### 8. Application and company review domain

- **Application**
- **ApplicationStatusHistory**
- **CandidateNote**
- **ShortlistEntry**

### 9. Interview and meeting domain

- **Interview**
- **InterviewParticipant**
- **MeetingLink**

### 10. Notifications and operations

- **Notification**
- **NotificationPreference**

## Entity descriptions

| Entity | Purpose |
| --- | --- |
| User | Base platform identity for students, company users, and admins. |
| Role | Logical role such as student, company member, or admin. |
| UserRole | Role assignment for a user, supporting authorization and future role expansion. |
| Session | Browser-oriented authentication/session tracking concept for local-first and later deployed environments. |
| StudentProfile | Learner-facing profile record connected to a user. |
| StudentSkill | Structured skill claims for the learner. |
| StudentEducation | Education history relevant to employability. |
| StudentExperience | Work or project experience relevant to matching. |
| StudentLanguageLevel | Language evidence, including Japanese level. |
| Resume | Resume or CV metadata if resume support is enabled later. |
| StudentAvailability | Availability and interview scheduling readiness. |
| StudentPrivacySetting | Visibility and permission configuration for profile and result sharing. |
| CompanyProfile | Organization-level identity for employers. |
| CompanyMember | User membership inside a company. |
| CompanyHiringPreference | Default hiring preferences for the company. |
| Course | Structured learning offering. |
| Lesson | Sub-unit of a course. |
| Enrollment | Student enrollment in a course. |
| LessonProgress | Progress state at lesson level. |
| CourseCompletion | Completion or readiness outcome for a course. |
| Exam | Assessment container with rules and metadata. |
| ExamCategory | Classification for exams and preparation content. |
| Question | Individual exam or practice question. |
| AnswerOption | Candidate answer options for objective questions. |
| ExamAttempt | Student attempt record for an exam. |
| ExamAnswer | Per-question response inside an exam attempt. |
| PracticeQuestion | Practice-oriented question bank entity. |
| MockExam | Preparation exam assembled for rehearsal. |
| StudyPlan | Structured preparation plan for a learner. |
| PerformanceRecord | Progress and performance trends across learning and exam preparation. |
| Skill | Shared skill taxonomy used by student profiles and vacancies. |
| LanguageLevel | Shared language-level taxonomy. |
| Vacancy | Job opening published by a company. |
| VacancySkillRequirement | Skill expectations attached to a vacancy. |
| VacancyLanguageRequirement | Language expectations attached to a vacancy. |
| VacancyLocationPreference | Location and work-style expectations for a vacancy. |
| JobBookmark | Student bookmark of a vacancy. |
| MatchResult | Match output between a student and a vacancy or company. |
| MatchFactor | Explainable component scores behind a match result. |
| ReadinessScore | Aggregated readiness measure based on learning and exam evidence. |
| Application | Student application to a vacancy. |
| ApplicationStatusHistory | Status transitions for an application. |
| CandidateNote | Company-side structured notes on a candidate. |
| ShortlistEntry | Company shortlist state for a candidate or application. |
| Interview | Interview schedule and status record. |
| InterviewParticipant | People attached to an interview. |
| MeetingLink | Stored and validated interview meeting URL. |
| Notification | Notification event to a user. |
| NotificationPreference | User-level notification settings. |
| ConsentLog | Audit-friendly record of user consent and visibility decisions. |
| AuditLog | Record of privileged or sensitive actions, especially access to student data. |

## Relationship highlights

### Identity and roles

- A **User** can hold one or more **Role** assignments through **UserRole**.
- A **User** may correspond to a **StudentProfile**, a **CompanyMember**, or an admin role depending on assigned roles.
- **Session** records belong to a **User**.

### Student and privacy

- A **StudentProfile** belongs to one **User**.
- A **StudentProfile** can have many **StudentSkill**, **StudentEducation**, **StudentExperience**, **StudentLanguageLevel**, **Resume**, and **StudentAvailability** records.
- A **StudentProfile** can have one or more **StudentPrivacySetting** entries to govern visibility behavior.
- Privacy changes and sharing decisions should create **ConsentLog** records.

### Company and vacancy

- A **CompanyProfile** can have many **CompanyMember** users.
- A **CompanyProfile** can define **CompanyHiringPreference** records.
- A **CompanyProfile** can publish many **Vacancy** records.
- Each **Vacancy** can have many **VacancySkillRequirement**, **VacancyLanguageRequirement**, and **VacancyLocationPreference** records.

### Learning and exams

- A **Course** can contain many **Lesson** records.
- A **StudentProfile** can have many **Enrollment** records.
- An **Enrollment** connects a student to a **Course**.
- A student’s progress is tracked through **LessonProgress** and **CourseCompletion**.
- An **Exam** can have many **Question** records, each with many **AnswerOption** records.
- A **StudentProfile** can have many **ExamAttempt** records.
- An **ExamAttempt** can contain many **ExamAnswer** records.
- **ExamCategory**, **PracticeQuestion**, **MockExam**, **StudyPlan**, and **PerformanceRecord** support preparation workflows.

### Matching and hiring

- A **Skill** taxonomy is reused by both **StudentSkill** and **VacancySkillRequirement**.
- A **LanguageLevel** taxonomy is reused by student and vacancy language records.
- A **MatchResult** links a student to a vacancy or company-facing opportunity context.
- A **MatchResult** can have many **MatchFactor** records for explainability.
- A **ReadinessScore** belongs to a student and may be recalculated from learning and exam evidence.
- An **Application** links a **StudentProfile** to a **Vacancy**.
- An **Application** can have many **ApplicationStatusHistory** records.
- **CandidateNote** and **ShortlistEntry** support company review workflows around a student or application.

### Interviews and notifications

- An **Interview** is usually attached to an **Application** and can involve multiple **InterviewParticipant** records.
- An **Interview** may have one or more **MeetingLink** records over time to support rescheduling and provider changes.
- A **Notification** belongs to a **User**.
- A **NotificationPreference** belongs to a **User**.

### Audit and consent

- **ConsentLog** records should link back to the relevant **User**, **StudentProfile**, or visibility decision context.
- **AuditLog** records should capture privileged access, especially company access to student data and admin actions.

## Cross-cutting modeling notes

- Prefer shared taxonomies such as **Skill** and **LanguageLevel** to avoid fragmented matching logic.
- Keep matching explainability visible in the model through **MatchResult**, **MatchFactor**, and **ReadinessScore**.
- Keep privacy and audit behavior visible in the model through **StudentPrivacySetting**, **ConsentLog**, and **AuditLog**.
- Keep the conceptual model relational even if some later storage optimizations differ.

## Out of scope

- Field-level schema
- Index design
- ORM/model definitions
- Migrations
- Exact reporting model design
- Final storage optimization choices
