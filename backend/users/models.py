from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
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
