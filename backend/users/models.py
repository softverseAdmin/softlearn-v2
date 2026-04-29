from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify

from users.managers import UserManager


class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField("User", on_delete=models.CASCADE, related_name="student_profile")
    desired_job_type = models.CharField(max_length=100, blank=True, default="")
    desired_work_location = models.CharField(max_length=100, blank=True, default="")
    japanese_level = models.CharField(max_length=50, blank=True, default="")
    english_level = models.CharField(max_length=50, blank=True, default="")
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


class ExamResult(models.Model):
    student = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="exam_results",
        limit_choices_to={"role": User.Role.STUDENT},
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
