from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from users.managers import UserManager


class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    profile_image = models.TextField(blank=True, default="")
    cover_image = models.TextField(blank=True, default="")
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
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

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
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def __str__(self) -> str:
        return self.title


class Lesson(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    summary = models.TextField(blank=True, default="")
    content = models.TextField(blank=True, default="")
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


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION_SUBMITTED = "application_submitted", "Application submitted"
        APPLICATION_WITHDRAWN = "application_withdrawn", "Application withdrawn"
        APPLICATION_SHORTLISTED = "application_shortlisted", "Application shortlisted"
        APPLICATION_REJECTED = "application_rejected", "Application rejected"
        INTERVIEW_REQUESTED = "interview_requested", "Interview requested"
        INTERVIEW_CONFIRMED = "interview_confirmed", "Interview confirmed"
        INTERVIEW_RESCHEDULED = "interview_rescheduled", "Interview rescheduled"
        INTERVIEW_CANCELLED = "interview_cancelled", "Interview cancelled"
        EXAM_RESULT_AVAILABLE = "exam_result_available", "Exam result available"
        EXAM_RESULT_UPDATED = "exam_result_updated", "Exam result updated"

    recipient = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        "User",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="triggered_notifications",
    )
    notification_type = models.CharField(max_length=50, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True, default="")
    entity_type = models.CharField(max_length=50)
    entity_id = models.PositiveIntegerField()
    event_key = models.CharField(max_length=100)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["recipient", "notification_type", "entity_type", "entity_id", "event_key"],
                name="unique_notification_event",
            ),
        ]

    @property
    def is_read(self) -> bool:
        return self.read_at is not None

    def mark_read(self) -> None:
        if self.read_at is None:
            self.read_at = timezone.now()
            self.save(update_fields=["read_at", "updated_at"])

    def __str__(self) -> str:
        return f"Notification<{self.recipient.email}:{self.notification_type}>"


class NotificationDelivery(models.Model):
    class Channel(models.TextChoices):
        IN_APP = "in_app", "In-app"
        EMAIL = "email", "Email"

    class Status(models.TextChoices):
        DELIVERED = "delivered", "Delivered"
        LOGGED = "logged", "Logged"
        SUPPRESSED = "suppressed", "Suppressed"

    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name="deliveries",
    )
    channel = models.CharField(max_length=20, choices=Channel.choices)
    status = models.CharField(max_length=20, choices=Status.choices)
    payload_summary = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [
            models.UniqueConstraint(fields=["notification", "channel"], name="unique_notification_delivery_channel"),
        ]

    def __str__(self) -> str:
        return f"NotificationDelivery<{self.notification_id}:{self.channel}:{self.status}>"


class MessageThread(models.Model):
    class Category(models.TextChoices):
        APPLICATIONS = "applications", "Applications"
        INTERVIEWS = "interviews", "Interviews"
        SUPPORT = "support", "Support"

    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="message_threads",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    participant_user = models.ForeignKey(
        "User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="participant_threads",
    )
    participant_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, default="")
    role_label = models.CharField(max_length=255, blank=True, default="")
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.APPLICATIONS)
    is_pinned = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    last_message_preview = models.CharField(max_length=255, blank=True, default="")
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_message_sender = models.ForeignKey(
        "User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="last_message_threads",
    )
    last_read_at = models.DateTimeField(null=True, blank=True)
    company_last_read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_pinned", "-last_message_at", "-updated_at", "-id"]

    @property
    def is_unread(self) -> bool:
        if self.last_message_at is None:
            return False
        if self.last_message_sender_id == self.student_id:
            return False
        return self.last_read_at is None or self.last_read_at < self.last_message_at

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Message threads may only belong to student users."]})
        if self.participant_user_id == self.student_id:
            raise ValidationError({"participant_user": ["Participant user must be different from the student owner."]})

    def mark_read(self) -> None:
        now = timezone.now()
        if self.last_read_at is None or (self.last_message_at is not None and self.last_read_at < self.last_message_at):
            self.last_read_at = now
            self.save(update_fields=["last_read_at", "updated_at"])

    def __str__(self) -> str:
        return f"MessageThread<{self.student.email}:{self.participant_name}>"


class Message(models.Model):
    class DeliveryStatus(models.TextChoices):
        SENT = "sent", "Sent"
        DELIVERED = "delivered", "Delivered"
        READ = "read", "Read"

    thread = models.ForeignKey(
        MessageThread,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        "User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="messages_sent",
    )
    sender_name = models.CharField(max_length=255)
    body = models.TextField()
    delivery_status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.SENT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at", "id"]

    def clean(self) -> None:
        super().clean()
        if self.sender is not None and self.sender_id == self.thread.student_id:
            return
        if not self.sender_name.strip():
            raise ValidationError({"sender_name": ["Sender name is required."]})

    def __str__(self) -> str:
        return f"Message<{self.thread_id}:{self.sender_name}>"


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


class NotificationEvent(models.Model):
    """Track significant events that trigger notifications."""
    
    class EventType(models.TextChoices):
        APPLICATION_SUBMITTED = "application_submitted", "Application Submitted"
        APPLICATION_ACCEPTED = "application_accepted", "Application Accepted"
        APPLICATION_REJECTED = "application_rejected", "Application Rejected"
        INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
        INTERVIEW_CONFIRMED = "interview_confirmed", "Interview Confirmed"
        INTERVIEW_CANCELLED = "interview_cancelled", "Interview Cancelled"
        INTERVIEW_COMPLETED = "interview_completed", "Interview Completed"
        EXAM_RESULT_READY = "exam_result_ready", "Exam Result Ready"
        STUDY_PLAN_READY = "study_plan_ready", "Study Plan Ready"
        COURSE_COMPLETED = "course_completed", "Course Completed"
        SKILL_ENDORSED = "skill_endorsed", "Skill Endorsed"
    
    event_type = models.CharField(max_length=50, choices=EventType.choices)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notification_events",
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="initiated_notification_events",
        null=True,
        blank=True,
    )
    content_type = models.CharField(max_length=100, blank=True, default="")
    object_id = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["event_type", "-created_at"]),
        ]
    
    def __str__(self) -> str:
        return f"NotificationEvent<{self.user.email}:{self.event_type}>"


class NotificationPreference(models.Model):
    """User notification preferences."""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="notification_preference",
    )
    
    # Email preferences
    email_on_application = models.BooleanField(default=True)
    email_on_interview = models.BooleanField(default=True)
    email_on_exam_result = models.BooleanField(default=True)
    email_on_study_plan = models.BooleanField(default=False)
    email_on_course_completion = models.BooleanField(default=False)
    email_on_skill_endorsed = models.BooleanField(default=False)
    
    # In-app preferences
    app_notifications_enabled = models.BooleanField(default=True)
    
    # Frequency
    daily_digest = models.BooleanField(default=False)
    digest_time = models.TimeField(default="09:00")
    
    # Unsubscribe
    unsubscribed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["user_id"]


class AuditLog(models.Model):
    """Track all admin actions and data access for compliance."""
    
    class ActionType(models.TextChoices):
        CREATE = "create", "Create"
        UPDATE = "update", "Update"
        DELETE = "delete", "Delete"
        LOGIN = "login", "Login"
        EXPORT = "export", "Export"
        IMPORT = "import", "Import"
        VIEW = "view", "View"
        BULK_ACTION = "bulk_action", "Bulk Action"
    
    admin_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="audit_logs_created",
        limit_choices_to={"role": "admin"},
    )
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    entity_type = models.CharField(max_length=50)  # e.g., 'user', 'course', 'exam'
    entity_id = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    changes = models.JSONField(default=dict, blank=True)  # Before/after values
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["admin_user", "-created_at"]),
            models.Index(fields=["action_type", "-created_at"]),
            models.Index(fields=["entity_type", "entity_id"]),
        ]
    
    def __str__(self) -> str:
        return f"AuditLog<{self.admin_user.email}:{self.action_type}:{self.entity_type}:{self.entity_id}>"


class ScheduledTask(models.Model):
    """Configure and track scheduled administrative tasks."""
    
    class TaskType(models.TextChoices):
        ARCHIVE_APPLICATIONS = "archive_applications", "Archive Old Applications"
        SEND_DIGEST = "send_digest", "Send Weekly Digest"
        CLEANUP_EXPORTS = "cleanup_exports", "Clean Expired Exports"
        REFRESH_ANALYTICS = "refresh_analytics", "Refresh Analytics"
    
    class Schedule(models.TextChoices):
        HOURLY = "hourly", "Hourly"
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
    
    task_type = models.CharField(max_length=50, choices=TaskType.choices, unique=True)
    schedule = models.CharField(max_length=20, choices=Schedule.choices)
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField()
    last_result = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["task_type"]
    
    def __str__(self) -> str:
        return f"ScheduledTask<{self.task_type}:{self.schedule}>"
    
    def __str__(self) -> str:
        return f"NotificationPreference<{self.user.email}>"


class DataConsent(models.Model):
    CONSENT_TYPES = [
        ('share_profile_with_company', 'Share profile with companies'),
        ('share_learning_with_company', 'Share learning records with companies'),
        ('share_exam_results_with_company', 'Share exam results with companies'),
        ('marketing_emails', 'Marketing communications'),
        ('research_participation', 'Participate in research'),
    ]
    
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name='consents',
        limit_choices_to={"role": User.Role.STUDENT},
    )
    consent_type = models.CharField(max_length=50, choices=CONSENT_TYPES)
    given = models.BooleanField(default=False)
    given_at = models.DateTimeField(null=True, blank=True)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='received_consents'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-updated_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "consent_type", "company"],
                name="unique_data_consent"
            ),
        ]
    
    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Consents may only belong to student users."]})
        
        # Company-specific consent types require a company
        company_consent_types = [
            'share_profile_with_company',
            'share_learning_with_company',
            'share_exam_results_with_company'
        ]
        if self.consent_type in company_consent_types and not self.company_id:
            raise ValidationError({"company": [f"Company is required for {self.consent_type} consent."]})
    
    def __str__(self) -> str:
        return f"Consent<{self.student.email}:{self.consent_type}>"


class StudentDataAccessLog(models.Model):
    ACCESS_TYPES = [
        ('profile', 'Profile View'),
        ('learning_record', 'Learning Records'),
        ('exam_results', 'Exam Results'),
        ('resume', 'Resume'),
        ('all_data', 'Full Data Export'),
    ]
    
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name='data_access_logs',
        limit_choices_to={"role": User.Role.STUDENT},
    )
    accessed_by = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name='data_accesses'
    )
    accessed_by_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    access_type = models.CharField(max_length=50, choices=ACCESS_TYPES)
    reason = models.CharField(max_length=255, blank=True, default="")
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["student", "-created_at"]),
            models.Index(fields=["accessed_by_company", "-created_at"]),
        ]
    
    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Data access logs may only belong to student users."]})
        if self.accessed_by.role == User.Role.COMPANY and not self.accessed_by_company_id:
            raise ValidationError({"accessed_by_company": ["Company is required for company user access logs."]})
    
    def __str__(self) -> str:
        return f"DataAccessLog<{self.student.email}:{self.access_type}>"


class DataExportRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('expired', 'Expired'),
    ]
    
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name='data_export_requests',
        limit_choices_to={"role": User.Role.STUDENT},
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_url = models.URLField(null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["student", "-created_at"]),
            models.Index(fields=["status"]),
        ]
    
    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Export requests may only belong to student users."]})
        if self.expires_at <= timezone.now():
            raise ValidationError({"expires_at": ["Expiration time must be in the future."]})
    
    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at
    
    def __str__(self) -> str:
        return f"ExportRequest<{self.student.email}:{self.status}>"


class DataDeletionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name='deletion_requests',
        limit_choices_to={"role": User.Role.STUDENT},
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(blank=True, default="")
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["student", "-created_at"]),
            models.Index(fields=["status"]),
        ]
    
    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Deletion requests may only belong to student users."]})
    
    def __str__(self) -> str:
        return f"DeletionRequest<{self.student.email}:{self.status}>"


class StudentDashboardMetric(models.Model):
    """Analytics metrics for student dashboard - pre-calculated and cached"""
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name="dashboard_metric")
    
    # Learning metrics
    courses_in_progress = models.IntegerField(default=0)
    courses_completed = models.IntegerField(default=0)
    exams_attempted = models.IntegerField(default=0)
    average_exam_score = models.FloatField(default=0.0)
    
    # Application metrics
    applications_submitted = models.IntegerField(default=0)
    applications_accepted = models.IntegerField(default=0)
    applications_rejected = models.IntegerField(default=0)
    
    # Interview metrics
    interviews_scheduled = models.IntegerField(default=0)
    interviews_completed = models.IntegerField(default=0)
    
    # Skill metrics
    skills_total = models.IntegerField(default=0)
    skills_endorsed = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["student", "-updated_at"]),
        ]
    
    def __str__(self) -> str:
        return f"StudentDashboardMetric<{self.student.user.email}>"


class CompanyDashboardMetric(models.Model):
    """Analytics metrics for company dashboard - pre-calculated and cached"""
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name="dashboard_metric")
    
    # Hiring overview
    open_vacancies = models.IntegerField(default=0)
    total_applications = models.IntegerField(default=0)
    interviews_scheduled = models.IntegerField(default=0)
    offers_made = models.IntegerField(default=0)
    
    # Pipeline metrics
    new_applications_7days = models.IntegerField(default=0)
    interview_conversion_rate = models.FloatField(default=0.0)
    average_time_to_hire_days = models.IntegerField(default=0)
    shortlist_ratio = models.FloatField(default=0.0)
    
    # Recent activity metrics
    recent_interviews_completed = models.IntegerField(default=0)
    recent_candidates_shortlisted = models.IntegerField(default=0)
    recent_notes_added = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["company", "-updated_at"]),
        ]
    
    def __str__(self) -> str:
        return f"CompanyDashboardMetric<{self.company.name}>"
