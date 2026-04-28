# Functional design: U0-1-platform-requirements-definition

## Purpose

Define the baseline platform requirements for the learning and career matching product before technology selection, architecture finalization, or application implementation begins.

## User story

As the product and delivery team, we need a clear requirement baseline for students, companies, and admins so later inception and construction units can design the platform consistently without introducing silent scope drift.

## Functional requirements

### 1. Actors and roles

- Define the platform actors as:
  - students / learners
  - company users
  - admins
- Define the primary responsibility boundaries for each actor.
- Establish that company users and admins are distinct roles with different privileges.

### 2. Student and learner requirements

- Students must be able to register, sign in, and maintain a learner profile later in the product lifecycle.
- Students must be able to manage profile data relevant to job matching, including skills, language ability, experience, and preferences.
- Students must be able to participate in courses, lessons, exams, and exam-preparation activities.
- Students must be able to review their own learning progress, exam results, and readiness indicators.
- Students must be able to search vacancies, review vacancy details, and apply to suitable roles later.
- Students must be able to manage availability and interview scheduling information later.
- Students must be able to control privacy and permissions for their profile and exam-related data.

### 3. Company requirements

- Company users must be able to register, sign in, and maintain company profile information later in the product lifecycle.
- Companies must be able to create and manage vacancies.
- Companies must be able to define vacancy expectations such as skills, Japanese level, work style, salary range, location, and interview process.
- Companies must be able to view matched students based only on permitted data.
- Companies must be able to review student information, learning evidence, and exam results only when visibility rules allow it.
- Companies must be able to manage applications, shortlist candidates, reject candidates, and coordinate interviews later.
- Companies must be able to provide interview meeting URLs from approved patterns or validated custom URLs later.

### 4. Admin requirements

- Admins must be able to manage students, company accounts, courses, exams, vacancies, and platform settings later.
- Admins must be able to monitor platform activity and enforce platform rules.
- Admin functions must be treated as protected capabilities requiring stronger access control than general user operations.

### 5. Learning requirements

- The platform must support courses and lessons as structured learning content.
- The platform must support enrollment and progress visibility later.
- Learning requirements must support both skill development and employability outcomes.

### 6. Exam and exam-preparation requirements

- The platform must support exams, questions, answer options, attempts, scoring, and result visibility later.
- The platform must support exam-preparation activities such as mock exams, practice materials, and study-plan-oriented features later.
- Exam results must be visible to the student and must only be visible to companies when policy and consent rules allow it.

### 7. Vacancy requirements

- Vacancies must capture information relevant to matching, including skill needs, language expectations, location, work style, compensation, and hiring process.
- Vacancy requirements must support search and filtering later from the student perspective.

### 8. Matching requirements

- The platform must support student-company matching based on skills, courses, exams, language level, location, and preferences.
- Matching requirements must favor explainable and reviewable outcomes over opaque recommendations.
- Matching outputs must be limited by privacy and permissions.

### 9. Interview scheduling and meeting URL requirements

- The platform must support interview scheduling between students and companies later.
- The platform must support interview status visibility, rescheduling, and cancellation later.
- Meeting URLs must support Zoom, Google Meet, Microsoft Teams, and validated custom URLs later.
- Meeting links must be validated before they are stored or shared later.

### 10. Privacy and permissions requirements

- Student privacy must be treated as a core product requirement, not an optional enhancement.
- Companies must not automatically see all student data.
- Student profile visibility, exam-result visibility, and matching exposure must follow explicit permission rules.
- The platform must preserve an auditable record of company access to protected student information later.
- Admin access must be permission-controlled and separated from normal user access.

## Inputs

- Product vision
- Initial problem statement
- AI-DLC operating rules

## Outputs

- Completed U0-1 platform requirement design documents
- A traceable baseline for personas, feature breakdown, technology selection, security, data model, and later construction units
- Clear scope boundaries for privacy, permissions, matching, interviews, and platform administration

## User flow

1. Capture the target platform purpose and primary actors.
2. Break requirements down by actor and domain area.
3. Record access-control, privacy, and explainability constraints at the requirement level.
4. Confirm what is intentionally deferred to later units and later implementation stages.

## Acceptance criteria

- Students, companies, and admins are described as distinct actors with clear platform responsibilities.
- Courses, exams, exam preparation, vacancies, matching, interviews, meeting URLs, and privacy are all represented in the baseline requirements.
- The requirements state that company access to student information is permission-controlled.
- The requirements state that matching must remain explainable.
- No final technology stack is selected or implied.
- No production application code is introduced by this unit.

## Out of scope

- Final technology choice
- Final architecture selection
- Detailed data schema
- API or UI design
- Production application code
- Exact scoring formulas for matching
- Final operational policies that depend on later security, compliance, or infrastructure decisions
