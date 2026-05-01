from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import (
    ApplicationStatusHistory,
    ExamResult,
    InterviewEvent,
    NotificationEvent,
    NotificationPreference,
)
from users.notifications import (
    emit_application_status_notifications,
    emit_exam_result_notification,
    emit_interview_event_notifications,
    send_notification_emails,
)


@receiver(post_save, sender=ExamResult)
def exam_result_notification_handler(sender, instance: ExamResult, **kwargs) -> None:
    emit_exam_result_notification(instance)
    send_notification_emails(instance)


@receiver(post_save, sender=ApplicationStatusHistory)
def application_status_notification_handler(sender, instance: ApplicationStatusHistory, created: bool, **kwargs) -> None:
    if created:
        emit_application_status_notifications(instance)
        send_notification_emails(instance)


@receiver(post_save, sender=InterviewEvent)
def interview_event_notification_handler(sender, instance: InterviewEvent, **kwargs) -> None:
    emit_interview_event_notifications(instance)
    send_notification_emails(instance)


@receiver(post_save, sender=NotificationEvent)
def notification_event_handler(sender, instance: NotificationEvent, created: bool, **kwargs) -> None:
    """Handle new notification events - send emails based on preferences."""
    if created:
        send_notification_emails(instance)
