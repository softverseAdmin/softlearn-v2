# Functional design: U0-2-user-personas-definition

## Purpose

Define the primary personas that shape product behavior, requirements prioritization, privacy expectations, and workflow design for the platform without making technology or implementation decisions.

## User story

As the product and delivery team, we need grounded personas so later units can design learning, matching, vacancy, interview, privacy, and admin flows around real user motivations and constraints instead of assumptions.

## Functional requirements

- Define the following personas:
  - Foreign IT engineer learner
  - Japanese learner preparing IT career
  - Company recruiter
  - Company engineer reviewer
  - Platform admin
- For each persona, capture:
  - Background
  - Goals
  - Pain points
  - Technical level
  - Platform usage scenarios
- Keep personas focused on user understanding and behavior.
- Keep personas technology-agnostic and free from implementation detail.

## Persona definitions

### 1. Foreign IT engineer learner

**Background**

- An early- to mid-career IT engineer from outside Japan who wants to improve employability in the Japanese market.
- May already have software development, infrastructure, QA, data, or support experience.
- Often balances technical upskilling with Japanese-language improvement and relocation or visa-related planning.

**Goals**

- Understand which IT skills and Japanese level are expected by employers in Japan.
- Build a credible profile that shows current strengths and readiness gaps.
- Learn through structured courses and validate ability through exams.
- Discover vacancies that match skills, language level, and preferred work style.
- Control how profile and exam data are shared with companies.

**Pain points**

- Limited clarity about how Japanese employers evaluate foreign candidates.
- Difficulty connecting learning progress to real job opportunities.
- Anxiety about whether language level or exam performance will be judged unfairly.
- Risk of oversharing personal or performance data before being ready.
- Need to coordinate interviews across time zones or changing availability.

**Technical level**

- Moderate to high technical literacy.
- Comfortable using online learning tools and profile-management flows.
- May vary in familiarity with Japanese hiring conventions and formal documentation expectations.

**Platform usage scenarios**

- Creates and updates a learner profile with skills, experience, and language level.
- Enrolls in targeted courses to close gaps for a desired role.
- Takes practice exams and formal exams to prove readiness.
- Reviews matched vacancies and decides which roles to apply for.
- Enables or restricts company visibility into profile fields and exam results.
- Coordinates interviews using platform scheduling and validated meeting links.

### 2. Japanese learner preparing IT career

**Background**

- A learner in Japan preparing for an IT career transition, first technical job, or structured skill upgrade.
- May come from university, vocational education, self-study, or another profession.
- Wants a practical path from learning to employability.

**Goals**

- Follow a clear learning journey from fundamentals to job readiness.
- Use courses and exam preparation to measure progress.
- Find vacancies that align with current skills, interests, and growth potential.
- Understand what additional skills or certifications are needed for target roles.
- Build confidence before applying and interviewing.

**Pain points**

- Uncertainty about which technical skills matter most for entry-level opportunities.
- Difficulty translating learning activity into employer-facing evidence.
- Fear of failing exams or applying too early.
- Information overload from many possible learning paths and job categories.
- Need for simple, motivating progress visibility.

**Technical level**

- Beginner to intermediate technical literacy.
- Comfortable with guided learning experiences but may need clearer explanations and more structure than experienced engineers.

**Platform usage scenarios**

- Browses beginner-friendly or role-targeted courses.
- Uses exam preparation tools and mock exams to improve confidence.
- Tracks progress and readiness for specific job categories.
- Searches vacancies using skills, language, location, and preference filters later.
- Reviews matched opportunities and prepares for interviews step by step.

### 3. Company recruiter

**Background**

- A hiring or talent-acquisition professional representing a company seeking candidates with technical and language fit.
- Responsible for moving candidates through screening and interview coordination efficiently.
- Needs enough candidate evidence to make shortlisting decisions without violating privacy rules.

**Goals**

- Find candidates who fit vacancy requirements in skills, language level, work style, location, and salary expectations.
- Use explainable matching to understand why a candidate was surfaced.
- Review only the student information the company is permitted to see.
- Manage applications, shortlist decisions, and interview progression clearly.
- Reduce screening time while preserving hiring quality.

**Pain points**

- Difficulty identifying genuine readiness from incomplete or inconsistent candidate data.
- Risk of relying on noisy or overly broad matches.
- Need to respect privacy rules while still making confident hiring decisions.
- Coordination overhead when comparing many candidates across many vacancies.
- Need for interview scheduling without manual back-and-forth.

**Technical level**

- Moderate digital literacy.
- Comfortable with structured dashboards, candidate review workflows, and scheduling tools.
- Usually not a deeply technical evaluator of engineering detail.

**Platform usage scenarios**

- Maintains company profile and vacancy requirements.
- Reviews matched candidates with permission-limited profile data.
- Shortlists candidates for deeper review or interview.
- Coordinates interviews and shares validated meeting links.
- Tracks application status and team review progress.

### 4. Company engineer reviewer

**Background**

- A technical team member who supports hiring by evaluating candidate readiness for practical engineering work.
- Reviews evidence after initial recruiter screening and before or during interview planning.
- Cares more about technical signals than recruiting workflow metrics.

**Goals**

- Quickly understand a candidate's technical strengths, learning progress, and exam evidence.
- Review candidate readiness in a structured way rather than relying only on resumes.
- Compare candidates against role-specific skill expectations.
- Provide useful hiring feedback to recruiters and hiring managers.

**Pain points**

- Limited time to review many candidates in detail.
- Difficulty trusting profiles that lack structured evidence.
- Need to understand learning and exam data without seeing unnecessary personal details.
- Risk of overinterpreting scores without context.

**Technical level**

- High technical literacy.
- Comfortable evaluating skill evidence, structured results, and role-relevant technical indicators.
- Less interested in administrative workflows than recruiters or admins.

**Platform usage scenarios**

- Reviews candidate skill profile, course completion, and allowed exam outcomes.
- Checks how a candidate aligns with vacancy skill expectations.
- Uses explainable matching information to understand why the candidate was surfaced.
- Contributes interview readiness feedback or technical review notes later.

### 5. Platform admin

**Background**

- An internal operator responsible for platform governance, support, quality control, and policy enforcement.
- Oversees users, companies, learning content, exams, vacancies, and sensitive operational settings.
- Needs broad oversight without bypassing auditability expectations.

**Goals**

- Maintain platform integrity, safety, and policy compliance.
- Manage users, companies, courses, exams, and vacancies reliably.
- Monitor misuse, quality issues, and operational problems.
- Ensure privacy permissions and visibility rules are applied correctly.
- Support issue resolution without exposing more data than necessary.

**Pain points**

- Broad responsibility across many domains and user types.
- Need to resolve disputes or support issues with good audit visibility.
- Risk of accidental overreach if admin powers are too broad or poorly explained.
- Need for consistent workflows to manage content, users, and platform settings.

**Technical level**

- Moderate to high platform-operational literacy.
- Comfortable with structured administrative workflows, reporting views, and rule enforcement.
- May not be an engineer, so admin experiences should not assume deep technical knowledge.

**Platform usage scenarios**

- Reviews user, company, course, exam, and vacancy records.
- Responds to operational issues, policy violations, or permission disputes.
- Verifies that company access and privacy rules behave as intended.
- Monitors platform health, content quality, and moderation concerns later.

## Inputs

- Product vision
- U0-1 requirements baseline

## Outputs

- Persona definitions for the five required user groups
- User-behavior input for later feature, privacy, matching, and admin design
- Better understanding of how learning and hiring workflows differ by actor

## User flow

1. Identify the high-value learner, company, and admin users.
2. Describe each persona's context, motivations, and frustrations.
3. Capture how each persona is expected to use the platform.
4. Use those behaviors to guide later units without locking implementation details.

## Acceptance criteria

- All five requested personas are present.
- Each persona includes background, goals, pain points, technical level, and platform usage scenarios.
- Personas help explain different privacy, matching, learning, and hiring expectations.
- Personas stay focused on user behavior rather than stack or implementation choices.

## Out of scope

- Technology choice
- UI mockups
- Detailed feature prioritization
- API, database, and workflow implementation design
- Production application code
