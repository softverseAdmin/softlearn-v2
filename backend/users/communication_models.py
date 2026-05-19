from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from users.models import Company, User


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
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        User,
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
        User,
        on_delete=models.CASCADE,
        related_name="message_threads",
        limit_choices_to={"role": User.Role.STUDENT},
    )
    participant_user = models.ForeignKey(
        User,
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
        User,
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
        User,
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
