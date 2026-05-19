from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from users.models import Company, StudentProfile, User


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
    email_on_application = models.BooleanField(default=True)
    email_on_interview = models.BooleanField(default=True)
    email_on_exam_result = models.BooleanField(default=True)
    email_on_study_plan = models.BooleanField(default=False)
    email_on_course_completion = models.BooleanField(default=False)
    email_on_skill_endorsed = models.BooleanField(default=False)
    app_notifications_enabled = models.BooleanField(default=True)
    daily_digest = models.BooleanField(default=False)
    digest_time = models.TimeField(default="09:00")
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
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    changes = models.JSONField(default=dict, blank=True)
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


class DataConsent(models.Model):
    CONSENT_TYPES = [
        ("share_profile_with_company", "Share profile with companies"),
        ("share_learning_with_company", "Share learning records with companies"),
        ("share_exam_results_with_company", "Share exam results with companies"),
        ("marketing_emails", "Marketing communications"),
        ("research_participation", "Participate in research"),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="consents",
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
        related_name="received_consents",
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
                name="unique_data_consent",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        if self.student.role != User.Role.STUDENT:
            raise ValidationError({"student": ["Consents may only belong to student users."]})

        company_consent_types = [
            "share_profile_with_company",
            "share_learning_with_company",
            "share_exam_results_with_company",
        ]
        if self.consent_type in company_consent_types and not self.company_id:
            raise ValidationError({"company": [f"Company is required for {self.consent_type} consent."]})

    def __str__(self) -> str:
        return f"Consent<{self.student.email}:{self.consent_type}>"


class StudentDataAccessLog(models.Model):
    ACCESS_TYPES = [
        ("profile", "Profile View"),
        ("learning_record", "Learning Records"),
        ("exam_results", "Exam Results"),
        ("resume", "Resume"),
        ("all_data", "Full Data Export"),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="data_access_logs",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    accessed_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="data_accesses",
    )
    accessed_by_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
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
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("ready", "Ready"),
        ("expired", "Expired"),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="data_export_requests",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
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
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="deletion_requests",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
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
    courses_in_progress = models.IntegerField(default=0)
    courses_completed = models.IntegerField(default=0)
    exams_attempted = models.IntegerField(default=0)
    average_exam_score = models.FloatField(default=0.0)
    applications_submitted = models.IntegerField(default=0)
    applications_accepted = models.IntegerField(default=0)
    applications_rejected = models.IntegerField(default=0)
    interviews_scheduled = models.IntegerField(default=0)
    interviews_completed = models.IntegerField(default=0)
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
    open_vacancies = models.IntegerField(default=0)
    total_applications = models.IntegerField(default=0)
    interviews_scheduled = models.IntegerField(default=0)
    offers_made = models.IntegerField(default=0)
    new_applications_7days = models.IntegerField(default=0)
    interview_conversion_rate = models.FloatField(default=0.0)
    average_time_to_hire_days = models.IntegerField(default=0)
    shortlist_ratio = models.FloatField(default=0.0)
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
