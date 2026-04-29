from users.models import ExamResult, Interview, InterviewEvent, Notification, NotificationDelivery, User


def create_notification(
    *,
    recipient: User,
    actor: User | None,
    notification_type: str,
    title: str,
    message: str,
    link: str,
    entity_type: str,
    entity_id: int,
    event_key: str,
) -> Notification:
    notification, created = Notification.objects.get_or_create(
        recipient=recipient,
        notification_type=notification_type,
        entity_type=entity_type,
        entity_id=entity_id,
        event_key=event_key,
        defaults={
            "actor": actor,
            "title": title,
            "message": message,
            "link": link,
        },
    )
    if created:
        NotificationDelivery.objects.create(
            notification=notification,
            channel=NotificationDelivery.Channel.IN_APP,
            status=NotificationDelivery.Status.DELIVERED,
            payload_summary=title,
        )
        NotificationDelivery.objects.create(
            notification=notification,
            channel=NotificationDelivery.Channel.EMAIL,
            status=NotificationDelivery.Status.LOGGED,
            payload_summary=message,
        )

    return notification


def build_interview_link(recipient: User, interview: Interview) -> str:
    if recipient.role == User.Role.COMPANY:
        return f"/company/interviews/{interview.id}"
    return f"/student/interviews/{interview.id}"


def emit_interview_event_notifications(event: InterviewEvent) -> None:
    notification_map = {
        "requested": (
            Notification.Type.INTERVIEW_REQUESTED,
            "Interview requested",
            f"Interview request recorded for {event.interview.purpose}.",
        ),
        "confirmed": (
            Notification.Type.INTERVIEW_CONFIRMED,
            "Interview confirmed",
            f"Interview for {event.interview.purpose} has been confirmed.",
        ),
        "rescheduled": (
            Notification.Type.INTERVIEW_RESCHEDULED,
            "Interview rescheduled",
            f"Interview for {event.interview.purpose} now needs a new schedule.",
        ),
        "cancelled": (
            Notification.Type.INTERVIEW_CANCELLED,
            "Interview cancelled",
            f"Interview for {event.interview.purpose} was cancelled.",
        ),
    }

    if event.event_type not in notification_map:
        return

    notification_type, title, message = notification_map[event.event_type]
    recipients: dict[int, User] = {
        event.interview.student_id: event.interview.student,
        event.interview.requested_by_id: event.interview.requested_by,
    }
    if event.actor_id and event.actor is not None:
        recipients.setdefault(event.actor_id, event.actor)

    for recipient in recipients.values():
        create_notification(
            recipient=recipient,
            actor=event.actor,
            notification_type=notification_type,
            title=title,
            message=message,
            link=build_interview_link(recipient, event.interview),
            entity_type="interview",
            entity_id=event.interview_id,
            event_key=f"interview-event-{event.id}",
        )


def emit_exam_result_notification(result: ExamResult) -> None:
    fingerprint = f"{result.score_percent}:{int(result.passed)}:{result.attempt_number}:{result.taken_at.isoformat()}"
    event_key = f"exam-result-{fingerprint}"
    if Notification.objects.filter(
        recipient=result.student,
        entity_type="exam_result",
        entity_id=result.id,
        event_key=event_key,
    ).exists():
        return

    existing = Notification.objects.filter(
        recipient=result.student,
        entity_type="exam_result",
        entity_id=result.id,
    ).exists()
    if existing:
        notification_type = Notification.Type.EXAM_RESULT_UPDATED
        title = "Exam result updated"
        message = f"{result.exam_title} was updated. Review the latest official result."
    else:
        notification_type = Notification.Type.EXAM_RESULT_AVAILABLE
        title = "Exam result available"
        message = f"{result.exam_title} is now available for review."

    create_notification(
        recipient=result.student,
        actor=None,
        notification_type=notification_type,
        title=title,
        message=message,
        link="/student/exams",
        entity_type="exam_result",
        entity_id=result.id,
        event_key=event_key,
    )
