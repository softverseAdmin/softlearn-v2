from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import ApplicationStatusHistory, ExamResult
from users.notifications import emit_application_status_notifications, emit_exam_result_notification


@receiver(post_save, sender=ExamResult)
def exam_result_notification_handler(sender, instance: ExamResult, **kwargs) -> None:
    emit_exam_result_notification(instance)


@receiver(post_save, sender=ApplicationStatusHistory)
def application_status_notification_handler(sender, instance: ApplicationStatusHistory, created: bool, **kwargs) -> None:
    if created:
        emit_application_status_notifications(instance)
