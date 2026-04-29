from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import ExamResult
from users.notifications import emit_exam_result_notification


@receiver(post_save, sender=ExamResult)
def exam_result_notification_handler(sender, instance: ExamResult, **kwargs) -> None:
    emit_exam_result_notification(instance)
