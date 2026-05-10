from users.models import Application, ApplicationStatusHistory, ExamResult, Interview, InterviewEvent, Notification, NotificationDelivery, User, NotificationEvent, NotificationPreference
from services.email import get_email_service


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


def build_application_link(recipient: User) -> str:
    if recipient.role == User.Role.COMPANY:
        return "/company/applications"
    return "/student/applications"


def application_notification_payload(history_entry: ApplicationStatusHistory) -> tuple[str, str, str] | None:
    application = history_entry.application
    company_name = application.company.name
    vacancy_title = application.vacancy.title
    payload_map = {
        Application.Status.SUBMITTED: (
            Notification.Type.APPLICATION_SUBMITTED,
            "Application submitted",
            f"Application for {vacancy_title} at {company_name} was submitted.",
        ),
        Application.Status.WITHDRAWN: (
            Notification.Type.APPLICATION_WITHDRAWN,
            "Application withdrawn",
            f"Application for {vacancy_title} at {company_name} was withdrawn.",
        ),
        Application.Status.SHORTLISTED: (
            Notification.Type.APPLICATION_SHORTLISTED,
            "Application shortlisted",
            f"Application for {vacancy_title} at {company_name} moved to the shortlist.",
        ),
        Application.Status.REJECTED: (
            Notification.Type.APPLICATION_REJECTED,
            "Application rejected",
            f"Application for {vacancy_title} at {company_name} was closed.",
        ),
    }
    return payload_map.get(history_entry.to_status)


def emit_application_status_notifications(history_entry: ApplicationStatusHistory) -> None:
    payload = application_notification_payload(history_entry)
    if payload is None:
        return

    application = history_entry.application
    notification_type, title, message = payload
    recipients: dict[int, User] = {
        application.student_id: application.student,
    }
    company_users = User.objects.filter(
        company=application.company,
        role=User.Role.COMPANY,
        is_active=True,
    ).order_by("id")
    for company_user in company_users:
        recipients[company_user.id] = company_user

    for recipient in recipients.values():
        create_notification(
            recipient=recipient,
            actor=history_entry.actor,
            notification_type=notification_type,
            title=title,
            message=message,
            link=build_application_link(recipient),
            entity_type="application",
            entity_id=application.id,
            event_key=f"application-history-{history_entry.id}",
        )


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


def send_notification_emails(instance) -> None:
    """Send email notifications based on user preferences and event type."""
    email_service = get_email_service()
    
    # Handle different instance types
    if isinstance(instance, ApplicationStatusHistory):
        application = instance.application
        student = application.student
        
        # Check preferences
        try:
            prefs = student.notification_preference
            if not prefs.email_on_application or prefs.unsubscribed:
                return
        except NotificationPreference.DoesNotExist:
            return
        
        # Send email
        email_service.send_application_received(
            student.email,
            application.vacancy.title,
            application.company.name,
        )
    
    elif isinstance(instance, ExamResult):
        student = instance.student
        
        # Check preferences
        try:
            prefs = student.notification_preference
            if not prefs.email_on_exam_result or prefs.unsubscribed:
                return
        except NotificationPreference.DoesNotExist:
            return
        
        # Send email
        email_service.send_exam_result(
            student.email,
            instance.exam_title,
            int(instance.score_percent),
        )
    
    elif isinstance(instance, InterviewEvent):
        interview = instance.interview
        student = interview.student
        
        # Check preferences
        try:
            prefs = student.notification_preference
            if not prefs.email_on_interview or prefs.unsubscribed:
                return
        except NotificationPreference.DoesNotExist:
            return
        
        # Send email for confirmed interviews
        if instance.event_type == "confirmed":
            meeting_link = interview.meeting_url or ""
             
            email_service.send_interview_scheduled(
                student.email,
                interview.scheduled_start.isoformat() if interview.scheduled_start else "",
                interview.company.name,
                meeting_link,
            )
    
    elif isinstance(instance, NotificationEvent):
        user = instance.user
        
        # Check preferences
        try:
            prefs = user.notification_preference
            if prefs.unsubscribed:
                return
        except NotificationPreference.DoesNotExist:
            return
        
        # Send emails based on event type
        if instance.event_type == NotificationEvent.EventType.EXAM_RESULT_READY:
            if not prefs.email_on_exam_result:
                return
            exam_title = instance.metadata.get("exam_title", "Your Exam")
            score = instance.metadata.get("score", 0)
            email_service.send_exam_result(user.email, exam_title, score)
        
        elif instance.event_type == NotificationEvent.EventType.STUDY_PLAN_READY:
            if not prefs.email_on_study_plan:
                return
            email_service.send_study_plan_ready(user.email)
        
        elif instance.event_type == NotificationEvent.EventType.INTERVIEW_SCHEDULED:
            if not prefs.email_on_interview:
                return
            interview_date = instance.metadata.get("interview_date", "")
            company_name = instance.metadata.get("company_name", "")
            meeting_link = instance.metadata.get("meeting_link", "")
            email_service.send_interview_scheduled(
                user.email,
                interview_date,
                company_name,
                meeting_link,
            )
