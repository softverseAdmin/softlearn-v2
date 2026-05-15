from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from common.models import ApplicationLogEntry, ErrorReport
from users.models import (
    Application,
    ApplicationStatusHistory,
    AuditLog,
    CandidateNote,
    CandidateReviewAccess,
    CandidateShortlist,
    Company,
    CompanyDashboardMetric,
    CompanyHiringPreferences,
    CompanyMember,
    Course,
    CourseAssessment,
    CourseAssessmentAttempt,
    CourseAssessmentAttemptSelection,
    CourseAssessmentOption,
    CourseAssessmentQuestion,
    DataConsent,
    DataDeletionRequest,
    DataExportRequest,
    Exam,
    ExamAnswerOption,
    ExamAttempt,
    ExamAttemptAnswer,
    ExamCategory,
    ExamQuestion,
    ExamResult,
    Interview,
    InterviewAvailability,
    InterviewEvent,
    JobBookmark,
    LearningRecord,
    Lesson,
    LessonProgress,
    MockExam,
    MockExamAttempt,
    MockExamAttemptAnswer,
    Notification,
    NotificationDelivery,
    NotificationEvent,
    NotificationPreference,
    PracticeQuestion,
    PracticeQuestionAttempt,
    PracticeQuestionOption,
    ScheduledTask,
    Skill,
    StudentAvailabilityProfile,
    StudentDashboardMetric,
    StudentDataAccessLog,
    StudentEducation,
    StudentExperience,
    StudentPerformanceMetric,
    StudentProfile,
    StudentResume,
    StudentSkill,
    StudentVisibilityEvent,
    StudentVisibilitySettings,
    StudyPlan,
    StudyPlanItem,
    User,
    Vacancy,
    VacancyLanguageRequirement,
    VacancySkillRequirement,
)


SEED_DOMAIN = "demo.softlearn.local"
DEFAULT_LESSON_VIDEO_URL = "https://www.youtube.com/embed/IjS9eTpmhgk?si=BFiYXiVlYZL2QdTA"


@dataclass(frozen=True)
class CompanySeed:
    name: str
    description: str
    preferred_skills: list[str]
    default_experience_level: str
    salary_min: int
    salary_max: int
    vacancy_title: str
    vacancy_description: str
    employment_type: str
    experience_level: str
    location: str
    work_style: str
    relocation_support: bool
    vacancy_skills: list[tuple[str, str]]
    vacancy_languages: list[tuple[str, str, str]]


@dataclass(frozen=True)
class StudentSeed:
    full_name: str
    desired_job_type: str
    desired_work_location: str
    japanese_level: str
    english_level: str
    job_search_status: str
    interview_availability: str
    scheduling_notes: str
    institution: str
    field_of_study: str
    education_start: date
    education_end: date | None
    education_status: str
    organization: str
    role_title: str
    experience_type: str
    experience_start: date
    experience_end: date | None
    is_current: bool
    experience_summary: str
    resume_name: str
    resume_file: str
    resume_source: str
    skills: list[tuple[str, str]]


@dataclass(frozen=True)
class CourseSeed:
    title: str
    description: str
    category: str
    difficulty_level: str
    estimated_hours: int
    lessons: list[tuple[str, str, str]]


@dataclass(frozen=True)
class ExamSeed:
    category_name: str
    category_description: str
    category_icon: str
    title: str
    description: str
    category: str
    duration_minutes: int
    passing_score_percent: int
    questions: list[tuple[str, str, list[tuple[str, bool, str]]]]
    practice: tuple[str, str, str, str, list[tuple[str, bool, str]]]
    mock_title: str
    mock_description: str


class Command(BaseCommand):
    help = "Populate the local database with realistic demo data and unusable passwords."

    companies: list[CompanySeed] = [
        CompanySeed(
            name="Sakura Dynamics",
            description="Builds React and Node platforms for Japanese retail and logistics teams.",
            preferred_skills=["React", "TypeScript", "Node.js"],
            default_experience_level=CompanyHiringPreferences.ExperienceLevel.JUNIOR,
            salary_min=4800000,
            salary_max=6200000,
            vacancy_title="Frontend Engineer",
            vacancy_description="Own student-facing dashboards, collaborate with design, and ship accessible React features.",
            employment_type="Full-time",
            experience_level="Junior",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=True,
            vacancy_skills=[
                ("React", VacancySkillRequirement.RequirementType.REQUIRED),
                ("TypeScript", VacancySkillRequirement.RequirementType.REQUIRED),
                ("Tailwind CSS", VacancySkillRequirement.RequirementType.PREFERRED),
            ],
            vacancy_languages=[
                (
                    VacancyLanguageRequirement.Language.ENGLISH,
                    VacancyLanguageRequirement.Level.BUSINESS,
                    VacancyLanguageRequirement.RequirementType.REQUIRED,
                ),
                (
                    VacancyLanguageRequirement.Language.JAPANESE,
                    VacancyLanguageRequirement.Level.CONVERSATIONAL,
                    VacancyLanguageRequirement.RequirementType.PREFERRED,
                ),
            ],
        ),
        CompanySeed(
            name="BlueOrbit Finance",
            description="Delivers cloud-native finance tooling for SME treasury and compliance teams.",
            preferred_skills=["Python", "SQL", "AWS"],
            default_experience_level=CompanyHiringPreferences.ExperienceLevel.MID,
            salary_min=5600000,
            salary_max=7800000,
            vacancy_title="Data Analyst",
            vacancy_description="Analyze product metrics, build reporting dashboards, and explain trends to business partners.",
            employment_type="Full-time",
            experience_level="Mid",
            location="Osaka",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=False,
            vacancy_skills=[
                ("Python", VacancySkillRequirement.RequirementType.REQUIRED),
                ("SQL", VacancySkillRequirement.RequirementType.REQUIRED),
                ("Excel", VacancySkillRequirement.RequirementType.PREFERRED),
            ],
            vacancy_languages=[
                (
                    VacancyLanguageRequirement.Language.ENGLISH,
                    VacancyLanguageRequirement.Level.BUSINESS,
                    VacancyLanguageRequirement.RequirementType.REQUIRED,
                )
            ],
        ),
        CompanySeed(
            name="Mirai Health Systems",
            description="Creates secure scheduling and telehealth experiences for regional clinics.",
            preferred_skills=["AWS", "Security", "Django"],
            default_experience_level=CompanyHiringPreferences.ExperienceLevel.MID,
            salary_min=6000000,
            salary_max=8200000,
            vacancy_title="Cloud Support Specialist",
            vacancy_description="Maintain AWS environments, improve reliability, and document recovery playbooks.",
            employment_type="Full-time",
            experience_level="Mid",
            location="Nagoya",
            work_style=Vacancy.WorkStyle.ONSITE,
            relocation_support=True,
            vacancy_skills=[
                ("AWS", VacancySkillRequirement.RequirementType.REQUIRED),
                ("Linux", VacancySkillRequirement.RequirementType.PREFERRED),
                ("Python", VacancySkillRequirement.RequirementType.PREFERRED),
            ],
            vacancy_languages=[
                (
                    VacancyLanguageRequirement.Language.JAPANESE,
                    VacancyLanguageRequirement.Level.BUSINESS,
                    VacancyLanguageRequirement.RequirementType.REQUIRED,
                )
            ],
        ),
        CompanySeed(
            name="PixelCraft Studio",
            description="Design partner for early-stage SaaS products focused on product UX and growth.",
            preferred_skills=["Figma", "UX Research", "UI Design"],
            default_experience_level=CompanyHiringPreferences.ExperienceLevel.JUNIOR,
            salary_min=4500000,
            salary_max=6800000,
            vacancy_title="Product Designer",
            vacancy_description="Run design critiques, prototype flows, and translate research into polished UI systems.",
            employment_type="Full-time",
            experience_level="Junior",
            location="Kyoto",
            work_style=Vacancy.WorkStyle.REMOTE,
            relocation_support=False,
            vacancy_skills=[
                ("Figma", VacancySkillRequirement.RequirementType.REQUIRED),
                ("UI Design", VacancySkillRequirement.RequirementType.REQUIRED),
                ("UX Research", VacancySkillRequirement.RequirementType.PREFERRED),
            ],
            vacancy_languages=[
                (
                    VacancyLanguageRequirement.Language.ENGLISH,
                    VacancyLanguageRequirement.Level.CONVERSATIONAL,
                    VacancyLanguageRequirement.RequirementType.REQUIRED,
                )
            ],
        ),
        CompanySeed(
            name="Hikari Growth Labs",
            description="Helps consumer brands scale acquisition, performance, and lifecycle marketing programs.",
            preferred_skills=["SEO", "Google Analytics", "Content Strategy"],
            default_experience_level=CompanyHiringPreferences.ExperienceLevel.JUNIOR,
            salary_min=4200000,
            salary_max=5900000,
            vacancy_title="Digital Marketing Specialist",
            vacancy_description="Plan multi-channel campaigns, monitor conversion funnels, and report weekly learnings.",
            employment_type="Full-time",
            experience_level="Junior",
            location="Fukuoka",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=False,
            vacancy_skills=[
                ("SEO", VacancySkillRequirement.RequirementType.REQUIRED),
                ("Google Analytics", VacancySkillRequirement.RequirementType.REQUIRED),
                ("Content Strategy", VacancySkillRequirement.RequirementType.PREFERRED),
            ],
            vacancy_languages=[
                (
                    VacancyLanguageRequirement.Language.ENGLISH,
                    VacancyLanguageRequirement.Level.CONVERSATIONAL,
                    VacancyLanguageRequirement.RequirementType.PREFERRED,
                ),
                (
                    VacancyLanguageRequirement.Language.JAPANESE,
                    VacancyLanguageRequirement.Level.BUSINESS,
                    VacancyLanguageRequirement.RequirementType.REQUIRED,
                ),
            ],
        ),
    ]

    students: list[StudentSeed] = [
        StudentSeed(
            full_name="Arjun Khadka",
            desired_job_type="Frontend Engineer",
            desired_work_location="Tokyo",
            japanese_level="N3",
            english_level="Business",
            job_search_status=StudentAvailabilityProfile.JobSearchStatus.ACTIVELY_LOOKING,
            interview_availability="Weekdays after 18:00 JST",
            scheduling_notes="Prefers remote-first screening rounds and same-week feedback when possible.",
            institution="Tokyo International IT College",
            field_of_study="Software Engineering",
            education_start=date(2022, 4, 1),
            education_end=None,
            education_status=StudentEducation.CompletionStatus.IN_PROGRESS,
            organization="Campus Dev Lab",
            role_title="Frontend Project Lead",
            experience_type=StudentExperience.ExperienceType.PROJECT,
            experience_start=date(2024, 2, 1),
            experience_end=None,
            is_current=True,
            experience_summary="Led a three-person team building a React dashboard with protected student views and audit logs.",
            resume_name="Arjun Frontend Resume",
            resume_file="arjun-khadka-frontend-resume.pdf",
            resume_source=StudentResume.SourceType.UPLOADED,
            skills=[("React", StudentSkill.Proficiency.ADVANCED), ("TypeScript", StudentSkill.Proficiency.INTERMEDIATE), ("Tailwind CSS", StudentSkill.Proficiency.INTERMEDIATE)],
        ),
        StudentSeed(
            full_name="Yuki Tanaka",
            desired_job_type="Data Analyst",
            desired_work_location="Osaka",
            japanese_level="Native",
            english_level="Business",
            job_search_status=StudentAvailabilityProfile.JobSearchStatus.OPEN_TO_OFFERS,
            interview_availability="Tue/Thu mornings",
            scheduling_notes="Happy to share dashboards and SQL notebooks during interview loops.",
            institution="Osaka Business University",
            field_of_study="Business Analytics",
            education_start=date(2021, 4, 1),
            education_end=date(2025, 3, 31),
            education_status=StudentEducation.CompletionStatus.COMPLETED,
            organization="Northwind Analytics Internship",
            role_title="Analytics Intern",
            experience_type=StudentExperience.ExperienceType.INTERNSHIP,
            experience_start=date(2024, 6, 1),
            experience_end=date(2024, 9, 30),
            is_current=False,
            experience_summary="Built weekly KPI dashboards and automated CSV cleanup with Python and SQL.",
            resume_name="Yuki Data Resume",
            resume_file="yuki-tanaka-data-resume.pdf",
            resume_source=StudentResume.SourceType.UPLOADED,
            skills=[("Python", StudentSkill.Proficiency.ADVANCED), ("SQL", StudentSkill.Proficiency.ADVANCED), ("Excel", StudentSkill.Proficiency.ADVANCED)],
        ),
        StudentSeed(
            full_name="Meera Singh",
            desired_job_type="Cloud Support Specialist",
            desired_work_location="Nagoya",
            japanese_level="N2",
            english_level="Fluent",
            job_search_status=StudentAvailabilityProfile.JobSearchStatus.ACTIVELY_LOOKING,
            interview_availability="Flexible after 17:00 JST",
            scheduling_notes="Interested in infrastructure roles with mentorship and incident response exposure.",
            institution="Nagoya Technical Institute",
            field_of_study="Cloud Infrastructure",
            education_start=date(2020, 4, 1),
            education_end=date(2024, 3, 31),
            education_status=StudentEducation.CompletionStatus.COMPLETED,
            organization="InfraOps Volunteer Group",
            role_title="Cloud Ops Volunteer",
            experience_type=StudentExperience.ExperienceType.VOLUNTEER,
            experience_start=date(2024, 4, 1),
            experience_end=None,
            is_current=True,
            experience_summary="Maintains AWS sandboxes, documents IAM best practices, and supports student workshops.",
            resume_name="Meera Cloud Resume",
            resume_file="meera-singh-cloud-resume.pdf",
            resume_source=StudentResume.SourceType.MANUAL,
            skills=[("AWS", StudentSkill.Proficiency.ADVANCED), ("Linux", StudentSkill.Proficiency.INTERMEDIATE), ("Python", StudentSkill.Proficiency.INTERMEDIATE)],
        ),
        StudentSeed(
            full_name="Sora Nakamura",
            desired_job_type="Product Designer",
            desired_work_location="Kyoto",
            japanese_level="Native",
            english_level="Conversational",
            job_search_status=StudentAvailabilityProfile.JobSearchStatus.OPEN_TO_OFFERS,
            interview_availability="Mon/Wed afternoons",
            scheduling_notes="Prefers portfolio walkthroughs and product case interviews.",
            institution="Kyoto Design Academy",
            field_of_study="Product Design",
            education_start=date(2021, 4, 1),
            education_end=None,
            education_status=StudentEducation.CompletionStatus.IN_PROGRESS,
            organization="Pixel Workshop",
            role_title="UX Design Freelancer",
            experience_type=StudentExperience.ExperienceType.FREELANCE,
            experience_start=date(2024, 1, 10),
            experience_end=None,
            is_current=True,
            experience_summary="Designed onboarding flows, usability test reports, and UI kits for three startup clients.",
            resume_name="Sora Design Resume",
            resume_file="sora-nakamura-design-resume.pdf",
            resume_source=StudentResume.SourceType.EXTERNAL,
            skills=[("Figma", StudentSkill.Proficiency.ADVANCED), ("UI Design", StudentSkill.Proficiency.ADVANCED), ("UX Research", StudentSkill.Proficiency.INTERMEDIATE)],
        ),
        StudentSeed(
            full_name="Rina Patel",
            desired_job_type="Digital Marketing Specialist",
            desired_work_location="Fukuoka",
            japanese_level="N3",
            english_level="Fluent",
            job_search_status=StudentAvailabilityProfile.JobSearchStatus.ACTIVELY_LOOKING,
            interview_availability="Weekdays 10:00-16:00 JST",
            scheduling_notes="Can share campaign retrospectives and landing-page experiments on request.",
            institution="Fukuoka Media College",
            field_of_study="Digital Marketing",
            education_start=date(2020, 4, 1),
            education_end=date(2024, 3, 31),
            education_status=StudentEducation.CompletionStatus.COMPLETED,
            organization="GrowthSpark Agency",
            role_title="Marketing Coordinator",
            experience_type=StudentExperience.ExperienceType.WORK,
            experience_start=date(2024, 4, 1),
            experience_end=None,
            is_current=True,
            experience_summary="Ran SEO content calendars, optimized paid campaigns, and tracked funnel performance weekly.",
            resume_name="Rina Marketing Resume",
            resume_file="rina-patel-marketing-resume.pdf",
            resume_source=StudentResume.SourceType.UPLOADED,
            skills=[("SEO", StudentSkill.Proficiency.ADVANCED), ("Google Analytics", StudentSkill.Proficiency.INTERMEDIATE), ("Content Strategy", StudentSkill.Proficiency.INTERMEDIATE)],
        ),
    ]

    courses: list[CourseSeed] = [
        CourseSeed(
            title="React Frontend Engineering",
            description="Build production-ready React interfaces with routing, state modeling, and accessible component patterns.",
            category="Programming",
            difficulty_level="Intermediate",
            estimated_hours=32,
            lessons=[
                (
                    "Component Architecture",
                    "Plan reusable component boundaries and data flow.",
                    "React projects stay maintainable when each component has one clear responsibility.\n\nIn this lesson you will map page sections into reusable components, decide where state should live, and define props that keep each part easy to test and update.\n\n- Identify container and presentational responsibilities.\n- Keep shared state close to the components that truly need it.\n- Prefer small, reusable UI building blocks over page-specific duplication.",
                ),
                (
                    "Protected Routing",
                    "Handle authenticated navigation and role-based page shells.",
                    "Protected routing controls who can open a page and what layout they should see after login.\n\nThis lesson focuses on guarding student routes, redirecting unauthenticated users, and aligning navigation with the active role so the workspace feels consistent and secure.\n\n- Validate authentication before rendering protected pages.\n- Match the workspace layout to the signed-in role.\n- Redirect safely when the user does not have permission.",
                ),
                (
                    "Catalog UI Patterns",
                    "Build polished cards, filters, and responsive search experiences.",
                    "Catalog screens work best when filters, cards, and empty states feel predictable on every device.\n\nIn this lesson you will review spacing systems, search interactions, and data-card hierarchy so students can browse courses and jobs quickly without visual clutter.\n\n- Prioritize the most important information in each card.\n- Keep filter controls readable and touch friendly.\n- Design empty and loading states that still feel intentional.",
                ),
            ],
        ),
        CourseSeed(
            title="Data Analytics with SQL and Python",
            description="Clean datasets, model business metrics, and present insights through stakeholder-friendly dashboards.",
            category="Data Science",
            difficulty_level="Intermediate",
            estimated_hours=28,
            lessons=[
                (
                    "Query Foundations",
                    "Write joins, aggregations, and window functions for reporting.",
                    "Strong analytics starts with reliable SQL that answers the real business question.\n\nThis lesson covers how to join related tables, summarize results with aggregates, and use window functions to compare performance over time.\n\n- Choose the correct join for the relationship you need.\n- Use grouping and filtering carefully to avoid misleading totals.\n- Apply window functions when rankings or running totals matter.",
                ),
                (
                    "Notebook Analysis",
                    "Use Python to validate trends and automate repetitive checks.",
                    "Python notebooks help analysts move from one-off SQL outputs to repeatable investigations.\n\nYou will clean exported data, chart important changes, and automate the checks that a team needs every reporting cycle.\n\n- Load and inspect data before analysis.\n- Create reusable cleaning steps for repeated work.\n- Visualize trends before sharing conclusions.",
                ),
                (
                    "Executive Storytelling",
                    "Turn raw numbers into business recommendations.",
                    "A report only matters when decision-makers understand the next step.\n\nThis lesson shows how to turn metrics into a concise narrative that explains what changed, why it matters, and what action should happen next.\n\n- Separate insights from raw observations.\n- Lead with business impact before technical detail.\n- Recommend a clear next action backed by evidence.",
                ),
            ],
        ),
        CourseSeed(
            title="AWS Cloud Foundations",
            description="Understand core AWS services, IAM design, network basics, and operational guardrails for small teams.",
            category="IT & Software",
            difficulty_level="Beginner",
            estimated_hours=20,
            lessons=[
                (
                    "AWS Account Setup",
                    "Review identity, billing, and access boundaries.",
                    "A safe AWS environment starts with the right account structure and access boundaries.\n\nIn this lesson you will look at root account protection, IAM roles, and billing visibility so teams can operate without creating avoidable security gaps.\n\n- Protect privileged credentials from day one.\n- Give team members the minimum access they need.\n- Set up billing visibility before usage grows.",
                ),
                (
                    "Compute and Storage",
                    "Choose the right runtime and persistence primitives.",
                    "AWS offers many ways to run applications and store data, but each option has different tradeoffs.\n\nThis lesson compares common compute and storage services so you can match the platform to your workload and team capacity.\n\n- Pick services that fit your operational maturity.\n- Balance speed, cost, and flexibility.\n- Understand when managed services reduce long-term overhead.",
                ),
                (
                    "Monitoring Basics",
                    "Track health signals and plan incident response workflows.",
                    "Monitoring gives teams the confidence to detect problems before customers feel them.\n\nYou will review logs, metrics, and alerts, then connect them to an incident response workflow that helps the team react quickly and consistently.\n\n- Track the signals that map to user impact.\n- Use alert thresholds that are actionable.\n- Document first-response steps before an incident happens.",
                ),
            ],
        ),
        CourseSeed(
            title="UI/UX Design Fundamentals",
            description="Practice research, wireframing, and visual systems that help product teams move from idea to prototype.",
            category="Design",
            difficulty_level="Beginner",
            estimated_hours=18,
            lessons=[
                (
                    "Research Framing",
                    "Prepare interview guides and synthesize findings.",
                    "Good research starts with clear questions and a plan for turning interviews into useful product direction.\n\nThis lesson explains how to define goals, prepare prompts, and organize findings so design work stays grounded in real user needs.\n\n- Start with the decisions the team needs to make.\n- Ask open questions that uncover behavior, not guesses.\n- Capture findings in patterns the team can act on.",
                ),
                (
                    "Wireframes to Flows",
                    "Turn ideas into annotated user journeys.",
                    "Wireframes become more useful when they explain how a user moves from one action to the next.\n\nIn this lesson you will sketch steps, annotate decisions, and connect screens into a flow that stakeholders can quickly understand.\n\n- Use simple structure before polished visuals.\n- Highlight key decisions and transitions.\n- Keep flows focused on one primary task at a time.",
                ),
                (
                    "Design Systems",
                    "Scale tokens, spacing, and reusable interface rules.",
                    "Design systems help teams move faster without losing consistency.\n\nThis lesson introduces tokens, spacing rules, and shared components that make interfaces easier to design, build, and review across a growing product.\n\n- Reuse patterns instead of inventing new ones for every screen.\n- Document spacing and color choices clearly.\n- Connect design decisions to implementation-ready components.",
                ),
            ],
        ),
        CourseSeed(
            title="Performance Marketing Strategy",
            description="Launch acquisition campaigns, read attribution signals, and tighten conversion loops across channels.",
            category="Marketing",
            difficulty_level="Intermediate",
            estimated_hours=24,
            lessons=[
                (
                    "Channel Planning",
                    "Select channels and define budget expectations.",
                    "Effective channel planning begins with audience fit, goals, and realistic budget assumptions.\n\nThis lesson helps you compare acquisition channels, set expectations, and choose an initial test plan that supports measurable learning.\n\n- Match channels to audience behavior.\n- Set spend limits before launching experiments.\n- Define success metrics early.",
                ),
                (
                    "Funnel Metrics",
                    "Diagnose drop-off points and conversion opportunities.",
                    "Funnels show where interest turns into action and where momentum is being lost.\n\nYou will read conversion data across each step, identify drop-off patterns, and connect them to practical optimization opportunities.\n\n- Track the full journey, not only final conversions.\n- Compare step-to-step movement for bottlenecks.\n- Prioritize the drop-offs with the biggest business impact.",
                ),
                (
                    "Experiment Reviews",
                    "Close the loop with hypotheses, outcomes, and next steps.",
                    "Experiments create value when the team learns clearly from each result.\n\nThis lesson shows how to review a test, document what happened, and decide whether to scale, revise, or stop the idea.\n\n- Write hypotheses before launch.\n- Review outcomes against the original goal.\n- Record next steps so the team builds on what it learned.",
                ),
            ],
        ),
    ]

    exams: list[ExamSeed] = [
        ExamSeed(
            category_name="Frontend Engineering",
            category_description="Assess React, TypeScript, and UI implementation fundamentals.",
            category_icon="code-slash",
            title="Frontend Foundations Assessment",
            description="Measures practical React, routing, and component design knowledge.",
            category="Programming",
            duration_minutes=45,
            passing_score_percent=70,
            questions=[
                ("Which React pattern best avoids prop drilling across distant descendants?", "Pick the strongest architecture choice.", [("Context API", True, "Context reduces deep prop threading for shared state."), ("Inline styles", False, "Styling does not solve state propagation."), ("Fragments", False, "Fragments only group JSX nodes."), ("Memoized literals", False, "Memoization alone does not share state across branches.")]),
                ("What should a protected route verify before rendering a student workspace?", "Select the safest prerequisite.", [("Authenticated session and matching role", True, "Both authentication and authorization must be checked."), ("Only that a token exists", False, "A token without role validation is insufficient."), ("Page title metadata", False, "Metadata does not enforce access."), ("CSS theme preference", False, "Theme state is unrelated to authorization.")]),
                ("Why use TypeScript interfaces for API responses?", "Choose the clearest benefit.", [("They make data contracts explicit during development", True, "Typed contracts catch shape mismatches early."), ("They remove the need for runtime APIs", False, "Runtime APIs are still needed."), ("They encrypt payloads", False, "TypeScript does not provide encryption."), ("They guarantee backend correctness", False, "They only help on the TypeScript side.")]),
                ("What improves accessibility for icon-only action buttons?", "Choose the best answer.", [("Provide an aria-label", True, "Assistive tech needs a readable label."), ("Increase border radius", False, "Visual polish is not enough."), ("Use uppercase text nearby", False, "Nearby text may not be associated semantically."), ("Add more colors", False, "Color alone does not improve accessibility.")]),
                ("Which list key is safest in a stable course grid?", "Select the strongest option.", [("A unique course id", True, "Stable unique ids preserve element identity."), ("The array index", False, "Indexes break when list order changes."), ("The card title length", False, "Not guaranteed unique or stable."), ("A random number", False, "Random keys force remounts.")]),
            ],
            practice=("What is the main purpose of React Router?", "It maps URLs to UI state and page components.", PracticeQuestion.DifficultyChoices.EASY, "Routing", [("To switch views based on URL", True, "Routing libraries map URL state to components."), ("To store passwords securely", False, "Authentication storage is separate."), ("To compile TypeScript", False, "Compilation is handled by build tooling."), ("To send email alerts", False, "Email is unrelated to routing.")]),
            mock_title="Frontend Mock Interview Quiz",
            mock_description="A timed frontend knowledge check mirroring junior product engineering interviews.",
        ),
        ExamSeed(
            category_name="Data Analytics",
            category_description="Focus on SQL, Python analysis, and reporting decisions.",
            category_icon="graph-up",
            title="Data Analytics Readiness Check",
            description="Tests SQL, reporting logic, and basic Python analysis patterns.",
            category="Data Science",
            duration_minutes=50,
            passing_score_percent=72,
            questions=[
                ("What SQL clause is used after GROUP BY to filter aggregated results?", "Choose the SQL keyword.", [("HAVING", True, "HAVING filters grouped results."), ("WHERE", False, "WHERE filters rows before grouping."), ("ORDER BY", False, "Ordering does not filter."), ("LIMIT", False, "LIMIT only caps row count.")]),
                ("Why normalize time periods in KPI dashboards?", "Pick the clearest reason.", [("To compare trends fairly across periods", True, "Normalization supports apples-to-apples comparisons."), ("To increase file size", False, "That is not useful."), ("To hide conversion data", False, "Normalization should improve clarity, not hide data."), ("To avoid writing SQL", False, "SQL is still often needed.")]),
                ("What is a good first step when a metric suddenly drops?", "Choose the best analytical approach.", [("Validate the data pipeline and segment the change", True, "Rule out instrumentation issues before drawing conclusions."), ("Delete the dashboard", False, "That removes visibility."), ("Ignore the issue for a week", False, "Delayed investigation increases risk."), ("Change the KPI definition immediately", False, "Definitions should not change without evidence.")]),
                ("Which Python library is commonly used for tabular analysis?", "Select one.", [("pandas", True, "pandas is widely used for tabular analysis."), ("pygame", False, "pygame is for games."), ("asyncio", False, "asyncio manages concurrency."), ("http.server", False, "This serves files over HTTP.")]),
                ("What makes a metric actionable?", "Choose the strongest answer.", [("It informs a decision or follow-up action", True, "Useful metrics drive behavior."), ("It is colorful", False, "Visual styling alone is not value."), ("It always increases", False, "Metrics can go up or down."), ("It belongs in every report", False, "Not all metrics fit every audience.")]),
            ],
            practice=("Which SQL function counts rows in a grouped result?", "Count the number of records in each group.", PracticeQuestion.DifficultyChoices.EASY, "SQL Basics", [("COUNT(*)", True, "COUNT(*) returns grouped row totals."), ("SUM(*)", False, "SUM needs a numeric expression."), ("AVG(*)", False, "AVG needs a numeric expression."), ("MAX(*)", False, "MAX returns the highest value, not count.")]),
            mock_title="Analytics Case Sprint",
            mock_description="A short mock exam focused on dashboard troubleshooting and KPI reasoning.",
        ),
        ExamSeed(
            category_name="Cloud Operations",
            category_description="Cover AWS, reliability, and infrastructure support basics.",
            category_icon="cloud",
            title="Cloud Operations Fundamentals",
            description="Covers AWS primitives, IAM, availability, and basic ops workflows.",
            category="IT & Software",
            duration_minutes=40,
            passing_score_percent=68,
            questions=[
                ("What AWS service commonly stores objects like backups and exported reports?", "Choose the storage service.", [("Amazon S3", True, "S3 is object storage."), ("Amazon RDS", False, "RDS is relational database hosting."), ("Amazon EC2", False, "EC2 is compute."), ("Amazon Route 53", False, "Route 53 is DNS.")]),
                ("Why follow least privilege in IAM?", "Select the best reason.", [("To reduce blast radius from mistakes or compromise", True, "Least privilege limits unnecessary access."), ("To make passwords longer", False, "IAM scope is broader than password length."), ("To avoid monitoring", False, "Monitoring is still needed."), ("To remove audit logs", False, "Auditability remains essential.")]),
                ("What does high availability mean?", "Choose the clearest definition.", [("A service keeps operating despite failures in part of the system", True, "Redundancy and resilience improve uptime."), ("The app is always free", False, "Cost is unrelated."), ("Only one server is used", False, "Single-server setups are less resilient."), ("Deployments never change", False, "Availability does not prevent change.")]),
                ("Which signal helps detect production incidents quickly?", "Pick the most operational answer.", [("Centralized monitoring and alerts", True, "Alerts surface reliability issues early."), ("Long variable names", False, "Naming helps readability, not incident detection."), ("More browser tabs", False, "That does not improve observability."), ("Larger logos", False, "Visual branding is unrelated.")]),
                ("What should happen before rotating secrets in production?", "Choose the safest step.", [("Plan rollback and verify dependent services", True, "Secret rotation needs coordinated validation."), ("Delete every environment variable", False, "That would break services."), ("Disable logs forever", False, "Logging should be handled carefully, not removed."), ("Skip documentation", False, "Documentation supports safe operation.")]),
            ],
            practice=("Which AWS service manages virtual servers?", "It provisions compute instances.", PracticeQuestion.DifficultyChoices.EASY, "Compute", [("Amazon EC2", True, "EC2 provides virtual servers."), ("Amazon S3", False, "S3 is storage."), ("Amazon SNS", False, "SNS is messaging."), ("Amazon Route 53", False, "Route 53 is DNS.")]),
            mock_title="Cloud Support Scenario Drill",
            mock_description="Timed practice around AWS basics, ops habits, and security decisions.",
        ),
        ExamSeed(
            category_name="Product Design",
            category_description="Evaluate UX research, prototyping, and design system reasoning.",
            category_icon="palette",
            title="Product Design Skills Check",
            description="Assesses user research, prototyping, and collaborative design fundamentals.",
            category="Design",
            duration_minutes=35,
            passing_score_percent=70,
            questions=[
                ("What is the purpose of a wireframe?", "Choose the strongest answer.", [("To explore layout and flow before visual polish", True, "Wireframes focus on structure and flow."), ("To publish marketing emails", False, "Wireframes are for interface planning."), ("To store analytics events", False, "Analytics storage is unrelated."), ("To replace usability testing", False, "Testing is still necessary.")]),
                ("When is usability testing most useful?", "Pick the clearest timing.", [("Before large implementation bets are locked in", True, "Early feedback reduces rework."), ("Only after launch", False, "Testing earlier is usually more valuable."), ("Only with executives", False, "Representative users matter most."), ("Never for prototypes", False, "Prototypes are ideal for testing.")]),
                ("Why document a design system?", "Choose the best reason.", [("It helps teams ship more consistently and quickly", True, "Systems reduce ambiguity and repeated decisions."), ("It removes the need for designers", False, "People are still required."), ("It prevents all bugs", False, "It helps, but cannot prevent everything."), ("It replaces product strategy", False, "Strategy is separate.")]),
                ("What is a good research output after several interviews?", "Select the strongest artifact.", [("Synthesized themes and prioritized insights", True, "Patterns and priorities drive action."), ("A single favorite quote", False, "One quote lacks context."), ("Random screenshots", False, "Artifacts need synthesis."), ("Only a color palette", False, "Visual design alone is not research output.")]),
                ("Why prototype interactive flows?", "Choose the most useful benefit.", [("To test navigation and understanding before engineering build", True, "Interactive prototypes de-risk flow decisions."), ("To store passwords", False, "Prototypes do not manage credentials."), ("To rewrite the backend", False, "Prototype tools do not replace backend work."), ("To avoid user feedback", False, "Feedback is a main reason to prototype.")]),
            ],
            practice=("What is a persona used for in UX work?", "Choose the best definition.", PracticeQuestion.DifficultyChoices.EASY, "Research", [("A summary of representative user needs and behaviors", True, "Personas capture recurring audience patterns."), ("A deployment checklist", False, "That is an engineering artifact."), ("A CSS framework", False, "Not related to UX personas."), ("A payment gateway", False, "Not related to research.")]),
            mock_title="Design Review Challenge",
            mock_description="A short mock focused on research and product design tradeoffs.",
        ),
        ExamSeed(
            category_name="Digital Marketing",
            category_description="Measure campaign strategy, funnel thinking, and experimentation habits.",
            category_icon="megaphone",
            title="Digital Marketing Fundamentals",
            description="Covers acquisition channels, analytics, and campaign optimization fundamentals.",
            category="Marketing",
            duration_minutes=30,
            passing_score_percent=70,
            questions=[
                ("What does CTR stand for?", "Choose the correct expansion.", [("Click-through rate", True, "CTR measures clicks relative to impressions."), ("Customer trend review", False, "Not a standard marketing metric."), ("Channel target ratio", False, "Not the standard term."), ("Conversion tracking rule", False, "Different concept.")]),
                ("Why segment campaign performance by audience?", "Choose the strongest reason.", [("Different audiences respond differently and need targeted decisions", True, "Segmentation reveals actionable differences."), ("To hide weak campaigns", False, "Segmentation should improve clarity."), ("To avoid reporting", False, "Reporting is still required."), ("To make dashboards slower", False, "That is not beneficial.")]),
                ("What is a landing page conversion rate?", "Select the best definition.", [("The share of visitors who complete a target action", True, "Conversions are goal completions."), ("The number of total page views", False, "Views are not conversion rate."), ("Only paid ad spend", False, "Spend is separate."), ("The bounce rate multiplied by time", False, "Incorrect formula.")]),
                ("Which habit improves marketing experiments?", "Choose the best answer.", [("Define a hypothesis and success metric before launch", True, "Clear framing supports useful analysis."), ("Run tests without tracking", False, "Tracking is essential."), ("Change every variable at once", False, "That harms interpretation."), ("Ignore negative results", False, "Negative results still teach something.")]),
                ("What makes attribution tricky?", "Pick the clearest reason.", [("Users often interact with multiple touchpoints before converting", True, "Multi-touch journeys complicate credit assignment."), ("Designers use Figma", False, "Not related."), ("Domains use HTTPS", False, "Not the core issue."), ("Campaigns have names", False, "Naming is not the problem.")]),
            ],
            practice=("What metric measures cost per acquisition?", "Pick the marketing metric acronym.", PracticeQuestion.DifficultyChoices.EASY, "Acquisition", [("CPA", True, "CPA stands for cost per acquisition."), ("CTR", False, "CTR measures clicks."), ("LTV", False, "LTV measures value over time."), ("ROAS", False, "ROAS measures return on ad spend.")]),
            mock_title="Growth Campaign Mini Mock",
            mock_description="Quick timed practice for campaign analysis and funnel optimization.",
        ),
    ]

    @transaction.atomic
    def handle(self, *args, **options):
        now = timezone.now()

        companies = [self._upsert_company(seed) for seed in self.companies]
        company_users = [self._upsert_company_user(index, company) for index, company in enumerate(companies, start=1)]
        admin_users = [self._upsert_admin_user(index) for index in range(1, 6)]
        student_users = [self._upsert_student_user(index, seed) for index, seed in enumerate(self.students, start=1)]

        student_profiles = [self._upsert_student_profile(user, seed) for user, seed in zip(student_users, self.students)]
        for company, seed in zip(companies, self.companies):
            self._upsert_company_preferences(company, seed)
        for company, company_user in zip(companies, company_users):
            self._upsert_company_member(company, company_user)
        for student_user, profile, seed in zip(student_users, student_profiles, self.students):
            self._upsert_student_accessory_records(student_user, profile, seed, now)
        for user in [*student_users, *company_users, *admin_users]:
            self._upsert_notification_preference(user)

        courses = [self._upsert_course(seed) for seed in self.courses]
        lessons_by_course = self._rebuild_lessons(courses, self.courses)

        exam_categories = [self._upsert_exam_category(index, seed) for index, seed in enumerate(self.exams, start=1)]
        exams = [self._upsert_exam(category, seed) for category, seed in zip(exam_categories, self.exams)]
        exam_assets = self._rebuild_exam_assets(exams, self.exams)

        self._clear_seed_operational_data(student_users, companies, exams)
        vacancies = [
            self._create_vacancy(company, company_user, seed)
            for company, company_user, seed in zip(companies, company_users, self.companies)
        ]

        learning_records = self._create_learning_records(student_users, courses, lessons_by_course, now)
        applications = self._create_applications(student_users, companies, vacancies, now)
        accesses = self._create_candidate_access(student_users, companies)
        self._create_candidate_shortlists_and_notes(accesses, company_users, now)
        interviews = self._create_interviews(accesses, company_users, now)
        self._create_notifications_and_events(student_users, company_users, admin_users, now)
        self._create_exam_history(student_users, student_profiles, exams, exam_assets, now)
        self._create_logs(student_users, admin_users, now)
        self._create_dashboard_metrics(student_profiles, companies, learning_records, applications, interviews)
        self._create_scheduled_tasks(now)

        summary = {
            "companies": Company.objects.filter(name__in=[seed.name for seed in self.companies]).count(),
            "company_users": User.objects.filter(email__endswith=f"@{SEED_DOMAIN}", role=User.Role.COMPANY).count(),
            "student_users": User.objects.filter(email__endswith=f"@{SEED_DOMAIN}", role=User.Role.STUDENT).count(),
            "admin_users": User.objects.filter(email__endswith=f"@{SEED_DOMAIN}", role=User.Role.ADMIN).count(),
            "courses": Course.objects.filter(title__in=[seed.title for seed in self.courses]).count(),
            "exams": Exam.objects.filter(title__in=[seed.title for seed in self.exams]).count(),
            "vacancies": Vacancy.objects.filter(company__in=companies).count(),
            "applications": Application.objects.filter(student__in=student_users, company__in=companies).count(),
            "interviews": Interview.objects.filter(student__in=student_users, company__in=companies).count(),
            "notifications": Notification.objects.filter(recipient__in=student_users + company_users).count(),
        }

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        for key, value in summary.items():
            self.stdout.write(f" - {key}: {value}")
        self.stdout.write("Passwords were set to unusable values for all seeded users.")

    def _upsert_company(self, seed: CompanySeed) -> Company:
        company = Company.objects.filter(name=seed.name).first() or Company(name=seed.name)
        company.description = seed.description
        company.is_active = True
        company.full_clean()
        company.save()
        return company

    def _upsert_company_preferences(self, company: Company, seed: CompanySeed) -> None:
        preferences = CompanyHiringPreferences.objects.filter(company=company).first() or CompanyHiringPreferences(company=company)
        preferences.default_experience_level = seed.default_experience_level
        preferences.preferred_skills = seed.preferred_skills
        preferences.min_salary = seed.salary_min
        preferences.max_salary = seed.salary_max
        preferences.full_clean()
        preferences.save()

    def _upsert_company_user(self, index: int, company: Company) -> User:
        email = f"company{index}@{SEED_DOMAIN}"
        user = User.objects.filter(email=email).first() or User(email=email)
        user.full_name = f"{company.name} Recruiter"
        user.role = User.Role.COMPANY
        user.company = company
        user.is_active = True
        user.is_staff = False
        user.is_superuser = False
        user.set_unusable_password()
        user.full_clean()
        user.save()
        return user

    def _upsert_admin_user(self, index: int) -> User:
        email = f"admin{index}@{SEED_DOMAIN}"
        user = User.objects.filter(email=email).first() or User(email=email)
        user.full_name = f"Demo Admin {index}"
        user.role = User.Role.ADMIN
        user.company = None
        user.is_active = True
        user.is_staff = True
        user.is_superuser = False
        user.set_unusable_password()
        user.full_clean()
        user.save()
        return user

    def _upsert_student_user(self, index: int, seed: StudentSeed) -> User:
        email = f"student{index}@{SEED_DOMAIN}"
        user = User.objects.filter(email=email).first() or User(email=email)
        user.full_name = seed.full_name
        user.role = User.Role.STUDENT
        user.company = None
        user.is_active = True
        user.is_staff = False
        user.is_superuser = False
        user.set_unusable_password()
        user.full_clean()
        user.save()
        return user

    def _upsert_company_member(self, company: Company, company_user: User) -> None:
        member = CompanyMember.objects.filter(company=company, user=company_user).first() or CompanyMember(company=company, user=company_user)
        member.role = CompanyMember.MemberRole.ADMIN
        member.full_clean()
        member.save()

    def _upsert_student_profile(self, user: User, seed: StudentSeed) -> StudentProfile:
        profile = StudentProfile.objects.filter(user=user).first() or StudentProfile(user=user)
        profile.desired_job_type = seed.desired_job_type
        profile.desired_work_location = seed.desired_work_location
        profile.japanese_level = seed.japanese_level
        profile.english_level = seed.english_level
        profile.full_clean()
        profile.save()
        return profile

    def _upsert_student_accessory_records(self, student_user: User, profile: StudentProfile, seed: StudentSeed, now: datetime) -> None:
        StudentEducation.objects.filter(student=student_user).delete()
        StudentExperience.objects.filter(student=student_user).delete()
        StudentResume.objects.filter(student=student_user).delete()
        StudentSkill.objects.filter(student=student_user).delete()
        JobBookmark.objects.filter(student=student_user).delete()
        LearningRecord.objects.filter(student=student_user).delete()
        StudentVisibilityEvent.objects.filter(student=student_user).delete()
        DataConsent.objects.filter(student=student_user).delete()
        StudentDataAccessLog.objects.filter(student=student_user).delete()
        DataExportRequest.objects.filter(student=student_user).delete()
        DataDeletionRequest.objects.filter(student=student_user).delete()
        NotificationEvent.objects.filter(user=student_user).delete()
        Notification.objects.filter(recipient=student_user).delete()

        availability = StudentAvailabilityProfile.objects.filter(student=student_user).first() or StudentAvailabilityProfile(student=student_user)
        availability.job_search_status = seed.job_search_status
        availability.earliest_start_date = now.date() + timedelta(days=14)
        availability.interview_availability = seed.interview_availability
        availability.scheduling_notes = seed.scheduling_notes
        availability.full_clean()
        availability.save()

        visibility = StudentVisibilitySettings.objects.filter(student=student_user).first() or StudentVisibilitySettings(student=student_user)
        visibility.share_profile_preview = True
        visibility.share_learning_record = True
        visibility.share_exam_results = False
        visibility.full_clean()
        visibility.save()

        StudentVisibilityEvent.objects.create(
            student=student_user,
            share_profile_preview=visibility.share_profile_preview,
            share_learning_record=visibility.share_learning_record,
            share_exam_results=visibility.share_exam_results,
        )

        education = StudentEducation(
            student=student_user,
            institution=seed.institution,
            field_of_study=seed.field_of_study,
            start_date=seed.education_start,
            end_date=seed.education_end,
            completion_status=seed.education_status,
        )
        education.full_clean()
        education.save()

        experience = StudentExperience(
            student=student_user,
            organization=seed.organization,
            role_title=seed.role_title,
            experience_type=seed.experience_type,
            start_date=seed.experience_start,
            end_date=seed.experience_end,
            is_current=seed.is_current,
            summary=seed.experience_summary,
        )
        experience.full_clean()
        experience.save()

        resume = StudentResume(
            student=student_user,
            display_name=seed.resume_name,
            file_name=seed.resume_file,
            source_type=seed.resume_source,
            is_active=True,
        )
        resume.full_clean()
        resume.save()

        for skill_name, proficiency in seed.skills:
            skill = self._get_or_create_skill(skill_name)
            student_skill = StudentSkill(student=student_user, skill=skill, proficiency_level=proficiency)
            student_skill.full_clean()
            student_skill.save()

        for consent_index, consent_type in enumerate(
            [
                "share_profile_with_company",
                "share_learning_with_company",
                "share_exam_results_with_company",
                "marketing_emails",
                "research_participation",
            ],
            start=1,
        ):
            consent = DataConsent(
                student=student_user,
                consent_type=consent_type,
                given=consent_index != 3,
                given_at=now - timedelta(days=consent_index * 2) if consent_index != 3 else None,
                company=Company.objects.order_by("id").first()
                if consent_type.startswith("share_")
                else None,
                ip_address=f"10.0.0.{student_user.id % 250 + consent_index}",
                user_agent="Seeded demo consent",
            )
            consent.full_clean()
            consent.save()

        export_request = DataExportRequest(
            student=student_user,
            status="ready",
            file_url=f"https://downloads.softlearn.local/exports/{student_user.id}.zip",
            expires_at=now + timedelta(days=7),
        )
        export_request.full_clean()
        export_request.save()

        deletion_request = DataDeletionRequest(
            student=student_user,
            status="pending",
            reason="Demo request to validate privacy workflows.",
        )
        deletion_request.full_clean()
        deletion_request.save()

        StudentDashboardMetric.objects.update_or_create(
            student=profile,
            defaults={
                "courses_in_progress": 1,
                "courses_completed": 0,
                "exams_attempted": 0,
                "average_exam_score": 0,
                "applications_submitted": 0,
                "applications_accepted": 0,
                "applications_rejected": 0,
                "interviews_scheduled": 0,
                "interviews_completed": 0,
                "skills_total": len(seed.skills),
                "skills_endorsed": max(len(seed.skills) - 1, 0),
            },
        )

    def _upsert_notification_preference(self, user: User) -> None:
        NotificationPreference.objects.update_or_create(
            user=user,
            defaults={
                "email_on_application": True,
                "email_on_interview": True,
                "email_on_exam_result": True,
                "email_on_study_plan": user.role == User.Role.STUDENT,
                "email_on_course_completion": user.role == User.Role.STUDENT,
                "email_on_skill_endorsed": user.role == User.Role.STUDENT,
                "app_notifications_enabled": True,
                "daily_digest": user.role == User.Role.COMPANY,
                "digest_time": time(hour=9, minute=0),
                "unsubscribed": False,
            },
        )

    def _upsert_course(self, seed: CourseSeed) -> Course:
        course = Course.objects.filter(title=seed.title).first() or Course(title=seed.title)
        course.description = seed.description
        course.category = seed.category
        course.difficulty_level = seed.difficulty_level
        course.estimated_hours = seed.estimated_hours
        course.status = Course.Status.ACTIVE
        course.full_clean()
        course.save()
        return course

    def _rebuild_lessons(self, courses: list[Course], course_seeds: list[CourseSeed]) -> dict[int, list[Lesson]]:
        lessons_by_course: dict[int, list[Lesson]] = {}
        for course, seed in zip(courses, course_seeds):
            CourseAssessment.objects.filter(course=course).delete()
            Lesson.objects.filter(course=course).delete()
            lessons: list[Lesson] = []
            for sequence_number, (title, summary, content) in enumerate(seed.lessons, start=1):
                lesson = Lesson(
                    course=course,
                    title=title,
                    summary=summary,
                    content=content,
                    video_url=DEFAULT_LESSON_VIDEO_URL,
                    sequence_number=sequence_number,
                    status=Lesson.Status.ACTIVE,
                )
                lesson.full_clean()
                lesson.save()
                lessons.append(lesson)
                assessment = CourseAssessment(
                    course=course,
                    lesson=lesson,
                    title=f"{title} lesson exam",
                    description=f"Check understanding for {title}. Score 90% or higher to unlock the next lesson.",
                    kind=CourseAssessment.Kind.LESSON,
                    passing_score_percent=90,
                    status=CourseAssessment.Status.ACTIVE,
                )
                assessment.full_clean()
                assessment.save()
                self._seed_course_assessment_questions(
                    assessment,
                    prompt_topic=title,
                    prompt_summary=summary,
                )
            lessons_by_course[course.id] = lessons
            final_assessment = CourseAssessment(
                course=course,
                title=f"{course.title} final exam",
                description=f"Final course check for {course.title}. Pass with 90% or higher to complete the course.",
                kind=CourseAssessment.Kind.FINAL,
                passing_score_percent=90,
                status=CourseAssessment.Status.ACTIVE,
            )
            final_assessment.full_clean()
            final_assessment.save()
            self._seed_final_course_assessment_questions(final_assessment, course_title=course.title)
        return lessons_by_course

    def _seed_course_assessment_questions(self, assessment: CourseAssessment, *, prompt_topic: str, prompt_summary: str) -> None:
        single_choice = CourseAssessmentQuestion(
            assessment=assessment,
            prompt=f"What is the main focus of '{prompt_topic}'?",
            instructions="Choose the single best answer.",
            question_type=CourseAssessmentQuestion.QuestionType.SINGLE_CHOICE,
            sequence_number=1,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        single_choice.full_clean()
        single_choice.save()
        for option_index, (option_text, is_correct) in enumerate(
            [
                (prompt_summary, True),
                ("It is mainly about job applications.", False),
                ("It only covers interview scheduling.", False),
                ("It avoids practical implementation details.", False),
            ],
            start=1,
        ):
            option = CourseAssessmentOption(
                question=single_choice,
                option_text=option_text,
                sequence_number=option_index,
                is_correct=is_correct,
            )
            option.full_clean()
            option.save()

        multi_choice = CourseAssessmentQuestion(
            assessment=assessment,
            prompt=f"Which actions support success in '{prompt_topic}'?",
            instructions="Select all correct answers.",
            question_type=CourseAssessmentQuestion.QuestionType.MULTIPLE_CHOICE,
            sequence_number=2,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        multi_choice.full_clean()
        multi_choice.save()
        for option_index, (option_text, is_correct) in enumerate(
            [
                ("Review the lesson summary and apply the concepts in practice.", True),
                ("Ignore the lesson goals and skip directly to the next topic.", False),
                ("Use the key ideas from this lesson when continuing the course.", True),
                ("Treat the lesson as unrelated to course progress.", False),
            ],
            start=1,
        ):
            option = CourseAssessmentOption(
                question=multi_choice,
                option_text=option_text,
                sequence_number=option_index,
                is_correct=is_correct,
            )
            option.full_clean()
            option.save()

    def _seed_final_course_assessment_questions(self, assessment: CourseAssessment, *, course_title: str) -> None:
        single_choice = CourseAssessmentQuestion(
            assessment=assessment,
            prompt=f"What does passing the final exam for '{course_title}' represent?",
            instructions="Choose the single best answer.",
            question_type=CourseAssessmentQuestion.QuestionType.SINGLE_CHOICE,
            sequence_number=1,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        single_choice.full_clean()
        single_choice.save()
        for option_index, (option_text, is_correct) in enumerate(
            [
                ("The student understood the course content well enough to complete the course.", True),
                ("The student automatically receives a certificate.", False),
                ("The student can skip all remaining lessons.", False),
                ("The course no longer tracks progress.", False),
            ],
            start=1,
        ):
            option = CourseAssessmentOption(
                question=single_choice,
                option_text=option_text,
                sequence_number=option_index,
                is_correct=is_correct,
            )
            option.full_clean()
            option.save()

        multi_choice = CourseAssessmentQuestion(
            assessment=assessment,
            prompt=f"Which conditions should already be true before finishing '{course_title}'?",
            instructions="Select all correct answers.",
            question_type=CourseAssessmentQuestion.QuestionType.MULTIPLE_CHOICE,
            sequence_number=2,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        multi_choice.full_clean()
        multi_choice.save()
        for option_index, (option_text, is_correct) in enumerate(
            [
                ("All lessons in the course have been completed.", True),
                ("The last lesson exam was passed with 90% or higher.", True),
                ("A certificate was downloaded.", False),
                ("The course was never enrolled.", False),
            ],
            start=1,
        ):
            option = CourseAssessmentOption(
                question=multi_choice,
                option_text=option_text,
                sequence_number=option_index,
                is_correct=is_correct,
            )
            option.full_clean()
            option.save()

    def _upsert_exam_category(self, order: int, seed: ExamSeed) -> ExamCategory:
        category = ExamCategory.objects.filter(name=seed.category_name).first() or ExamCategory(name=seed.category_name)
        category.description = seed.category_description
        category.icon = seed.category_icon
        category.order = order
        category.active = True
        category.full_clean()
        category.save()
        return category

    def _upsert_exam(self, category: ExamCategory, seed: ExamSeed) -> Exam:
        exam = Exam.objects.filter(title=seed.title).first() or Exam(title=seed.title)
        exam.description = seed.description
        exam.category_fk = category
        exam.category = seed.category
        exam.duration_minutes = seed.duration_minutes
        exam.passing_score_percent = seed.passing_score_percent
        exam.question_count = len(seed.questions)
        exam.max_attempts = 3
        exam.status = Exam.Status.ACTIVE
        exam.full_clean()
        exam.save()
        return exam

    def _rebuild_exam_assets(self, exams: list[Exam], exam_seeds: list[ExamSeed]) -> dict[int, dict[str, object]]:
        assets: dict[int, dict[str, object]] = {}
        for exam, seed in zip(exams, exam_seeds):
            StudyPlan.objects.filter(exam=exam).delete()
            StudentPerformanceMetric.objects.filter(exam=exam).delete()
            ExamResult.objects.filter(exam=exam).delete()
            ExamAttempt.objects.filter(exam=exam).delete()
            PracticeQuestionAttempt.objects.filter(exam=exam).delete()
            MockExamAttempt.objects.filter(exam=exam).delete()
            PracticeQuestion.objects.filter(exam=exam).delete()
            MockExam.objects.filter(exam=exam).delete()
            ExamQuestion.objects.filter(exam=exam).delete()

            questions: list[ExamQuestion] = []
            options_by_question: dict[int, list[ExamAnswerOption]] = {}
            for sequence_number, (prompt, instructions, options) in enumerate(seed.questions, start=1):
                question = ExamQuestion(
                    exam=exam,
                    prompt=prompt,
                    instructions=instructions,
                    sequence_number=sequence_number,
                    points=1,
                    status=ExamQuestion.Status.ACTIVE,
                )
                question.full_clean()
                question.save()
                questions.append(question)

                created_options: list[ExamAnswerOption] = []
                for option_number, (option_text, is_correct, _explanation) in enumerate(options, start=1):
                    answer_option = ExamAnswerOption(
                        question=question,
                        option_text=option_text,
                        sequence_number=option_number,
                        is_correct=is_correct,
                        status=ExamAnswerOption.Status.ACTIVE,
                    )
                    answer_option.full_clean()
                    answer_option.save()
                    created_options.append(answer_option)
                options_by_question[question.id] = created_options

            practice_text, practice_explanation, difficulty, topic, practice_options = seed.practice
            practice_question = PracticeQuestion(
                exam=exam,
                question_text=practice_text,
                explanation=practice_explanation,
                difficulty=difficulty,
                topic=topic,
            )
            practice_question.full_clean()
            practice_question.save()
            for option_text, is_correct, explanation in practice_options:
                option = PracticeQuestionOption(
                    question=practice_question,
                    option_text=option_text,
                    is_correct=is_correct,
                    explanation=explanation,
                )
                option.full_clean()
                option.save()

            mock_exam = MockExam(
                exam=exam,
                title=seed.mock_title,
                description=seed.mock_description,
                duration_minutes=max(exam.duration_minutes - 5, 20),
            )
            mock_exam.full_clean()
            mock_exam.save()

            assets[exam.id] = {
                "questions": questions,
                "options_by_question": options_by_question,
                "practice_question": practice_question,
                "practice_options": list(practice_question.options.order_by("id")),
                "mock_exam": mock_exam,
            }
        return assets

    def _clear_seed_operational_data(self, students: list[User], companies: list[Company], exams: list[Exam]) -> None:
        NotificationDelivery.objects.filter(notification__recipient__in=students).delete()
        Notification.objects.filter(recipient__in=students).delete()
        NotificationDelivery.objects.filter(notification__recipient__company__in=companies).delete()
        Notification.objects.filter(recipient__company__in=companies).delete()
        ApplicationStatusHistory.objects.filter(application__student__in=students).delete()
        CandidateNote.objects.filter(student__in=students, company__in=companies).delete()
        CandidateShortlist.objects.filter(student__in=students, company__in=companies).delete()
        InterviewAvailability.objects.filter(interview__student__in=students).delete()
        InterviewEvent.objects.filter(interview__student__in=students).delete()
        Interview.objects.filter(student__in=students, company__in=companies).delete()
        CandidateReviewAccess.objects.filter(student__in=students, company__in=companies).delete()
        Application.objects.filter(student__in=students, company__in=companies).delete()
        JobBookmark.objects.filter(student__in=students).delete()
        LearningRecord.objects.filter(student__in=students).delete()
        NotificationEvent.objects.filter(user__in=students).delete()
        StudentDataAccessLog.objects.filter(student__in=students).delete()
        ExamResult.objects.filter(student__in=students, exam__in=exams).delete()
        ExamAttempt.objects.filter(student__in=students, exam__in=exams).delete()
        PracticeQuestionAttempt.objects.filter(student__in=students, exam__in=exams).delete()
        MockExamAttempt.objects.filter(student__in=students, exam__in=exams).delete()

    def _create_vacancy(self, company: Company, creator: User, seed: CompanySeed) -> Vacancy:
        vacancy = Vacancy.objects.filter(company=company, title=seed.vacancy_title).first() or Vacancy(
            company=company,
            title=seed.vacancy_title,
        )
        vacancy.created_by = creator
        vacancy.description = seed.vacancy_description
        vacancy.employment_type = seed.employment_type
        vacancy.experience_level = seed.experience_level
        vacancy.location = seed.location
        vacancy.work_style = seed.work_style
        vacancy.relocation_support = seed.relocation_support
        vacancy.min_salary = seed.salary_min
        vacancy.max_salary = seed.salary_max
        vacancy.status = Vacancy.Status.ACTIVE
        vacancy.full_clean()
        vacancy.save()
        VacancySkillRequirement.objects.filter(vacancy=vacancy).delete()
        VacancyLanguageRequirement.objects.filter(vacancy=vacancy).delete()

        for skill_name, requirement_type in seed.vacancy_skills:
            requirement = VacancySkillRequirement(
                vacancy=vacancy,
                skill=self._get_or_create_skill(skill_name),
                requirement_type=requirement_type,
            )
            requirement.full_clean()
            requirement.save()
        for language, level, requirement_type in seed.vacancy_languages:
            language_requirement = VacancyLanguageRequirement(
                vacancy=vacancy,
                language=language,
                minimum_level=level,
                requirement_type=requirement_type,
            )
            language_requirement.full_clean()
            language_requirement.save()
        return vacancy

    def _create_learning_records(
        self,
        students: list[User],
        courses: list[Course],
        lessons_by_course: dict[int, list[Lesson]],
        now: datetime,
    ) -> list[LearningRecord]:
        records: list[LearningRecord] = []
        progress_plan = [65, 100, 45, 20, 80]
        statuses = [
            LearningRecord.Status.IN_PROGRESS,
            LearningRecord.Status.COMPLETED,
            LearningRecord.Status.IN_PROGRESS,
            LearningRecord.Status.IN_PROGRESS,
            LearningRecord.Status.IN_PROGRESS,
        ]
        for student, course, progress_percent, status in zip(students, courses, progress_plan, statuses):
            record = LearningRecord(
                student=student,
                course=course,
                course_title=course.title,
                category=course.category,
                progress_percent=progress_percent,
                status=status,
                completed_at=now - timedelta(days=5) if status == LearningRecord.Status.COMPLETED else None,
            )
            record.full_clean()
            record.save()
            records.append(record)

            lessons = lessons_by_course[course.id]
            completed_count = round((progress_percent / 100) * len(lessons))
            started_count = min(completed_count + 1, len(lessons)) if status != LearningRecord.Status.COMPLETED else len(lessons)
            for lesson_index, lesson in enumerate(lessons, start=1):
                if lesson_index <= completed_count:
                    progress_status = LessonProgress.Status.COMPLETED
                    started_at = now - timedelta(days=lesson_index + 5)
                    completed_at = now - timedelta(days=lesson_index + 4)
                elif lesson_index <= started_count and status != LearningRecord.Status.COMPLETED:
                    progress_status = LessonProgress.Status.IN_PROGRESS
                    started_at = now - timedelta(days=2)
                    completed_at = None
                else:
                    progress_status = LessonProgress.Status.NOT_STARTED
                    started_at = None
                    completed_at = None

                lesson_progress = LessonProgress(
                    learning_record=record,
                    lesson=lesson,
                    status=progress_status,
                    started_at=started_at,
                    completed_at=completed_at,
                )
                lesson_progress.full_clean()
                lesson_progress.save()
        return records

    def _create_applications(
        self,
        students: list[User],
        companies: list[Company],
        vacancies: list[Vacancy],
        now: datetime,
    ) -> list[Application]:
        statuses = [
            Application.Status.SUBMITTED,
            Application.Status.UNDER_REVIEW,
            Application.Status.SHORTLISTED,
            Application.Status.REJECTED,
            Application.Status.WITHDRAWN,
        ]
        applications: list[Application] = []
        for student, company, vacancy, status in zip(students, companies, vacancies, statuses):
            application = Application(
                company=company,
                vacancy=vacancy,
                student=student,
                status=status,
            )
            application.full_clean()
            application.save()
            applications.append(application)

            submitted = ApplicationStatusHistory(
                application=application,
                actor=student,
                from_status="",
                to_status=Application.Status.SUBMITTED,
                note="Student submitted an application from the seeded demo workspace.",
            )
            submitted.full_clean()
            submitted.save()

            if status != Application.Status.SUBMITTED:
                history = ApplicationStatusHistory(
                    application=application,
                    actor=vacancy.created_by,
                    from_status=Application.Status.SUBMITTED,
                    to_status=status,
                    note=f"Recruiter moved the application to {status.replace('_', ' ')} during seeded review.",
                )
                history.full_clean()
                history.save()
        return applications

    def _create_candidate_access(self, students: list[User], companies: list[Company]) -> list[CandidateReviewAccess]:
        sources = [
            CandidateReviewAccess.Source.APPLICATION,
            CandidateReviewAccess.Source.MATCH,
            CandidateReviewAccess.Source.SHORTLIST,
            CandidateReviewAccess.Source.APPLICATION,
            CandidateReviewAccess.Source.MATCH,
        ]
        accesses: list[CandidateReviewAccess] = []
        for student, company, source in zip(students, companies, sources):
            access = CandidateReviewAccess(company=company, student=student, source=source, is_active=True)
            access.full_clean()
            access.save()
            accesses.append(access)
        return accesses

    def _create_candidate_shortlists_and_notes(self, accesses: list[CandidateReviewAccess], company_users: list[User], _now: datetime) -> None:
        for access, company_user in zip(accesses, company_users):
            shortlist = CandidateShortlist(
                candidate_access=access,
                company=access.company,
                student=access.student,
                created_by=company_user,
            )
            shortlist.full_clean()
            shortlist.save()

            note = CandidateNote(
                candidate_access=access,
                company=access.company,
                student=access.student,
                author=company_user,
                body=f"{access.student.full_name} shows strong alignment with the {access.company.name} role and communicated clearly in the seeded review notes.",
            )
            note.full_clean()
            note.save()

            data_access = StudentDataAccessLog(
                student=access.student,
                accessed_by=company_user,
                accessed_by_company=access.company,
                access_type="profile",
                reason="Candidate review opened from seeded shortlist workflow.",
                ip_address=f"192.168.10.{access.company_id}",
            )
            data_access.full_clean()
            data_access.save()

    def _create_interviews(self, accesses: list[CandidateReviewAccess], company_users: list[User], now: datetime) -> list[Interview]:
        interview_specs = [
            (Interview.Status.REQUESTED, "Initial screen", None, None, None, Interview.MeetingProvider.GOOGLE_MEET),
            (Interview.Status.CONFIRMED, "Portfolio review", now + timedelta(days=3), now + timedelta(days=3, hours=1), None, Interview.MeetingProvider.ZOOM),
            (Interview.Status.RESCHEDULED, "Technical discussion", now + timedelta(days=5), now + timedelta(days=5, hours=1), None, Interview.MeetingProvider.TEAMS),
            (
                Interview.Status.COMPLETED,
                "Design critique",
                now - timedelta(days=2),
                now - timedelta(days=2) + timedelta(hours=1),
                now - timedelta(days=2) + timedelta(hours=1),
                Interview.MeetingProvider.GOOGLE_MEET,
            ),
            (Interview.Status.CANCELLED, "Growth strategy chat", now + timedelta(days=4), now + timedelta(days=4, hours=1), None, Interview.MeetingProvider.ZOOM),
        ]
        interviews: list[Interview] = []
        for index, (access, company_user, spec) in enumerate(zip(accesses, company_users, interview_specs), start=1):
            status, purpose, scheduled_start, scheduled_end, completed_at, provider = spec
            interview = Interview(
                candidate_access=access,
                company=access.company,
                student=access.student,
                requested_by=company_user,
                purpose=purpose,
                role_context=access.company.vacancies.order_by("id").first().title,
                status=status,
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                confirmed_at=now - timedelta(days=1) if status in {Interview.Status.CONFIRMED, Interview.Status.COMPLETED} else None,
                cancelled_at=now - timedelta(hours=8) if status == Interview.Status.CANCELLED else None,
                completed_at=completed_at,
                meeting_provider=provider,
                meeting_url=f"https://meet.softlearn.local/session/{index}",
            )
            interview.full_clean()
            interview.save()
            interviews.append(interview)

            company_availability = InterviewAvailability(
                interview=interview,
                submitted_by=company_user,
                start_at=(scheduled_start or now + timedelta(days=index)),
                end_at=(scheduled_end or now + timedelta(days=index, hours=1)),
                note="Recruiter proposed this slot during demo data generation.",
            )
            company_availability.full_clean()
            company_availability.save()

            student_availability = InterviewAvailability(
                interview=interview,
                submitted_by=access.student,
                start_at=(scheduled_start or now + timedelta(days=index, hours=2)),
                end_at=(scheduled_end or now + timedelta(days=index, hours=3)),
                note="Student confirmed seeded availability window.",
            )
            student_availability.full_clean()
            student_availability.save()

            event_type = {
                Interview.Status.REQUESTED: "requested",
                Interview.Status.CONFIRMED: "confirmed",
                Interview.Status.RESCHEDULED: "rescheduled",
                Interview.Status.COMPLETED: "completed",
                Interview.Status.CANCELLED: "cancelled",
            }[status]
            event = InterviewEvent(
                interview=interview,
                actor=company_user,
                event_type=event_type,
                description=f"{purpose} interview event recorded for seeded demo data.",
            )
            event.save()
        return interviews

    def _create_notifications_and_events(
        self,
        students: list[User],
        company_users: list[User],
        admin_users: list[User],
        now: datetime,
    ) -> None:
        event_types = [
            NotificationEvent.EventType.STUDY_PLAN_READY,
            NotificationEvent.EventType.SKILL_ENDORSED,
            NotificationEvent.EventType.INTERVIEW_CONFIRMED,
            NotificationEvent.EventType.COURSE_COMPLETED,
            NotificationEvent.EventType.EXAM_RESULT_READY,
        ]
        actors = [admin_users[0], company_users[0], company_users[1], admin_users[1], admin_users[2]]
        for user, event_type, actor in zip(students, event_types, actors):
            event = NotificationEvent(
                event_type=event_type,
                user=user,
                actor=actor,
                content_type="demo_seed",
                object_id=user.id,
                metadata={"generated_at": now.isoformat()},
            )
            event.save()

    def _create_exam_history(
        self,
        students: list[User],
        profiles: list[StudentProfile],
        exams: list[Exam],
        exam_assets: dict[int, dict[str, object]],
        now: datetime,
    ) -> None:
        scores = [82, 91, 76, 88, 79]
        for index, (student, profile, exam, score) in enumerate(zip(students, profiles, exams, scores), start=1):
            questions: list[ExamQuestion] = exam_assets[exam.id]["questions"]  # type: ignore[index]
            options_by_question: dict[int, list[ExamAnswerOption]] = exam_assets[exam.id]["options_by_question"]  # type: ignore[index]
            practice_question: PracticeQuestion = exam_assets[exam.id]["practice_question"]  # type: ignore[index]
            mock_exam: MockExam = exam_assets[exam.id]["mock_exam"]  # type: ignore[index]

            attempt = ExamAttempt(
                student=student,
                exam=exam,
                attempt_number=1,
                status=ExamAttempt.Status.SCORED,
                score_percent=score,
                passed=score >= exam.passing_score_percent,
                started_at=now - timedelta(days=10 - index, minutes=exam.duration_minutes),
                submitted_at=now - timedelta(days=10 - index, minutes=10),
                completed_at=now - timedelta(days=10 - index, minutes=5),
            )
            attempt.full_clean()
            attempt.save()

            correct_answers = 0
            for question_index, question in enumerate(questions, start=1):
                options = options_by_question[question.id]
                selected_option = options[0] if (question_index + index) % 4 != 0 else options[-1]
                if selected_option.is_correct:
                    correct_answers += 1
                answer = ExamAttemptAnswer(
                    attempt=attempt,
                    question=question,
                    selected_option=selected_option,
                )
                answer.full_clean()
                answer.save()

            result = ExamResult(
                student=student,
                exam=exam,
                attempt=attempt,
                exam_title=exam.title,
                category=exam.category,
                score_percent=score,
                passed=score >= exam.passing_score_percent,
                attempt_number=1,
                taken_at=attempt.completed_at or now,
            )
            result.full_clean()
            result.save()

            practice_attempt = PracticeQuestionAttempt(
                student=student,
                exam=exam,
                question=questions[0],
                selected_option=options_by_question[questions[0].id][0],
                is_correct=options_by_question[questions[0].id][0].is_correct,
            )
            practice_attempt.full_clean()
            practice_attempt.save()

            mock_attempt = MockExamAttempt(
                student=student,
                exam=exam,
                exam_title=exam.title,
                category=exam.category,
                attempt_number=1,
                score_percent=score - 3,
                correct_answer_count=correct_answers,
                total_questions=len(questions),
                started_at=now - timedelta(days=3, minutes=mock_exam.duration_minutes),
                submitted_at=now - timedelta(days=3),
            )
            mock_attempt.full_clean()
            mock_attempt.save()

            for question in questions:
                options = options_by_question[question.id]
                mock_answer = MockExamAttemptAnswer(
                    attempt=mock_attempt,
                    question=question,
                    selected_option=options[0],
                    is_correct=options[0].is_correct,
                )
                mock_answer.full_clean()
                mock_answer.save()

            study_plan = StudyPlan(student=profile, exam=exam, completed_at=None)
            study_plan.full_clean()
            study_plan.save()

            study_plan_items = [
                StudyPlanItem(
                    study_plan=study_plan,
                    item_type=StudyPlanItem.ItemTypeChoices.LESSON,
                    lesson=Course.objects.filter(title__icontains=exam.category.split()[0]).first().lessons.order_by("sequence_number").first()
                    if Course.objects.filter(title__icontains=exam.category.split()[0]).exists()
                    else Lesson.objects.order_by("id").first(),
                    order=1,
                    completed=index % 2 == 0,
                    completion_date=now.date() - timedelta(days=2) if index % 2 == 0 else None,
                ),
                StudyPlanItem(
                    study_plan=study_plan,
                    item_type=StudyPlanItem.ItemTypeChoices.PRACTICE,
                    practice_question=practice_question,
                    order=2,
                    completed=True,
                    completion_date=now.date() - timedelta(days=1),
                ),
                StudyPlanItem(
                    study_plan=study_plan,
                    item_type=StudyPlanItem.ItemTypeChoices.MOCK,
                    mock_exam=mock_exam,
                    order=3,
                    completed=False,
                    completion_date=None,
                ),
            ]
            for item in study_plan_items:
                item.full_clean()
                item.save()

            metric = StudentPerformanceMetric(
                student=profile,
                exam=exam,
                metric_type=StudentPerformanceMetric.MetricTypeChoices.AVERAGE_SCORE,
                value=float(score),
                trend=StudentPerformanceMetric.TrendChoices.UP,
            )
            metric.full_clean()
            metric.save()

    def _create_logs(self, students: list[User], admin_users: list[User], now: datetime) -> None:
        ApplicationLogEntry.objects.filter(request_id__startswith="demo-seed-").delete()
        ErrorReport.objects.filter(request_id__startswith="demo-seed-").delete()
        AuditLog.objects.filter(description__icontains="Seeded demo").delete()

        for index, student in enumerate(students, start=1):
            ApplicationLogEntry.objects.create(
                level="INFO",
                service="api",
                message=f"Seeded demo request completed for {student.full_name}",
                request_id=f"demo-seed-request-{index}",
                user=student,
                request_method="GET",
                request_path=f"/api/v1/student/{student.id}/dashboard",
                response_status=200,
                duration_ms=120.5 + index,
                metadata={"seeded": True},
            )
            ErrorReport.objects.create(
                error_type="SeededDemoWarning",
                error_message=f"Sample warning for {student.full_name} generated for admin review.",
                stack_trace="Traceback (most recent call last):\n  Seeded demo warning",
                request_id=f"demo-seed-error-{index}",
                user=student,
                request_method="POST",
                request_path="/api/v1/demo/validate",
                environment="development",
                metadata={"seeded": True},
                occurrence_count=1,
                is_resolved=index % 2 == 0,
            )

        for index, admin_user in enumerate(admin_users, start=1):
            AuditLog.objects.create(
                admin_user=admin_user,
                action_type=AuditLog.ActionType.VIEW,
                entity_type="seed_demo",
                entity_id=index,
                description=f"Seeded demo admin review event {index}",
                changes={"seeded": True, "batch": "local-demo"},
                ip_address=f"172.16.0.{index}",
                user_agent="SoftLearn demo seed command",
            )

    def _create_dashboard_metrics(
        self,
        profiles: list[StudentProfile],
        companies: list[Company],
        learning_records: list[LearningRecord],
        applications: list[Application],
        interviews: list[Interview],
    ) -> None:
        profile_map = {profile.user_id: profile for profile in profiles}
        for record in learning_records:
            profile = profile_map[record.student_id]
            StudentDashboardMetric.objects.update_or_create(
                student=profile,
                defaults={
                    "courses_in_progress": LearningRecord.objects.filter(student=record.student, status=LearningRecord.Status.IN_PROGRESS).count(),
                    "courses_completed": LearningRecord.objects.filter(student=record.student, status=LearningRecord.Status.COMPLETED).count(),
                    "exams_attempted": ExamAttempt.objects.filter(student=record.student).count(),
                    "average_exam_score": ExamResult.objects.filter(student=record.student).order_by().values_list("score_percent", flat=True).first() or 0,
                    "applications_submitted": Application.objects.filter(student=record.student).count(),
                    "applications_accepted": 0,
                    "applications_rejected": Application.objects.filter(student=record.student, status=Application.Status.REJECTED).count(),
                    "interviews_scheduled": Interview.objects.filter(student=record.student, status__in=[Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED, Interview.Status.REQUESTED]).count(),
                    "interviews_completed": Interview.objects.filter(student=record.student, status=Interview.Status.COMPLETED).count(),
                    "skills_total": StudentSkill.objects.filter(student=record.student).count(),
                    "skills_endorsed": max(StudentSkill.objects.filter(student=record.student).count() - 1, 0),
                },
            )

        for company in companies:
            CompanyDashboardMetric.objects.update_or_create(
                company=company,
                defaults={
                    "open_vacancies": Vacancy.objects.filter(company=company, status=Vacancy.Status.ACTIVE).count(),
                    "total_applications": Application.objects.filter(company=company).count(),
                    "interviews_scheduled": Interview.objects.filter(company=company, status__in=[Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED]).count(),
                    "offers_made": 0,
                    "new_applications_7days": Application.objects.filter(company=company).count(),
                    "interview_conversion_rate": 20.0,
                    "average_time_to_hire_days": 18,
                    "shortlist_ratio": 35.0,
                    "recent_interviews_completed": Interview.objects.filter(company=company, status=Interview.Status.COMPLETED).count(),
                    "recent_candidates_shortlisted": CandidateShortlist.objects.filter(company=company).count(),
                    "recent_notes_added": CandidateNote.objects.filter(company=company).count(),
                },
            )

    def _create_scheduled_tasks(self, now: datetime) -> None:
        schedules = {
            ScheduledTask.TaskType.ARCHIVE_APPLICATIONS: ScheduledTask.Schedule.WEEKLY,
            ScheduledTask.TaskType.SEND_DIGEST: ScheduledTask.Schedule.WEEKLY,
            ScheduledTask.TaskType.CLEANUP_EXPORTS: ScheduledTask.Schedule.DAILY,
            ScheduledTask.TaskType.REFRESH_ANALYTICS: ScheduledTask.Schedule.HOURLY,
        }
        for task_type, schedule in schedules.items():
            ScheduledTask.objects.update_or_create(
                task_type=task_type,
                defaults={
                    "schedule": schedule,
                    "is_active": True,
                    "last_run": now - timedelta(days=1),
                    "next_run": now + timedelta(days=1),
                    "last_result": "Seeded demo schedule ready for local review.",
                },
            )

    def _get_or_create_skill(self, name: str) -> Skill:
        skill = Skill.objects.filter(name=name).first()
        if skill:
            return skill
        skill = Skill(name=name)
        skill.full_clean()
        skill.save()
        return skill
