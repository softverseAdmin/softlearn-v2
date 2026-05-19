from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from users.managers import UserManager
from users.media import (
    company_cover_image_upload_to,
    company_profile_image_upload_to,
    course_thumbnail_upload_to,
    student_cover_image_upload_to,
    student_profile_image_upload_to,
    student_resume_upload_to,
)


class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    profile_image = models.TextField(blank=True, default="")
    cover_image = models.TextField(blank=True, default="")
    profile_image_file = models.FileField(upload_to=company_profile_image_upload_to, blank=True, default="")
    cover_image_file = models.FileField(upload_to=company_cover_image_upload_to, blank=True, default="")
    job_posting_id = models.CharField(max_length=50, blank=True, default="")
    founder_name = models.CharField(max_length=255, blank=True, default="")
    headquarters_address = models.TextField(blank=True, default="")
    office_locations = models.TextField(blank=True, default="")
    founded_at = models.CharField(max_length=100, blank=True, default="")
    website_url = models.URLField(blank=True, default="")
    industry = models.CharField(max_length=255, blank=True, default="")
    company_points = models.JSONField(default=list, blank=True)
    business_domains = models.JSONField(default=list, blank=True)
    business_models = models.JSONField(default=list, blank=True)
    employee_count_label = models.CharField(max_length=100, blank=True, default="")
    market_category = models.CharField(max_length=255, blank=True, default="")
    capital_label = models.CharField(max_length=100, blank=True, default="")
    revenue_label = models.CharField(max_length=100, blank=True, default="")
    tagline = models.CharField(max_length=255, blank=True, default="")
    company_features = models.TextField(blank=True, default="")
    additional_company_info = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class CompanyHiringPreferences(models.Model):
    class ExperienceLevel(models.TextChoices):
        ENTRY = "entry", "Entry Level"
        JUNIOR = "junior", "Junior"
        MID = "mid", "Mid Level"
        SENIOR = "senior", "Senior"
        LEAD = "lead", "Lead"
        DIRECTOR = "director", "Director"

    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name="hiring_preferences")
    default_experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices, blank=True, default="")
    preferred_skills = models.JSONField(default=list, blank=True)
    min_salary = models.IntegerField(null=True, blank=True)
    max_salary = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_id"]

    def clean(self) -> None:
        super().clean()
        if self.min_salary is not None and self.max_salary is not None:
            if self.min_salary > self.max_salary:
                raise ValidationError({"max_salary": ["Maximum salary must be greater than or equal to minimum salary."]})

    def __str__(self) -> str:
        return f"HiringPreferences<{self.company.name}>"


class CompanyMember(models.Model):
    class MemberRole(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"
        VIEWER = "viewer", "Viewer"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="company_memberships")
    role = models.CharField(max_length=20, choices=MemberRole.choices, default=MemberRole.MEMBER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_id", "user_id"]
        constraints = [
            models.UniqueConstraint(fields=["company", "user"], name="unique_company_member"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.user.role != User.Role.COMPANY:
            raise ValidationError({"user": ["Only company users can be company members."]})
        if self.user.company_id != self.company_id:
            raise ValidationError({"user": ["Member user must belong to the same company."]})

    def __str__(self) -> str:
        return f"CompanyMember<{self.company.name}:{self.user.email}:{self.role}>"


class Vacancy(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    class WorkStyle(models.TextChoices):
        ONSITE = "onsite", "Onsite"
        HYBRID = "hybrid", "Hybrid"
        REMOTE = "remote", "Remote"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="vacancies")
    created_by = models.ForeignKey(
        "User",
        on_delete=models.PROTECT,
        related_name="created_vacancies",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    employment_type = models.CharField(max_length=100)
    experience_level = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    work_style = models.CharField(max_length=20, choices=WorkStyle.choices, default=WorkStyle.ONSITE)
    relocation_support = models.BooleanField(default=False)
    min_salary = models.IntegerField(null=True, blank=True)
    max_salary = models.IntegerField(null=True, blank=True)
    posting_details = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [
            models.Index(fields=["company", "status"], name="vacancy_company_status_idx"),
            models.Index(fields=["status", "-updated_at"], name="vacancy_status_updated_idx"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.created_by.role != User.Role.COMPANY:
            raise ValidationError({"created_by": ["Vacancies must be created by company users."]})
        if self.created_by.company_id != self.company_id:
            raise ValidationError({"created_by": ["Vacancy creator must belong to the same company."]})
        if self.min_salary is not None and self.max_salary is not None:
            if self.min_salary > self.max_salary:
                raise ValidationError({"max_salary": ["Maximum salary must be greater than or equal to minimum salary."]})

    def __str__(self) -> str:
        return f"Vacancy<{self.company.name}:{self.title}>"


class VacancySkillRequirement(models.Model):
    class RequirementType(models.TextChoices):
        REQUIRED = "required", "Required"
        PREFERRED = "preferred", "Preferred"

    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="skill_requirements")
    skill = models.ForeignKey("Skill", on_delete=models.CASCADE, related_name="vacancy_requirements")
    requirement_type = models.CharField(max_length=20, choices=RequirementType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["requirement_type", "skill__name", "id"]
        constraints = [
            models.UniqueConstraint(fields=["vacancy", "skill"], name="unique_vacancy_skill_requirement"),
        ]

    def __str__(self) -> str:
        return f"VacancySkillRequirement<{self.vacancy_id}:{self.skill.name}:{self.requirement_type}>"


class VacancyLanguageRequirement(models.Model):
    class Language(models.TextChoices):
        JAPANESE = "japanese", "Japanese"
        ENGLISH = "english", "English"

    class Level(models.TextChoices):
        BASIC = "basic", "Basic"
        CONVERSATIONAL = "conversational", "Conversational"
        BUSINESS = "business", "Business"
        FLUENT = "fluent", "Fluent"
        NATIVE = "native", "Native"

    class RequirementType(models.TextChoices):
        REQUIRED = "required", "Required"
        PREFERRED = "preferred", "Preferred"

    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="language_requirements")
    language = models.CharField(max_length=20, choices=Language.choices)
    minimum_level = models.CharField(max_length=20, choices=Level.choices)
    requirement_type = models.CharField(max_length=20, choices=RequirementType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["language", "id"]
        constraints = [
            models.UniqueConstraint(fields=["vacancy", "language"], name="unique_vacancy_language_requirement"),
        ]

    def __str__(self) -> str:
        return f"VacancyLanguageRequirement<{self.vacancy_id}:{self.language}:{self.minimum_level}>"


class Application(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under review"
        SHORTLISTED = "shortlisted", "Shortlisted"
        REJECTED = "rejected", "Rejected"
        WITHDRAWN = "withdrawn", "Withdrawn"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="applications")
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="applications")
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="applications",
        limit_choices_to={"role": "student"},
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [
            models.Index(fields=["student", "status"], name="application_student_status_idx"),
            models.Index(fields=["company", "status"], name="application_company_status_idx"),
            models.Index(fields=["vacancy", "status"], name="application_vacancy_status_idx"),
            models.Index(fields=["student", "vacancy"], name="app_student_vacancy_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "vacancy"],
                condition=models.Q(status__in=["submitted", "under_review", "shortlisted"]),
                name="unique_active_student_vacancy_application",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Applications may only belong to student users."]})
        if self.vacancy.company_id != self.company_id:
            raise ValidationError({"company": ["Application company must match the vacancy company."]})

    def __str__(self) -> str:
        return f"Application<{self.student.email}:{self.vacancy.title}:{self.status}>"


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="history")
    actor = models.ForeignKey(
        "User",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="application_status_events",
    )
    from_status = models.CharField(max_length=20, blank=True, default="")
    to_status = models.CharField(max_length=20, choices=Application.Status.choices)
    note = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def clean(self) -> None:
        super().clean()
        if self.from_status and self.from_status not in Application.Status.values:
            raise ValidationError({"from_status": ["Unsupported application status value."]})
        if self.actor and self.actor.role == User.Role.COMPANY and self.actor.company_id != self.application.company_id:
            raise ValidationError({"actor": ["Company actors must belong to the same company as the application."]})
        if self.actor and self.actor.role == User.Role.STUDENT and self.actor_id != self.application.student_id:
            raise ValidationError({"actor": ["Student actors must own the application."]})

    def __str__(self) -> str:
        return f"ApplicationStatusHistory<{self.application_id}:{self.to_status}>"


class StudentProfile(models.Model):
    user = models.OneToOneField("User", on_delete=models.CASCADE, related_name="student_profile")
    desired_job_type = models.CharField(max_length=100, blank=True, default="")
    desired_work_location = models.CharField(max_length=100, blank=True, default="")
    japanese_level = models.CharField(max_length=50, blank=True, default="")
    english_level = models.CharField(max_length=50, blank=True, default="")
    about_me = models.TextField(blank=True, default="")
    profile_image = models.TextField(blank=True, default="")
    cover_image = models.TextField(blank=True, default="")
    profile_image_file = models.FileField(upload_to=student_profile_image_upload_to, blank=True, default="")
    cover_image_file = models.FileField(upload_to=student_cover_image_upload_to, blank=True, default="")
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    portfolio_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user_id"]

    @property
    def profile_complete(self) -> bool:
        required_fields = (
            self.user.full_name.strip(),
            self.desired_job_type.strip(),
            self.desired_work_location.strip(),
            self.japanese_level.strip(),
            self.english_level.strip(),
        )
        return all(required_fields)

    def __str__(self) -> str:
        return f"StudentProfile<{self.user.email}>"


class StudentEducation(models.Model):
    class CompletionStatus(models.TextChoices):
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        PAUSED = "paused", "Paused"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="education_records",
        limit_choices_to={"role": "student"},
    )
    institution = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    completion_status = models.CharField(max_length=20, choices=CompletionStatus.choices, default=CompletionStatus.IN_PROGRESS)
    grade = models.CharField(max_length=100, blank=True, default="")
    activities = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    skills = models.ManyToManyField("Skill", blank=True, related_name="student_education_records")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Education records may only belong to student users."]})
        if self.end_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": ["End date cannot be earlier than start date."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.institution}"


class StudentExperience(models.Model):
    class ExperienceType(models.TextChoices):
        WORK = "work", "Work"
        INTERNSHIP = "internship", "Internship"
        PROJECT = "project", "Project"
        FREELANCE = "freelance", "Freelance"
        VOLUNTEER = "volunteer", "Volunteer"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="experience_records",
        limit_choices_to={"role": "student"},
    )
    organization = models.CharField(max_length=255)
    role_title = models.CharField(max_length=255)
    experience_type = models.CharField(max_length=20, choices=ExperienceType.choices, default=ExperienceType.WORK)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    summary = models.TextField(blank=True, default="")
    skills = models.ManyToManyField("Skill", blank=True, related_name="student_experience_records")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Experience records may only belong to student users."]})
        if self.end_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": ["End date cannot be earlier than start date."]})
        if self.is_current and self.end_date is not None:
            raise ValidationError({"end_date": ["Current experience cannot have an end date."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.organization}"


class StudentResume(models.Model):
    class SourceType(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        EXTERNAL = "external", "External"
        MANUAL = "manual", "Manual"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="resume_records",
        limit_choices_to={"role": "student"},
    )
    display_name = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    source_type = models.CharField(max_length=20, choices=SourceType.choices, default=SourceType.MANUAL)
    stored_file = models.FileField(upload_to=student_resume_upload_to, blank=True, default="")
    content_type = models.CharField(max_length=100, blank=True, default="")
    file_size_bytes = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Resume records may only belong to student users."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.display_name}"


class StudentCertificate(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="certificate_records",
        limit_choices_to={"role": "student"},
    )
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=255, blank=True, default="")
    credential_url = models.URLField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    skills = models.ManyToManyField("Skill", blank=True, related_name="student_certificates")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issue_date", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Certificate records may only belong to student users."]})
        if self.expiry_date and self.expiry_date < self.issue_date:
            raise ValidationError({"expiry_date": ["Expiry date cannot be earlier than issue date."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.name}"


class StudentAvailabilityProfile(models.Model):
    class JobSearchStatus(models.TextChoices):
        ACTIVELY_LOOKING = "actively_looking", "Actively looking"
        OPEN_TO_OFFERS = "open_to_offers", "Open to offers"
        NOT_SEARCHING = "not_searching", "Not searching"

    student = models.OneToOneField(
        "User",
        on_delete=models.CASCADE,
        related_name="availability_profile",
        limit_choices_to={"role": "student"},
    )
    job_search_status = models.CharField(max_length=30, choices=JobSearchStatus.choices, blank=True, default="")
    earliest_start_date = models.DateField(null=True, blank=True)
    interview_availability = models.CharField(max_length=255, blank=True, default="")
    scheduling_notes = models.TextField(blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["student_id"]

    @property
    def availability_set(self) -> bool:
        return any(
            [
                self.job_search_status,
                self.earliest_start_date is not None,
                self.interview_availability.strip(),
                self.scheduling_notes.strip(),
            ]
        )

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Availability profiles may only belong to student users."]})

    def __str__(self) -> str:
        return f"AvailabilityProfile<{self.student.email}>"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Course(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=100)
    difficulty_level = models.CharField(max_length=50, blank=True, default="")
    estimated_hours = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    thumbnail_image = models.TextField(blank=True, default="")
    thumbnail_image_file = models.FileField(upload_to=course_thumbnail_upload_to, blank=True, default="")
    thumbnail_alt_text = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    company = models.ForeignKey(
        Company,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="courses",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_courses",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.company_id is None and self.created_by_id is None:
            return
        if self.company_id is None or self.created_by_id is None:
            raise ValidationError({"company": ["Company-owned courses must include both company and creator."]})
        if self.created_by.role != User.Role.COMPANY:
            raise ValidationError({"created_by": ["Course creator must be a company user."]})
        if self.created_by.company_id != self.company_id:
            raise ValidationError({"created_by": ["Course creator must belong to the same company."]})

    def __str__(self) -> str:
        return self.title


class CourseReview(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_reviews",
        limit_choices_to={"role": "student"},
    )
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["course", "student"], name="unique_student_course_review"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Course reviews may only belong to student users."]})

    def __str__(self) -> str:
        return f"{self.course.title} review by {self.student.email}"


class Lesson(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    summary = models.TextField(blank=True, default="")
    content = models.TextField(blank=True, default="")
    transcript = models.TextField(blank=True, default="")
    video_url = models.URLField(blank=True, default="")
    sequence_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["course_id", "sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(fields=["course", "sequence_number"], name="unique_course_lesson_sequence"),
        ]

    def __str__(self) -> str:
        return f"{self.course.title} - {self.title}"


class CourseAssessment(models.Model):
    class Kind(models.TextChoices):
        LESSON = "lesson", "Lesson"
        FINAL = "final", "Final"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="assessments")
    lesson = models.OneToOneField(
        Lesson,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="assessment",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.LESSON)
    passing_score_percent = models.PositiveSmallIntegerField(
        default=90,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["course_id", "kind", "lesson__sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["course", "kind"],
                condition=models.Q(kind="final"),
                name="unique_final_assessment_per_course",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        if self.lesson_id is not None and self.lesson.course_id != self.course_id:
            raise ValidationError({"lesson": ["Assessment lesson must belong to the same course."]})
        if self.kind == self.Kind.LESSON and self.lesson_id is None:
            raise ValidationError({"lesson": ["Lesson assessments must be linked to a lesson."]})
        if self.kind == self.Kind.FINAL and self.lesson_id is not None:
            raise ValidationError({"lesson": ["Final course assessments cannot be tied to a lesson."]})

    def __str__(self) -> str:
        return f"{self.course.title} - {self.title}"


class CourseAssessmentQuestion(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = "single_choice", "Single choice"
        MULTIPLE_CHOICE = "multiple_choice", "Multiple choice"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    assessment = models.ForeignKey(CourseAssessment, on_delete=models.CASCADE, related_name="questions")
    prompt = models.TextField()
    instructions = models.TextField(blank=True, default="")
    question_type = models.CharField(max_length=30, choices=QuestionType.choices, default=QuestionType.SINGLE_CHOICE)
    sequence_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    points = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["assessment_id", "sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["assessment", "sequence_number"],
                name="unique_course_assessment_question_sequence",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.assessment.title} - Q{self.sequence_number}"


class CourseAssessmentOption(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    question = models.ForeignKey(CourseAssessmentQuestion, on_delete=models.CASCADE, related_name="options")
    option_text = models.CharField(max_length=255)
    sequence_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    is_correct = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["question_id", "sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["question", "sequence_number"],
                name="unique_course_assessment_option_sequence",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.question} - Option {self.sequence_number}"


class CourseAssessmentAttempt(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="course_assessment_attempts",
        limit_choices_to={"role": "student"},
    )
    assessment = models.ForeignKey(CourseAssessment, on_delete=models.CASCADE, related_name="attempts")
    attempt_number = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    score_percent = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False)
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField()
    completed_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "assessment", "attempt_number"],
                name="unique_student_course_assessment_attempt",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != "student":
            raise ValidationError({"student": ["Course assessment attempts may only belong to student users."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.assessment.title} - attempt {self.attempt_number}"


class CourseAssessmentAttemptSelection(models.Model):
    attempt = models.ForeignKey(CourseAssessmentAttempt, on_delete=models.CASCADE, related_name="selections")
    question = models.ForeignKey(CourseAssessmentQuestion, on_delete=models.CASCADE, related_name="attempt_selections")
    option = models.ForeignKey(CourseAssessmentOption, on_delete=models.CASCADE, related_name="attempt_selections")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["question__sequence_number", "option__sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["attempt", "question", "option"],
                name="unique_course_assessment_attempt_option",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        if self.question.assessment_id != self.attempt.assessment_id:
            raise ValidationError({"question": ["Attempt selections must belong to the same assessment."]})
        if self.option.question_id != self.question_id:
            raise ValidationError({"option": ["Selected option must belong to the provided question."]})

    def __str__(self) -> str:
        return f"{self.attempt} - Q{self.question.sequence_number}"


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        COMPANY = "company", "Company"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices)
    company = models.ForeignKey(
        Company,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="users",
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        ordering = ["email"]

    def clean(self) -> None:
        super().clean()

        if self.role == self.Role.COMPANY and not self.company_id:
            raise ValidationError({"company": ["Company users must have an associated company."]})

        if self.role in {self.Role.STUDENT, self.Role.ADMIN} and self.company_id:
            raise ValidationError({"company": ["Only company users can have an associated company."]})

    def __str__(self) -> str:
        return self.email


class JobBookmark(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="job_bookmarks",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="bookmarks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["student", "vacancy"], name="unique_student_job_bookmark"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Job bookmarks may only belong to student users."]})

    def __str__(self) -> str:
        return f"JobBookmark<{self.student.email}:{self.vacancy.title}>"


class CompanyCourseBookmark(models.Model):
    user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="company_course_bookmarks",
        limit_choices_to={"role": User.Role.COMPANY},
    )
    course = models.ForeignKey("Course", on_delete=models.CASCADE, related_name="company_bookmarks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_company_course_bookmark"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.user.role != User.Role.COMPANY:
            raise ValidationError({"user": ["Only company users can bookmark company courses."]})

    def __str__(self) -> str:
        return f"CompanyCourseBookmark<{self.user.email}:{self.course.title}>"


class StudentVisibilitySettings(models.Model):
    student = models.OneToOneField(
        "User",
        on_delete=models.CASCADE,
        related_name="visibility_settings",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    share_profile_preview = models.BooleanField(default=True)
    share_learning_record = models.BooleanField(default=True)
    share_exam_results = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["student_id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Visibility settings may only belong to student users."]})

    def __str__(self) -> str:
        return f"Visibility<{self.student.email}>"


class LearningRecord(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="learning_records",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    course = models.ForeignKey(
        Course,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="learning_records",
    )
    course_title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    progress_percent = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["course_title", "id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Learning records may only belong to student users."]})

        if self.status == self.Status.COMPLETED and self.progress_percent != 100:
            raise ValidationError({"progress_percent": ["Completed learning records must have 100 percent progress."]})

        if self.status != self.Status.COMPLETED and self.completed_at is not None:
            raise ValidationError({"completed_at": ["Only completed learning records can have a completion timestamp."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.course_title}"


class LessonProgress(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"

    learning_record = models.ForeignKey(
        LearningRecord,
        on_delete=models.CASCADE,
        related_name="lesson_progress",
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="progress_entries",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["lesson__sequence_number", "lesson_id", "id"]
        constraints = [
            models.UniqueConstraint(fields=["learning_record", "lesson"], name="unique_learning_record_lesson_progress"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.learning_record.course_id != self.lesson.course_id:
            raise ValidationError({"lesson": ["Lesson progress must belong to the same course as the learning record."]})
        if self.status == self.Status.NOT_STARTED:
            if self.started_at is not None or self.completed_at is not None:
                raise ValidationError(
                    {
                        "status": [
                            "Not-started lesson progress cannot have started_at or completed_at timestamps."
                        ]
                    }
                )
        elif self.status == self.Status.IN_PROGRESS:
            if self.started_at is None:
                raise ValidationError({"started_at": ["In-progress lesson progress requires a started_at timestamp."]})
            if self.completed_at is not None:
                raise ValidationError({"completed_at": ["In-progress lesson progress cannot have a completion timestamp."]})
        elif self.completed_at is None:
            raise ValidationError({"completed_at": ["Completed lesson progress requires a completion timestamp."]})

    def __str__(self) -> str:
        return f"{self.learning_record.student.email} - {self.lesson.title} - {self.status}"


class ExamCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='book', help_text='Bootstrap icon name')
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self) -> str:
        return self.name


class Exam(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    category_fk = models.ForeignKey(
        ExamCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='exams'
    )
    category = models.CharField(max_length=100)
    duration_minutes = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    passing_score_percent = models.PositiveSmallIntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    question_count = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    max_attempts = models.PositiveSmallIntegerField(
        default=3,
        validators=[MinValueValidator(1)],
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def __str__(self) -> str:
        return self.title


class ExamQuestion(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = "single_choice", "Single choice"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="questions")
    prompt = models.TextField()
    instructions = models.TextField(blank=True, default="")
    question_type = models.CharField(max_length=30, choices=QuestionType.choices, default=QuestionType.SINGLE_CHOICE)
    sequence_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    points = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["exam_id", "sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(fields=["exam", "sequence_number"], name="unique_exam_question_sequence"),
        ]

    def __str__(self) -> str:
        return f"{self.exam.title} - Q{self.sequence_number}"


class ExamAnswerOption(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name="answer_options")
    option_text = models.CharField(max_length=255)
    sequence_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    is_correct = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["question_id", "sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(fields=["question", "sequence_number"], name="unique_question_option_sequence"),
        ]

    def __str__(self) -> str:
        return f"{self.question} - Option {self.sequence_number}"


class ExamAttempt(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        SCORED = "scored", "Scored"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="exam_attempts",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="attempts")
    attempt_number = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    score_percent = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    passed = models.BooleanField(null=True, blank=True)
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-started_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["student", "exam", "attempt_number"], name="unique_student_exam_attempt"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Exam attempts may only belong to student users."]})
        if self.status == self.Status.SCORED:
            if self.score_percent is None:
                raise ValidationError({"score_percent": ["Scored attempts require a score."]})
            if self.passed is None:
                raise ValidationError({"passed": ["Scored attempts require a pass/fail outcome."]})
            if self.submitted_at is None or self.completed_at is None:
                raise ValidationError({"submitted_at": ["Scored attempts require submitted_at and completed_at timestamps."]})
        elif self.score_percent is not None or self.passed is not None or self.completed_at is not None:
            raise ValidationError({"status": ["Submitted attempts cannot include final scoring fields."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.exam.title} - attempt {self.attempt_number}"


class ExamAttemptAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name="attempt_answers")
    selected_option = models.ForeignKey(
        ExamAnswerOption,
        on_delete=models.CASCADE,
        related_name="selected_attempt_answers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["question__sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(fields=["attempt", "question"], name="unique_attempt_question_answer"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.question.exam_id != self.attempt.exam_id:
            raise ValidationError({"question": ["Attempt answers must belong to the same exam as the attempt."]})
        if self.selected_option.question_id != self.question_id:
            raise ValidationError({"selected_option": ["Selected option must belong to the provided question."]})

    def __str__(self) -> str:
        return f"{self.attempt} - Q{self.question.sequence_number}"


class PracticeQuestionAttempt(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="practice_question_attempts",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="practice_attempts")
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name="practice_attempts")
    selected_option = models.ForeignKey(
        ExamAnswerOption,
        on_delete=models.CASCADE,
        related_name="practice_attempts",
    )
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Practice attempts may only belong to student users."]})
        if self.question.exam_id != self.exam_id:
            raise ValidationError({"question": ["Practice questions must belong to the selected exam."]})
        if self.selected_option.question_id != self.question_id:
            raise ValidationError({"selected_option": ["Selected option must belong to the provided question."]})

    def __str__(self) -> str:
        return f"{self.student.email} - practice Q{self.question.sequence_number}"


class MockExamAttempt(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="mock_exam_attempts",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="mock_attempts")
    exam_title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    attempt_number = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    score_percent = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    correct_answer_count = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0)])
    total_questions = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0)])
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["student", "exam", "attempt_number"], name="unique_student_mock_exam_attempt"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Mock exam attempts may only belong to student users."]})
        if self.correct_answer_count > self.total_questions:
            raise ValidationError({"correct_answer_count": ["Correct answers cannot exceed the total question count."]})

    def __str__(self) -> str:
        return f"{self.student.email} - mock {self.exam_title} - attempt {self.attempt_number}"


class MockExamAttemptAnswer(models.Model):
    attempt = models.ForeignKey(MockExamAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name="mock_attempt_answers")
    selected_option = models.ForeignKey(
        ExamAnswerOption,
        on_delete=models.CASCADE,
        related_name="selected_mock_attempt_answers",
    )
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["question__sequence_number", "id"]
        constraints = [
            models.UniqueConstraint(fields=["attempt", "question"], name="unique_mock_attempt_question_answer"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.question.exam_id != self.attempt.exam_id:
            raise ValidationError({"question": ["Mock attempt answers must belong to the same exam as the attempt."]})
        if self.selected_option.question_id != self.question_id:
            raise ValidationError({"selected_option": ["Selected option must belong to the provided question."]})

    def __str__(self) -> str:
        return f"{self.attempt} - Q{self.question.sequence_number}"


class ExamResult(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="exam_results",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    exam = models.ForeignKey(
        Exam,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="results",
    )
    attempt = models.OneToOneField(
        ExamAttempt,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="result",
    )
    exam_title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    score_percent = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    passed = models.BooleanField(default=False)
    attempt_number = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    taken_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-taken_at", "exam_title", "id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Exam results may only belong to student users."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.exam_title}"


class PracticeQuestion(models.Model):
    class DifficultyChoices(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='practice_questions')
    question_text = models.TextField()
    explanation = models.TextField(blank=True, help_text='Explanation shown after answering')
    difficulty = models.CharField(
        max_length=20,
        choices=DifficultyChoices.choices,
        default=DifficultyChoices.MEDIUM
    )
    topic = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.exam.title} - {self.question_text[:50]}"


class PracticeQuestionOption(models.Model):
    question = models.ForeignKey(PracticeQuestion, on_delete=models.CASCADE, related_name='options')
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self) -> str:
        return f"{self.question_id} - Option"


class MockExam(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='mock_exams')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveSmallIntegerField(default=60, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.exam.title} - {self.title}"


class StudyPlan(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name='study_plan')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='study_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.student.user.email} - {self.exam.title}"


class StudyPlanItem(models.Model):
    class ItemTypeChoices(models.TextChoices):
        LESSON = "lesson", "Course Lesson"
        PRACTICE = "practice", "Practice Questions"
        MOCK = "mock", "Mock Exam"
        READING = "reading", "Reading Material"
    
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ItemTypeChoices.choices)
    lesson = models.ForeignKey(
        Lesson,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='study_plan_items'
    )
    practice_question = models.ForeignKey(
        PracticeQuestion,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='study_plan_items'
    )
    mock_exam = models.ForeignKey(
        MockExam,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='study_plan_items'
    )
    completed = models.BooleanField(default=False)
    completion_date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self) -> str:
        return f"{self.study_plan_id} - Item {self.order}"


class StudentPerformanceMetric(models.Model):
    class MetricTypeChoices(models.TextChoices):
        EXAM_ATTEMPTS = "exam_attempts", "Total Exam Attempts"
        AVERAGE_SCORE = "average_score", "Average Score"
        BEST_SCORE = "best_score", "Best Score"
        IMPROVEMENT = "improvement", "Score Improvement"
        PRACTICE_QUESTIONS = "practice_questions", "Practice Questions Done"
        MOCK_EXAMS = "mock_exams", "Mock Exams Done"
        TIME_SPENT = "time_spent", "Hours Spent Studying"
    
    class TrendChoices(models.TextChoices):
        UP = "up", "Improving"
        STABLE = "stable", "Stable"
        DOWN = "down", "Declining"
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='performance_metrics')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='performance_metrics')
    metric_type = models.CharField(max_length=30, choices=MetricTypeChoices.choices)
    value = models.FloatField()
    trend = models.CharField(
        max_length=10,
        choices=TrendChoices.choices,
        null=True,
        blank=True
    )
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-calculated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'exam', 'metric_type'],
                name='unique_student_exam_metric'
            )
        ]
    
    def __str__(self) -> str:
        return f"{self.student.user.email} - {self.exam.title} - {self.metric_type}"


class CandidateReviewAccess(models.Model):
    class Source(models.TextChoices):
        MATCH = "match", "Match"
        APPLICATION = "application", "Application"
        SHORTLIST = "shortlist", "Shortlist"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="candidate_review_accesses")
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="candidate_review_accesses",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    source = models.CharField(max_length=20, choices=Source.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["company", "student", "source"], name="unique_candidate_review_source"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Candidate review access may only reference student users."]})

    def __str__(self) -> str:
        return f"{self.company.name} -> {self.student.email} ({self.source})"


class StudentVisibilityEvent(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="visibility_events",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    share_profile_preview = models.BooleanField()
    share_learning_record = models.BooleanField()
    share_exam_results = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Visibility events may only belong to student users."]})

    def __str__(self) -> str:
        return f"VisibilityEvent<{self.student.email}>"


class CandidateShortlist(models.Model):
    candidate_access = models.OneToOneField(
        CandidateReviewAccess,
        on_delete=models.CASCADE,
        related_name="shortlist_entry",
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="candidate_shortlists")
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="candidate_shortlists",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    created_by = models.ForeignKey(
        "User",
        on_delete=models.PROTECT,
        related_name="created_candidate_shortlists",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Shortlist entries may only reference student users."]})
        if self.created_by.role != User.Role.COMPANY:
            raise ValidationError({"created_by": ["Shortlist entries must be created by company users."]})
        if self.candidate_access.company_id != self.company_id:
            raise ValidationError({"company": ["Shortlist company must match the candidate access company."]})
        if self.candidate_access.student_id != self.student_id:
            raise ValidationError({"student": ["Shortlist student must match the candidate access student."]})
        if self.created_by.company_id != self.company_id:
            raise ValidationError({"created_by": ["Shortlist creator must belong to the same company."]})

    def __str__(self) -> str:
        return f"Shortlist<{self.company.name}:{self.student.email}>"


class CandidateNote(models.Model):
    candidate_access = models.ForeignKey(
        CandidateReviewAccess,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="candidate_notes")
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="candidate_notes",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    author = models.ForeignKey(
        "User",
        on_delete=models.PROTECT,
        related_name="candidate_notes_authored",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Candidate notes may only reference student users."]})
        if self.author.role != User.Role.COMPANY:
            raise ValidationError({"author": ["Candidate notes must be created by company users."]})
        if self.candidate_access.company_id != self.company_id:
            raise ValidationError({"company": ["Candidate note company must match the candidate access company."]})
        if self.candidate_access.student_id != self.student_id:
            raise ValidationError({"student": ["Candidate note student must match the candidate access student."]})
        if self.author.company_id != self.company_id:
            raise ValidationError({"author": ["Candidate note author must belong to the same company."]})
        if not self.body.strip():
            raise ValidationError({"body": ["Candidate notes cannot be blank."]})

    def __str__(self) -> str:
        return f"CandidateNote<{self.company.name}:{self.student.email}>"


class Interview(models.Model):
    class MeetingProvider(models.TextChoices):
        ZOOM = "zoom", "Zoom"
        GOOGLE_MEET = "google_meet", "Google Meet"
        TEAMS = "teams", "Microsoft Teams"
        CUSTOM = "custom", "Custom"

    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        CONFIRMED = "confirmed", "Confirmed"
        RESCHEDULED = "rescheduled", "Rescheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    candidate_access = models.ForeignKey(
        CandidateReviewAccess,
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="interviews")
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="interviews",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    requested_by = models.ForeignKey(
        "User",
        on_delete=models.PROTECT,
        related_name="requested_interviews",
    )
    purpose = models.CharField(max_length=255)
    role_context = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    scheduled_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    meeting_provider = models.CharField(max_length=30, choices=MeetingProvider.choices, blank=True, default="")
    meeting_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Interviews may only reference student users."]})
        if self.requested_by.role != User.Role.COMPANY:
            raise ValidationError({"requested_by": ["Interviews must be requested by company users."]})
        if self.candidate_access.company_id != self.company_id:
            raise ValidationError({"company": ["Interview company must match the candidate access company."]})
        if self.candidate_access.student_id != self.student_id:
            raise ValidationError({"student": ["Interview student must match the candidate access student."]})
        if self.requested_by.company_id != self.company_id:
            raise ValidationError({"requested_by": ["Interview requester must belong to the same company."]})
        if self.status == self.Status.CONFIRMED and (self.scheduled_start is None or self.scheduled_end is None):
            raise ValidationError({"scheduled_start": ["Confirmed interviews require a final scheduled window."]})
        if self.status == self.Status.COMPLETED and (
            self.scheduled_start is None or self.scheduled_end is None or self.completed_at is None
        ):
            raise ValidationError({"completed_at": ["Completed interviews require a confirmed schedule and completion timestamp."]})
        if self.scheduled_start and self.scheduled_end and self.scheduled_start >= self.scheduled_end:
            raise ValidationError({"scheduled_end": ["Interview end time must be after the start time."]})
        if self.cancelled_at is not None and self.status != self.Status.CANCELLED:
            raise ValidationError({"cancelled_at": ["Only cancelled interviews can have a cancellation timestamp."]})
        if self.completed_at is not None and self.status != self.Status.COMPLETED:
            raise ValidationError({"completed_at": ["Only completed interviews can have a completion timestamp."]})
        if self.meeting_provider and not self.meeting_url:
            raise ValidationError({"meeting_url": ["Meeting URL is required when a meeting provider is set."]})
        if self.meeting_url and not self.meeting_provider:
            raise ValidationError({"meeting_provider": ["Meeting provider is required when a meeting URL is set."]})

    def __str__(self) -> str:
        return f"Interview<{self.company.name}:{self.student.email}:{self.status}>"


class InterviewAvailability(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name="availabilities")
    submitted_by = models.ForeignKey(
        "User",
        on_delete=models.PROTECT,
        related_name="interview_availabilities",
    )
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    note = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at", "id"]

    def clean(self) -> None:
        super().clean()
        is_company_participant = self.submitted_by.role == User.Role.COMPANY and self.submitted_by.company_id == self.interview.company_id
        is_student_participant = self.submitted_by_id == self.interview.student_id
        if not (is_company_participant or is_student_participant):
            raise ValidationError({"submitted_by": ["Availability can only be submitted by interview participants."]})
        if self.start_at >= self.end_at:
            raise ValidationError({"end_at": ["Availability end time must be after the start time."]})

    def __str__(self) -> str:
        return f"Availability<{self.interview_id}:{self.submitted_by.email}>"


class InterviewEvent(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name="events")
    actor = models.ForeignKey(
        "User",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="interview_events",
    )
    event_type = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self) -> str:
        return f"InterviewEvent<{self.interview_id}:{self.event_type}>"


from users.communication_models import Message, MessageThread, Notification, NotificationDelivery


class StudentSkill(models.Model):
    class Proficiency(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="student_skills",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="student_skills")
    proficiency_level = models.CharField(
        max_length=20,
        choices=Proficiency.choices,
        default=Proficiency.BEGINNER,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["student_id", "skill__name"]
        constraints = [
            models.UniqueConstraint(fields=["student", "skill"], name="unique_student_skill"),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Only student users can have student skills."]})

    def __str__(self) -> str:
        return f"{self.student.email} - {self.skill.name}"


from users.operations_models import (
    AuditLog,
    CompanyDashboardMetric,
    DataConsent,
    DataDeletionRequest,
    DataExportRequest,
    NotificationEvent,
    NotificationPreference,
    ScheduledTask,
    StudentDashboardMetric,
    StudentDataAccessLog,
)
