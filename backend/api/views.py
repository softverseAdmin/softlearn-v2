from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from urllib.parse import urlparse

from common.decorators import api_endpoint
from common.http import csrf_response_payload, error_response, parse_json_body, success_response
from users.models import (
    CandidateNote,
    CandidateReviewAccess,
    CandidateShortlist,
    Company,
    ExamResult,
    Interview,
    InterviewAvailability,
    InterviewEvent,
    LearningRecord,
    Notification,
    Skill,
    StudentProfile,
    StudentSkill,
    StudentVisibilityEvent,
    StudentVisibilitySettings,
    User,
    Vacancy,
)
from users.notifications import emit_interview_event_notifications


def serialize_user(user: User) -> dict:
    return {
        "user_id": user.id,
        "role": user.role,
        "email": user.email,
        "name": user.full_name,
        "authenticated": True,
        "company_id": user.company_id,
    }


def validate_signup_payload(payload: dict) -> None:
    errors = {}
    for field in ("role", "email", "password", "name"):
        if not payload.get(field):
            errors[field] = ["This field is required."]

    role = payload.get("role")
    if role and role not in {User.Role.STUDENT, User.Role.COMPANY}:
        errors["role"] = ["Role must be one of: student, company."]

    if role == User.Role.COMPANY and not payload.get("company_name"):
        errors["company_name"] = ["This field is required when signing up as a company user."]

    if errors:
        raise ValidationError(errors)


def get_student_profile(user: User) -> StudentProfile:
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    return profile


def serialize_student_profile(user: User) -> dict:
    profile = get_student_profile(user)
    return {
        "student_id": user.id,
        "name": user.full_name,
        "desired_job_type": profile.desired_job_type,
        "desired_work_location": profile.desired_work_location,
        "japanese_level": profile.japanese_level,
        "english_level": profile.english_level,
        "profile_complete": profile.profile_complete,
    }


def serialize_skill(skill: Skill) -> dict:
    return {
        "id": skill.id,
        "name": skill.name,
        "slug": skill.slug,
    }


def serialize_student_skill(student_skill: StudentSkill) -> dict:
    return {
        "id": student_skill.id,
        "skill_id": student_skill.skill_id,
        "skill_name": student_skill.skill.name,
        "proficiency_level": student_skill.proficiency_level,
    }


def serialize_student_skills(user: User) -> dict:
    selected_skills = list(
        StudentSkill.objects.filter(student=user)
        .select_related("skill")
        .order_by("skill__name")
    )
    available_skills = list(Skill.objects.order_by("name"))
    return {
        "skills": [serialize_student_skill(student_skill) for student_skill in selected_skills],
        "available_skills": [serialize_skill(skill) for skill in available_skills],
        "skill_count": len(selected_skills),
    }


def serialize_company_profile(user: User) -> dict:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    return {
        "company_id": company.id,
        "name": company.name,
        "description": company.description,
        "profile_complete": bool(company.name.strip() and company.description.strip()),
    }


def get_visibility_settings(user: User) -> StudentVisibilitySettings:
    settings, _ = StudentVisibilitySettings.objects.get_or_create(student=user)
    return settings


def record_visibility_event(user: User, settings: StudentVisibilitySettings) -> StudentVisibilityEvent:
    return StudentVisibilityEvent.objects.create(
        student=user,
        share_profile_preview=settings.share_profile_preview,
        share_learning_record=settings.share_learning_record,
        share_exam_results=settings.share_exam_results,
    )


def ensure_visibility_event_exists(user: User, settings: StudentVisibilitySettings) -> None:
    if not StudentVisibilityEvent.objects.filter(student=user).exists():
        record_visibility_event(user, settings)


def serialize_visibility_event(event: StudentVisibilityEvent) -> dict:
    return {
        "id": event.id,
        "share_profile_preview": event.share_profile_preview,
        "share_learning_record": event.share_learning_record,
        "share_exam_results": event.share_exam_results,
        "created_at": event.created_at.isoformat(),
    }


def serialize_student_privacy_settings(user: User) -> dict:
    settings = get_visibility_settings(user)
    ensure_visibility_event_exists(user, settings)
    events = list(StudentVisibilityEvent.objects.filter(student=user).order_by("-created_at", "-id")[:10])
    return {
        "student_id": user.id,
        "share_profile_preview": settings.share_profile_preview,
        "share_learning_record": settings.share_learning_record,
        "share_exam_results": settings.share_exam_results,
        "history": [serialize_visibility_event(event) for event in events],
    }


def serialize_learning_record(record: LearningRecord) -> dict:
    return {
        "id": record.id,
        "course_title": record.course_title,
        "category": record.category,
        "progress_percent": record.progress_percent,
        "status": record.status,
        "completed_at": record.completed_at.isoformat() if record.completed_at else None,
    }


def serialize_learning_summary(user: User) -> dict:
    records = list(LearningRecord.objects.filter(student=user).order_by("course_title", "id"))
    return {
        "student_id": user.id,
        "total_courses": len(records),
        "completed_courses": sum(1 for record in records if record.status == LearningRecord.Status.COMPLETED),
        "in_progress_courses": sum(1 for record in records if record.status == LearningRecord.Status.IN_PROGRESS),
        "records": [serialize_learning_record(record) for record in records],
    }


def serialize_exam_result(result: ExamResult) -> dict:
    return {
        "id": result.id,
        "exam_title": result.exam_title,
        "category": result.category,
        "score_percent": result.score_percent,
        "passed": result.passed,
        "attempt_number": result.attempt_number,
        "taken_at": result.taken_at.isoformat(),
    }


def serialize_exam_results_summary(user: User) -> dict:
    results = list(ExamResult.objects.filter(student=user).order_by("-taken_at", "exam_title", "id"))
    average_score = None
    if results:
        average_score = round(sum(result.score_percent for result in results) / len(results), 1)

    return {
        "student_id": user.id,
        "total_results": len(results),
        "passed_results": sum(1 for result in results if result.passed),
        "average_score": average_score,
        "results": [serialize_exam_result(result) for result in results],
    }


def build_candidate_strengths(user: User) -> list[str]:
    strengths: list[str] = []
    skill_names = list(
        StudentSkill.objects.filter(student=user)
        .select_related("skill")
        .order_by("skill__name")
        .values_list("skill__name", flat=True)
    )
    profile = get_student_profile(user)

    if skill_names:
        strengths.append(f"Skills shared: {', '.join(skill_names[:3])}")
    if profile.japanese_level:
        strengths.append(f"Japanese level: {profile.japanese_level}")
    if profile.english_level:
        strengths.append(f"English level: {profile.english_level}")

    return strengths[:3]


def build_candidate_gaps(user: User) -> list[str]:
    gaps: list[str] = []
    profile = get_student_profile(user)
    has_skills = StudentSkill.objects.filter(student=user).exists()

    if not has_skills:
        gaps.append("No skills shared yet.")
    if not profile.desired_job_type:
        gaps.append("Desired job type is not set.")
    if not profile.desired_work_location:
        gaps.append("Desired work location is not set.")

    return gaps[:3]


def visibility_state(is_visible: bool) -> str:
    return "visible" if is_visible else "hidden"


def hidden_restrictions(message: str) -> list[str]:
    return [message]


def serialize_candidate_note(note: CandidateNote) -> dict:
    return {
        "id": note.id,
        "author_name": note.author.full_name,
        "author_email": note.author.email,
        "body": note.body,
        "created_at": note.created_at.isoformat(),
    }


def serialize_candidate_shortlist(shortlist: CandidateShortlist | None) -> dict | None:
    if shortlist is None:
        return None

    return {
        "id": shortlist.id,
        "created_at": shortlist.created_at.isoformat(),
        "created_by_name": shortlist.created_by.full_name,
    }


def serialize_interview_event(event: InterviewEvent) -> dict:
    return {
        "id": event.id,
        "event_type": event.event_type,
        "description": event.description,
        "actor_name": event.actor.full_name if event.actor else None,
        "actor_role": event.actor.role if event.actor else None,
        "created_at": event.created_at.isoformat(),
    }


def serialize_interview_availability(availability: InterviewAvailability) -> dict:
    return {
        "id": availability.id,
        "submitted_by_name": availability.submitted_by.full_name,
        "submitted_by_role": availability.submitted_by.role,
        "start_at": availability.start_at.isoformat(),
        "end_at": availability.end_at.isoformat(),
        "note": availability.note,
        "created_at": availability.created_at.isoformat(),
    }


def serialize_interview(interview: Interview, *, include_detail: bool = False) -> dict:
    data = {
        "id": interview.id,
        "candidate_access_id": interview.candidate_access_id,
        "student_id": interview.student_id,
        "student_name": interview.student.full_name,
        "company_id": interview.company_id,
        "purpose": interview.purpose,
        "role_context": interview.role_context,
        "status": interview.status,
        "scheduled_start": interview.scheduled_start.isoformat() if interview.scheduled_start else None,
        "scheduled_end": interview.scheduled_end.isoformat() if interview.scheduled_end else None,
        "confirmed_at": interview.confirmed_at.isoformat() if interview.confirmed_at else None,
        "cancelled_at": interview.cancelled_at.isoformat() if interview.cancelled_at else None,
        "completed_at": interview.completed_at.isoformat() if interview.completed_at else None,
        "meeting_provider": interview.meeting_provider or None,
        "meeting_url": interview.meeting_url or None,
        "created_at": interview.created_at.isoformat(),
        "updated_at": interview.updated_at.isoformat(),
    }
    if include_detail:
        data["availabilities"] = [serialize_interview_availability(item) for item in interview.availabilities.all()]
        data["history"] = [serialize_interview_event(item) for item in interview.events.all()]
    return data


def create_interview_event(interview: Interview, actor: User | None, event_type: str, description: str) -> InterviewEvent:
    event = InterviewEvent.objects.create(
        interview=interview,
        actor=actor,
        event_type=event_type,
        description=description,
    )
    emit_interview_event_notifications(event)
    return event


def serialize_notification(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "notification_type": notification.notification_type,
        "title": notification.title,
        "message": notification.message,
        "link": notification.link,
        "actor_name": notification.actor.full_name if notification.actor else None,
        "actor_role": notification.actor.role if notification.actor else None,
        "read_at": notification.read_at.isoformat() if notification.read_at else None,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
    }


def recent_notifications_for_user(user: User, *, limit: int = 5) -> list[dict]:
    notifications = list(
        Notification.objects.filter(recipient=user)
        .select_related("actor")
        .order_by("-created_at", "-id")[:limit]
    )
    return [serialize_notification(notification) for notification in notifications]


def roadmap_title_for_record(record: LearningRecord) -> str:
    if record.category.strip():
        return f"{record.category.replace('_', ' ').title()} roadmap"
    return "Current roadmap"


def roadmap_state_for_learning_record(record: LearningRecord) -> str:
    if record.status == LearningRecord.Status.COMPLETED:
        return "completed"
    if record.status == LearningRecord.Status.IN_PROGRESS:
        return "in_progress"
    return "not_started"


def derive_student_level(*, completed_topics: int, skill_count: int, exam_average: float | None) -> str:
    if completed_topics >= 5 or (exam_average is not None and exam_average >= 90 and skill_count >= 3):
        return "Advanced"
    if completed_topics >= 2 or skill_count >= 2 or (exam_average is not None and exam_average >= 75):
        return "Intermediate"
    if completed_topics >= 1 or skill_count >= 1:
        return "Beginner"
    return "Getting started"


def build_student_dashboard_roadmap_nodes(
    *,
    learning_records: list[LearningRecord],
    completed_courses: int,
    passed_results: int,
    skill_count: int,
    profile_complete: bool,
) -> list[dict]:
    nodes: list[dict] = []

    preview_records = learning_records[:3]
    for record in preview_records:
        nodes.append(
            {
                "id": f"topic-{record.id}",
                "title": record.course_title,
                "subtitle": roadmap_title_for_record(record),
                "state": roadmap_state_for_learning_record(record),
                "progress_percent": 100 if record.status == LearningRecord.Status.COMPLETED else record.progress_percent,
                "cta_href": "/student/learning",
                "is_current": False,
            }
        )

    exam_state = "locked"
    if completed_courses > 0:
        exam_state = "completed" if passed_results >= completed_courses else "exam_required"
    nodes.append(
        {
            "id": "validation-exam",
            "title": "Validation exam",
            "subtitle": "Score 90% or higher to unlock the next topic",
            "state": exam_state,
            "progress_percent": 100 if exam_state == "completed" else None,
            "cta_href": "/student/exams",
            "is_current": False,
        }
    )

    skills_state = "locked"
    if passed_results > 0:
        if skill_count == 0:
            skills_state = "not_started"
        else:
            skills_state = "completed" if profile_complete else "in_progress"
    nodes.append(
        {
            "id": "skill-readiness",
            "title": "Skill readiness",
            "subtitle": "Keep your validated skill profile ready for hiring",
            "state": skills_state,
            "progress_percent": 100 if skills_state == "completed" else None,
            "cta_href": "/student/skills",
            "is_current": False,
        }
    )

    current_assigned = False
    for node in nodes:
        if node["state"] in {"in_progress", "not_started", "exam_required"} and not current_assigned:
            node["is_current"] = True
            current_assigned = True

    if not current_assigned and nodes:
        nodes[-1]["is_current"] = True

    return nodes


def serialize_admin_user_summary(user: User) -> dict:
    return {
        "user_id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role,
        "company_name": user.company.name if user.company else None,
        "date_joined": user.date_joined.isoformat(),
    }


def serialize_admin_interview_summary(interview: Interview) -> dict:
    return {
        "id": interview.id,
        "company_name": interview.company.name,
        "student_name": interview.student.full_name,
        "status": interview.status,
        "updated_at": interview.updated_at.isoformat(),
        "scheduled_start": interview.scheduled_start.isoformat() if interview.scheduled_start else None,
        "scheduled_end": interview.scheduled_end.isoformat() if interview.scheduled_end else None,
    }


def serialize_admin_user(user: User) -> dict:
    return {
        "user_id": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role,
        "company_id": user.company_id,
        "company_name": user.company.name if user.company else None,
        "is_active": user.is_active,
        "date_joined": user.date_joined.isoformat(),
    }


def serialize_admin_company(company: Company) -> dict:
    return {
        "company_id": company.id,
        "name": company.name,
        "description": company.description,
        "is_active": company.is_active,
        "user_count": company.users.count(),
        "created_at": company.created_at.isoformat(),
        "updated_at": company.updated_at.isoformat(),
    }


def serialize_vacancy(vacancy: Vacancy) -> dict:
    return {
        "vacancy_id": vacancy.id,
        "company_id": vacancy.company_id,
        "company_name": vacancy.company.name,
        "title": vacancy.title,
        "description": vacancy.description,
        "employment_type": vacancy.employment_type,
        "experience_level": vacancy.experience_level,
        "location": vacancy.location,
        "status": vacancy.status,
        "created_by_name": vacancy.created_by.full_name,
        "created_at": vacancy.created_at.isoformat(),
        "updated_at": vacancy.updated_at.isoformat(),
    }


def serialize_company_candidate(access: CandidateReviewAccess) -> dict:
    settings = get_visibility_settings(access.student)
    profile_visible = settings.share_profile_preview
    student_profile = get_student_profile(access.student)
    shortlist_entry = getattr(access, "shortlist_entry", None)
    notes_count = getattr(access, "notes_count", 0)
    top_skills = list(
        StudentSkill.objects.filter(student=access.student)
        .select_related("skill")
        .order_by("skill__name")
        .values_list("skill__name", flat=True)[:3]
    )

    return {
        "candidate_access_id": access.id,
        "source": access.source,
        "student_id": access.student_id,
        "display_name": access.student.full_name if profile_visible else "Private candidate",
        "desired_job_type": student_profile.desired_job_type if profile_visible else "",
        "desired_work_location": student_profile.desired_work_location if profile_visible else "",
        "top_skills": top_skills if profile_visible else [],
        "strengths": build_candidate_strengths(access.student) if profile_visible else [],
        "gaps": build_candidate_gaps(access.student) if profile_visible else [],
        "visibility": {
            "profile_preview": visibility_state(settings.share_profile_preview),
            "learning_record": visibility_state(settings.share_learning_record),
            "exam_results": visibility_state(settings.share_exam_results),
        },
        "is_shortlisted": shortlist_entry is not None,
        "notes_count": notes_count,
        "shortlist": serialize_candidate_shortlist(shortlist_entry),
        "updated_at": access.updated_at.isoformat(),
    }


def company_candidate_score_percent(access: CandidateReviewAccess) -> float | None:
    settings = get_visibility_settings(access.student)
    if not settings.share_exam_results:
        return None

    results = list(ExamResult.objects.filter(student=access.student).only("score_percent"))
    if not results:
        return None

    return round(sum(result.score_percent for result in results) / len(results), 1)


def serialize_company_dashboard_candidate(access: CandidateReviewAccess) -> dict:
    candidate = serialize_company_candidate(access)
    return {
        "candidate_access_id": access.id,
        "display_name": candidate["display_name"],
        "source": access.get_source_display(),
        "score_percent": company_candidate_score_percent(access),
        "top_skills": candidate["top_skills"],
        "is_shortlisted": candidate["is_shortlisted"],
        "cta_label": "Review shortlist" if candidate["is_shortlisted"] else "Review candidate",
        "cta_href": f"/company/candidates/{access.id}",
    }


def serialize_company_dashboard_job(vacancy: Vacancy) -> dict:
    return {
        "vacancy_id": vacancy.id,
        "title": vacancy.title,
        "status": vacancy.status,
        "location": vacancy.location,
        "cta_label": "Open vacancy",
        "cta_href": "/company/vacancies",
    }


def interview_timing_label(interview: Interview) -> str:
    if interview.scheduled_start and interview.scheduled_end:
        return f"{interview.scheduled_start.isoformat()} to {interview.scheduled_end.isoformat()}"
    if interview.status == Interview.Status.REQUESTED:
        return "Waiting for availability"
    if interview.status == Interview.Status.RESCHEDULED:
        return "Reschedule requested"
    if interview.status == Interview.Status.COMPLETED:
        return "Completed"
    if interview.status == Interview.Status.CANCELLED:
        return "Cancelled"
    return "Schedule pending"


def serialize_company_dashboard_interview(interview: Interview) -> dict:
    return {
        "id": interview.id,
        "student_name": interview.student.full_name,
        "purpose": interview.purpose,
        "status": interview.status,
        "timing_label": interview_timing_label(interview),
        "cta_label": "View interview",
        "cta_href": f"/company/interviews/{interview.id}",
    }


def get_candidate_review_access(user: User, candidate_access_id: int) -> CandidateReviewAccess:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    candidate_access = (
        CandidateReviewAccess.objects.filter(company=company, is_active=True, pk=candidate_access_id)
        .select_related("student", "company")
        .first()
    )
    if candidate_access is None:
        raise ValidationError({"candidate_access_id": ["Approved candidate context was not found."]})

    return candidate_access


def candidate_context_allows_interview(candidate_access: CandidateReviewAccess) -> bool:
    return candidate_access.source in {CandidateReviewAccess.Source.APPLICATION, CandidateReviewAccess.Source.SHORTLIST} or hasattr(
        candidate_access, "shortlist_entry"
    )


def get_interview_for_company(user: User, interview_id: int) -> Interview:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    interview = (
        Interview.objects.filter(company=company, pk=interview_id)
        .select_related("student", "company", "candidate_access", "requested_by")
        .prefetch_related("availabilities__submitted_by", "events__actor")
        .first()
    )
    if interview is None:
        raise ValidationError({"interview_id": ["Interview was not found for this company context."]})
    return interview


def get_interview_for_student(user: User, interview_id: int) -> Interview:
    interview = (
        Interview.objects.filter(student=user, pk=interview_id)
        .select_related("student", "company", "candidate_access", "requested_by")
        .prefetch_related("availabilities__submitted_by", "events__actor")
        .first()
    )
    if interview is None:
        raise ValidationError({"interview_id": ["Interview was not found for this student context."]})
    return interview


def get_interview_for_participant(user: User, interview_id: int) -> Interview:
    if user.role == User.Role.COMPANY:
        return get_interview_for_company(user, interview_id)
    if user.role == User.Role.STUDENT:
        return get_interview_for_student(user, interview_id)
    raise ValidationError({"role": ["Only company and student users can access interview workflows."]})


def validate_student_profile_payload(payload: dict) -> dict:
    cleaned = {
        "name": str(payload.get("name", "")).strip(),
        "desired_job_type": str(payload.get("desired_job_type", "")).strip(),
        "desired_work_location": str(payload.get("desired_work_location", "")).strip(),
        "japanese_level": str(payload.get("japanese_level", "")).strip(),
        "english_level": str(payload.get("english_level", "")).strip(),
    }

    errors = {}
    if not cleaned["name"]:
        errors["name"] = ["This field is required."]

    if errors:
        raise ValidationError(errors)

    return cleaned


def validate_company_profile_payload(payload: dict) -> dict:
    cleaned = {
        "name": str(payload.get("name", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
    }
    if not cleaned["name"]:
        raise ValidationError({"name": ["This field is required."]})
    return cleaned


def validate_student_skill_payload(payload: dict) -> dict:
    cleaned_proficiency = str(payload.get("proficiency_level", "")).strip().lower()
    raw_skill_id = payload.get("skill_id")
    errors = {}
    skill = None

    if raw_skill_id in (None, ""):
        errors["skill_id"] = ["This field is required."]
    else:
        try:
            skill = Skill.objects.get(pk=int(raw_skill_id))
        except (TypeError, ValueError):
            errors["skill_id"] = ["A valid skill_id is required."]
        except Skill.DoesNotExist:
            errors["skill_id"] = ["Selected skill does not exist."]

    if not cleaned_proficiency:
        errors["proficiency_level"] = ["This field is required."]
    elif cleaned_proficiency not in StudentSkill.Proficiency.values:
        errors["proficiency_level"] = [
            f"Proficiency level must be one of: {', '.join(StudentSkill.Proficiency.values)}."
        ]

    if errors:
        raise ValidationError(errors)

    return {
        "skill": skill,
        "proficiency_level": cleaned_proficiency,
    }


def validate_student_privacy_settings_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    for field in ("share_profile_preview", "share_learning_record", "share_exam_results"):
        value = payload.get(field)
        if not isinstance(value, bool):
            errors[field] = ["This field must be a boolean."]
        else:
            cleaned[field] = value

    if errors:
        raise ValidationError(errors)

    return cleaned


def validate_candidate_note_payload(payload: dict) -> dict:
    body = str(payload.get("body", "")).strip()
    if not body:
        raise ValidationError({"body": ["This field is required."]})
    return {"body": body}


def validate_interview_request_payload(payload: dict) -> dict:
    purpose = str(payload.get("purpose", "")).strip()
    role_context = str(payload.get("role_context", "")).strip()
    if not purpose:
        raise ValidationError({"purpose": ["This field is required."]})
    return {
        "purpose": purpose,
        "role_context": role_context,
    }


def validate_interview_availability_payload(payload: dict) -> dict:
    start_at = parse_datetime(str(payload.get("start_at", "")).strip())
    end_at = parse_datetime(str(payload.get("end_at", "")).strip())
    note = str(payload.get("note", "")).strip()
    errors = {}
    if start_at is None:
        errors["start_at"] = ["A valid ISO datetime is required."]
    if end_at is None:
        errors["end_at"] = ["A valid ISO datetime is required."]
    if errors:
        raise ValidationError(errors)
    if timezone.is_naive(start_at):
        start_at = timezone.make_aware(start_at, timezone.get_current_timezone())
    if timezone.is_naive(end_at):
        end_at = timezone.make_aware(end_at, timezone.get_current_timezone())
    if start_at >= end_at:
        raise ValidationError({"end_at": ["Availability end time must be after the start time."]})
    return {
        "start_at": start_at,
        "end_at": end_at,
        "note": note,
    }


def validate_interview_confirmation_payload(payload: dict, interview: Interview) -> InterviewAvailability:
    raw_availability_id = payload.get("availability_id")
    if raw_availability_id in (None, ""):
        raise ValidationError({"availability_id": ["This field is required."]})

    try:
        availability_id = int(raw_availability_id)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"availability_id": ["A valid availability_id is required."]}) from exc

    availability = (
        InterviewAvailability.objects.filter(interview=interview, pk=availability_id)
        .select_related("submitted_by")
        .first()
    )
    if availability is None:
        raise ValidationError({"availability_id": ["Selected availability does not belong to this interview."]})
    return availability


def validate_interview_reschedule_payload(payload: dict) -> dict:
    reason = str(payload.get("reason", "")).strip()
    if not reason:
        raise ValidationError({"reason": ["This field is required."]})
    return {"reason": reason}


def validate_interview_cancel_payload(payload: dict) -> dict:
    reason = str(payload.get("reason", "")).strip()
    if not reason:
        raise ValidationError({"reason": ["This field is required."]})
    return {"reason": reason}


def validate_interview_complete_payload(payload: dict) -> dict:
    summary = str(payload.get("summary", "")).strip()
    if not summary:
        raise ValidationError({"summary": ["This field is required."]})
    return {"summary": summary}


def validate_meeting_link_payload(payload: dict) -> dict:
    provider = str(payload.get("meeting_provider", "")).strip()
    meeting_url = str(payload.get("meeting_url", "")).strip()

    if provider not in Interview.MeetingProvider.values:
        raise ValidationError(
            {
                "meeting_provider": [
                    f"Meeting provider must be one of: {', '.join(Interview.MeetingProvider.values)}."
                ]
            }
        )
    if not meeting_url:
        raise ValidationError({"meeting_url": ["This field is required."]})

    parsed = urlparse(meeting_url)
    if parsed.scheme != "https":
        raise ValidationError({"meeting_url": ["Meeting URL must use https."]})
    if not parsed.netloc:
        raise ValidationError({"meeting_url": ["Meeting URL must include a host."]})

    host = parsed.netloc.lower()
    path = parsed.path or ""
    allowed = False
    if provider == Interview.MeetingProvider.ZOOM:
        allowed = host.endswith(".zoom.us") and path.startswith(("/j/", "/wc/"))
    elif provider == Interview.MeetingProvider.GOOGLE_MEET:
        allowed = host == "meet.google.com" and len(path.strip("/")) >= 3
    elif provider == Interview.MeetingProvider.TEAMS:
        allowed = host in {"teams.microsoft.com", "teams.live.com"} and bool(path.strip("/"))
    elif provider == Interview.MeetingProvider.CUSTOM:
        allowed = True

    if not allowed:
        raise ValidationError({"meeting_url": ["Meeting URL does not match the selected provider format."]})

    return {
        "meeting_provider": provider,
        "meeting_url": meeting_url,
    }


def validate_admin_company_payload(payload: dict) -> dict:
    name = str(payload.get("name", "")).strip()
    description = str(payload.get("description", "")).strip()
    raw_is_active = payload.get("is_active", True)

    errors = {}
    if not name:
        errors["name"] = ["This field is required."]
    if not isinstance(raw_is_active, bool):
        errors["is_active"] = ["This field must be a boolean."]

    if errors:
        raise ValidationError(errors)

    return {
        "name": name,
        "description": description,
        "is_active": raw_is_active,
    }


def validate_vacancy_payload(payload: dict) -> dict:
    cleaned = {
        "title": str(payload.get("title", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
        "employment_type": str(payload.get("employment_type", "")).strip(),
        "experience_level": str(payload.get("experience_level", "")).strip(),
        "location": str(payload.get("location", "")).strip(),
        "status": str(payload.get("status", Vacancy.Status.DRAFT)).strip(),
    }
    errors = {}
    for field in ("title", "description", "employment_type", "experience_level", "location"):
        if not cleaned[field]:
            errors[field] = ["This field is required."]

    if cleaned["status"] not in Vacancy.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(Vacancy.Status.values)}."]

    if errors:
        raise ValidationError(errors)

    return cleaned


def validate_admin_user_payload(payload: dict, *, creating: bool) -> dict:
    cleaned = {
        "email": str(payload.get("email", "")).strip().lower(),
        "name": str(payload.get("name", "")).strip(),
        "role": str(payload.get("role", "")).strip(),
        "password": str(payload.get("password", "")),
    }
    raw_company_id = payload.get("company_id")
    raw_is_active = payload.get("is_active", True)
    errors = {}

    if not cleaned["email"]:
        errors["email"] = ["This field is required."]
    if not cleaned["name"]:
        errors["name"] = ["This field is required."]
    if cleaned["role"] not in User.Role.values:
        errors["role"] = [f"Role must be one of: {', '.join(User.Role.values)}."]
    if creating and not cleaned["password"]:
        errors["password"] = ["This field is required."]
    if not isinstance(raw_is_active, bool):
        errors["is_active"] = ["This field must be a boolean."]

    company = None
    if cleaned["role"] == User.Role.COMPANY:
        if raw_company_id in (None, ""):
            errors["company_id"] = ["Company users must have an associated company."]
        else:
            try:
                company = Company.objects.get(pk=int(raw_company_id))
            except (TypeError, ValueError):
                errors["company_id"] = ["A valid company_id is required."]
            except Company.DoesNotExist:
                errors["company_id"] = ["Selected company does not exist."]
    elif raw_company_id not in (None, ""):
        errors["company_id"] = ["Only company users can have an associated company."]

    if errors:
        raise ValidationError(errors)

    return {
        "email": cleaned["email"],
        "name": cleaned["name"],
        "role": cleaned["role"],
        "password": cleaned["password"],
        "company": company,
        "is_active": raw_is_active,
    }


def ensure_admin_user_update_allowed(actor: User, target: User, payload: dict) -> None:
    if actor.pk != target.pk:
        return

    if payload["role"] != User.Role.ADMIN:
        raise ValidationError({"role": ["Admins cannot remove their own admin role."]})
    if payload["is_active"] is False:
        raise ValidationError({"is_active": ["Admins cannot deactivate their own account."]})


def get_company_vacancy(user: User, vacancy_id: int) -> Vacancy:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    vacancy = (
        Vacancy.objects.filter(company=company, pk=vacancy_id)
        .select_related("company", "created_by")
        .first()
    )
    if vacancy is None:
        raise ValidationError({"vacancy_id": ["Vacancy was not found for this company context."]})
    return vacancy


@api_endpoint(["GET"])
def health_view(request):
    return success_response({"status": "ok", "request_id": request.request_id})


@ensure_csrf_cookie
@api_endpoint(["GET"])
def csrf_view(request):
    return success_response(csrf_response_payload(request))


@ensure_csrf_cookie
@api_endpoint(["GET"])
def session_view(request):
    if not request.user.is_authenticated:
        return success_response(
            {
                "authenticated": False,
                "user": None,
                "csrf_token": get_token(request),
            }
        )

    return success_response(
        {
            "authenticated": True,
            "user": serialize_user(request.user),
            "csrf_token": get_token(request),
        }
    )


@api_endpoint(["POST"])
def signup_view(request):
    payload = parse_json_body(request)
    validate_signup_payload(payload)
    validate_password(payload["password"])

    email = payload["email"].strip().lower()
    if User.objects.filter(email__iexact=email).exists():
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={"email": ["A user with this email already exists."]},
            status=400,
        )

    with transaction.atomic():
        company = None
        if payload["role"] == User.Role.COMPANY:
            company = Company.objects.create(name=payload["company_name"].strip())

        user = User.objects.create_user(
            email=email,
            password=payload["password"],
            full_name=payload["name"].strip(),
            role=payload["role"],
            company=company,
        )
        if payload["role"] == User.Role.STUDENT:
            StudentProfile.objects.create(user=user)

    login(request, user)
    return success_response({**serialize_user(user), "csrf_token": get_token(request)}, status=201)


@api_endpoint(["POST"])
def login_view(request):
    payload = parse_json_body(request)
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    role = payload.get("role", "")

    if not email or not password or not role:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={
                "email": ["This field is required."] if not email else [],
                "password": ["This field is required."] if not password else [],
                "role": ["This field is required."] if not role else [],
            },
            status=400,
        )

    if role not in {User.Role.STUDENT, User.Role.COMPANY, User.Role.ADMIN}:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={"role": ["Role must be one of: student, company, admin."]},
            status=400,
        )

    user = authenticate(request, email=email, password=password)
    if user is None:
        return error_response(
            request,
            "INVALID_CREDENTIALS",
            "Email or password is incorrect.",
            status=401,
        )

    if user.role != role:
        return error_response(
            request,
            "ROLE_MISMATCH",
            f"This account belongs to the {user.role} workspace. Select the correct account type and try again.",
            details={"role": [f"This account belongs to the {user.role} workspace."]},
            status=403,
        )

    login(request, user)
    return success_response({**serialize_user(user), "csrf_token": get_token(request)})


@api_endpoint(["POST"], authentication_required=True)
def logout_view(request):
    logout(request)
    return success_response({"message": "Logged out successfully."})


@api_endpoint(["POST"], authentication_required=True)
def password_change_view(request):
    payload = parse_json_body(request)
    current_password = payload.get("current_password", "")
    new_password = payload.get("new_password", "")

    if not current_password or not new_password:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={
                "current_password": ["This field is required."] if not current_password else [],
                "new_password": ["This field is required."] if not new_password else [],
            },
            status=400,
        )

    if not request.user.check_password(current_password):
        return error_response(
            request,
            "INVALID_CREDENTIALS",
            "Current password is incorrect.",
            details={"current_password": ["Current password is incorrect."]},
            status=400,
        )

    validate_password(new_password, request.user)
    request.user.set_password(new_password)
    request.user.save(update_fields=["password"])
    update_session_auth_hash(request, request.user)

    return success_response({"message": "Password updated successfully."})


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_profile_view(request):
    if request.method == "GET":
        return success_response(serialize_student_profile(request.user))

    payload = validate_student_profile_payload(parse_json_body(request))
    profile = get_student_profile(request.user)

    request.user.full_name = payload["name"]
    request.user.save(update_fields=["full_name"])
    profile.desired_job_type = payload["desired_job_type"]
    profile.desired_work_location = payload["desired_work_location"]
    profile.japanese_level = payload["japanese_level"]
    profile.english_level = payload["english_level"]
    profile.save(
        update_fields=[
            "desired_job_type",
            "desired_work_location",
            "japanese_level",
            "english_level",
            "updated_at",
        ]
    )

    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.COMPANY])
def company_profile_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if request.method == "GET":
        return success_response(serialize_company_profile(request.user))

    payload = validate_company_profile_payload(parse_json_body(request))
    company.name = payload["name"]
    company.description = payload["description"]
    company.full_clean()
    company.save(update_fields=["name", "description", "updated_at"])

    return success_response(serialize_company_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_vacancies_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if request.method == "GET":
        vacancies = list(
            Vacancy.objects.filter(company=company)
            .select_related("company", "created_by")
            .order_by("-updated_at", "-id")
        )
        return success_response({"vacancies": [serialize_vacancy(vacancy) for vacancy in vacancies]})

    payload = validate_vacancy_payload(parse_json_body(request))
    vacancy = Vacancy(
        company=company,
        created_by=request.user,
        title=payload["title"],
        description=payload["description"],
        employment_type=payload["employment_type"],
        experience_level=payload["experience_level"],
        location=payload["location"],
        status=payload["status"],
    )
    vacancy.full_clean()
    vacancy.save()
    return success_response(serialize_vacancy(vacancy), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_vacancy_detail_view(request, vacancy_id: int):
    vacancy = get_company_vacancy(request.user, vacancy_id)

    if request.method == "DELETE":
        vacancy.status = Vacancy.Status.INACTIVE
        vacancy.full_clean()
        vacancy.save(update_fields=["status", "updated_at"])
        return success_response(serialize_vacancy(vacancy))

    payload = validate_vacancy_payload(parse_json_body(request))
    vacancy.title = payload["title"]
    vacancy.description = payload["description"]
    vacancy.employment_type = payload["employment_type"]
    vacancy.experience_level = payload["experience_level"]
    vacancy.location = payload["location"]
    vacancy.status = payload["status"]
    vacancy.full_clean()
    vacancy.save(
        update_fields=["title", "description", "employment_type", "experience_level", "location", "status", "updated_at"]
    )
    return success_response(serialize_vacancy(vacancy))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skills_view(request):
    if request.method == "GET":
        return success_response(serialize_student_skills(request.user))

    payload = validate_student_skill_payload(parse_json_body(request))
    if StudentSkill.objects.filter(student=request.user, skill=payload["skill"]).exists():
        raise ValidationError({"skill_id": ["This skill is already added to your profile."]})

    student_skill = StudentSkill(
        student=request.user,
        skill=payload["skill"],
        proficiency_level=payload["proficiency_level"],
    )
    student_skill.full_clean()
    student_skill.save()

    return success_response(serialize_student_skills(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skill_detail_view(request, student_skill_id: int):
    student_skill = (
        StudentSkill.objects.filter(student=request.user, pk=student_skill_id)
        .select_related("skill")
        .first()
    )
    if student_skill is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested student skill was not found.",
            details={"student_skill_id": [str(student_skill_id)]},
            status=404,
        )

    if request.method == "DELETE":
        student_skill.delete()
        return success_response(serialize_student_skills(request.user))

    payload = validate_student_skill_payload(parse_json_body(request))
    duplicate_skill = StudentSkill.objects.filter(student=request.user, skill=payload["skill"]).exclude(
        pk=student_skill.pk
    )
    if duplicate_skill.exists():
        raise ValidationError({"skill_id": ["This skill is already added to your profile."]})

    student_skill.skill = payload["skill"]
    student_skill.proficiency_level = payload["proficiency_level"]
    student_skill.full_clean()
    student_skill.save(update_fields=["skill", "proficiency_level", "updated_at"])

    return success_response(serialize_student_skills(request.user))


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_privacy_settings_view(request):
    settings = get_visibility_settings(request.user)
    ensure_visibility_event_exists(request.user, settings)

    if request.method == "GET":
        return success_response(serialize_student_privacy_settings(request.user))

    payload = validate_student_privacy_settings_payload(parse_json_body(request))
    settings.share_profile_preview = payload["share_profile_preview"]
    settings.share_learning_record = payload["share_learning_record"]
    settings.share_exam_results = payload["share_exam_results"]
    settings.full_clean()
    settings.save(
        update_fields=[
            "share_profile_preview",
            "share_learning_record",
            "share_exam_results",
            "updated_at",
        ]
    )
    record_visibility_event(request.user, settings)

    return success_response(serialize_student_privacy_settings(request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_learning_summary_view(request):
    return success_response(serialize_learning_summary(request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_exam_results_view(request):
    return success_response(serialize_exam_results_summary(request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidates_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    candidates = list(
        CandidateReviewAccess.objects.filter(company=company, is_active=True)
        .select_related("student", "company", "shortlist_entry", "shortlist_entry__created_by")
        .annotate(notes_count=Count("notes"))
        .order_by("-updated_at", "-id")
    )
    return success_response(
        {
            "company_id": company.id,
            "candidate_count": len(candidates),
            "candidates": [serialize_company_candidate(candidate) for candidate in candidates],
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_shortlist_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    shortlists = list(
        CandidateShortlist.objects.filter(company=company)
        .select_related("candidate_access", "created_by", "student")
        .order_by("-updated_at", "-id")
    )
    return success_response(
        {
            "company_id": company.id,
            "shortlist_count": len(shortlists),
            "shortlists": [
                {
                    "candidate_access_id": shortlist.candidate_access_id,
                    "student_id": shortlist.student_id,
                    "display_name": shortlist.student.full_name,
                    "created_at": shortlist.created_at.isoformat(),
                    "created_by_name": shortlist.created_by.full_name,
                    "source": shortlist.candidate_access.source,
                }
                for shortlist in shortlists
            ],
        }
    )


@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_shortlist_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    shortlist_entry = CandidateShortlist.objects.filter(candidate_access=candidate_access).first()
    if request.method == "DELETE":
        if shortlist_entry is not None:
            shortlist_entry.delete()
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "is_shortlisted": False,
                "shortlist": None,
            }
        )

    created = False
    if shortlist_entry is None:
        shortlist_entry = CandidateShortlist(
            candidate_access=candidate_access,
            company=company,
            student=candidate_access.student,
            created_by=request.user,
        )
        shortlist_entry.full_clean()
        shortlist_entry.save()
        created = True

    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "is_shortlisted": True,
            "shortlist": serialize_candidate_shortlist(shortlist_entry),
        },
        status=201 if created else 200,
    )


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_notes_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if request.method == "GET":
        notes = list(
            CandidateNote.objects.filter(candidate_access=candidate_access)
            .select_related("author")
            .order_by("-created_at", "-id")
        )
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "notes": [serialize_candidate_note(note) for note in notes],
            }
        )

    payload = validate_candidate_note_payload(parse_json_body(request))
    note = CandidateNote(
        candidate_access=candidate_access,
        company=company,
        student=candidate_access.student,
        author=request.user,
        body=payload["body"],
    )
    note.full_clean()
    note.save()

    notes = list(
        CandidateNote.objects.filter(candidate_access=candidate_access)
        .select_related("author")
        .order_by("-created_at", "-id")
    )
    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "notes": [serialize_candidate_note(note) for note in notes],
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_preview_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    visibility = get_visibility_settings(candidate_access.student)
    shortlist_entry = CandidateShortlist.objects.filter(candidate_access=candidate_access).select_related("created_by").first()
    notes = list(
        CandidateNote.objects.filter(candidate_access=candidate_access)
        .select_related("author")
        .order_by("-created_at", "-id")
    )

    if not visibility.share_profile_preview:
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "source": candidate_access.source,
                "visibility": "hidden",
                "student": None,
                "shortlist": serialize_candidate_shortlist(shortlist_entry),
                "notes": [serialize_candidate_note(note) for note in notes],
                "restrictions": hidden_restrictions("Student profile preview is hidden by privacy settings."),
            }
        )

    student_profile = get_student_profile(candidate_access.student)
    student_skills = list(
        StudentSkill.objects.filter(student=candidate_access.student)
        .select_related("skill")
        .order_by("skill__name")
    )
    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "source": candidate_access.source,
            "visibility": "visible",
            "student": {
                "student_id": candidate_access.student_id,
                "name": candidate_access.student.full_name,
                "desired_job_type": student_profile.desired_job_type,
                "desired_work_location": student_profile.desired_work_location,
                "japanese_level": student_profile.japanese_level,
                "english_level": student_profile.english_level,
                "skills": [serialize_student_skill(student_skill) for student_skill in student_skills],
            },
            "shortlist": serialize_candidate_shortlist(shortlist_entry),
            "notes": [serialize_candidate_note(note) for note in notes],
            "restrictions": [],
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_learning_record_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    visibility = get_visibility_settings(candidate_access.student)
    if not visibility.share_learning_record:
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "visibility": "hidden",
                "summary": {
                    "student_id": candidate_access.student_id,
                    "total_courses": 0,
                    "completed_courses": 0,
                    "in_progress_courses": 0,
                    "records": [],
                },
                "restrictions": hidden_restrictions("Student learning record is hidden by privacy settings."),
            }
        )

    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "visibility": "visible",
            "summary": serialize_learning_summary(candidate_access.student),
            "restrictions": [],
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_exam_results_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    visibility = get_visibility_settings(candidate_access.student)
    if not visibility.share_exam_results:
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "visibility": "hidden",
                "summary": {
                    "student_id": candidate_access.student_id,
                    "total_results": 0,
                    "passed_results": 0,
                    "average_score": None,
                    "results": [],
                },
                "restrictions": hidden_restrictions("Student exam results are hidden until explicit sharing is allowed."),
            }
        )

    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "visibility": "visible",
            "summary": serialize_exam_results_summary(candidate_access.student),
            "restrictions": [],
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_interviews_view(request):
    interviews = list(
        Interview.objects.filter(student=request.user)
        .select_related("student", "company", "candidate_access", "requested_by")
        .order_by("-updated_at", "-id")
    )
    return success_response({"interviews": [serialize_interview(interview) for interview in interviews]})


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_interviews_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    interviews = list(
        Interview.objects.filter(company=company)
        .select_related("student", "company", "candidate_access", "requested_by")
        .order_by("-updated_at", "-id")
    )
    return success_response({"interviews": [serialize_interview(interview) for interview in interviews]})


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_interviews_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    interviews = list(
        Interview.objects.filter(candidate_access=candidate_access)
        .select_related("student", "company", "candidate_access", "requested_by")
        .order_by("-updated_at", "-id")
    )

    if request.method == "GET":
        return success_response({"candidate_access_id": candidate_access.id, "interviews": [serialize_interview(item) for item in interviews]})

    if not candidate_context_allows_interview(candidate_access):
        raise ValidationError({"candidate_access_id": ["This candidate context is not eligible for interview requests yet."]})

    if Interview.objects.filter(
        candidate_access=candidate_access,
        status__in=[Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED],
    ).exists():
        raise ValidationError({"candidate_access_id": ["An active interview already exists for this candidate context."]})

    payload = validate_interview_request_payload(parse_json_body(request))
    interview = Interview(
        candidate_access=candidate_access,
        company=candidate_access.company,
        student=candidate_access.student,
        requested_by=request.user,
        purpose=payload["purpose"],
        role_context=payload["role_context"],
        status=Interview.Status.REQUESTED,
    )
    interview.full_clean()
    interview.save()
    create_interview_event(
        interview,
        request.user,
        "requested",
        "Interview requested from an approved company candidate context.",
    )

    return success_response(serialize_interview(get_interview_for_company(request.user, interview.id), include_detail=True), status=201)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT, User.Role.COMPANY])
def interview_detail_view(request, interview_id: int):
    interview = get_interview_for_participant(request.user, interview_id)
    return success_response(serialize_interview(interview, include_detail=True))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT, User.Role.COMPANY])
def interview_availability_view(request, interview_id: int):
    interview = get_interview_for_participant(request.user, interview_id)
    if interview.status not in {Interview.Status.REQUESTED, Interview.Status.RESCHEDULED}:
        raise ValidationError({"status": ["Availability can only be submitted while the interview is awaiting scheduling."]})

    payload = validate_interview_availability_payload(parse_json_body(request))
    availability = InterviewAvailability(
        interview=interview,
        submitted_by=request.user,
        start_at=payload["start_at"],
        end_at=payload["end_at"],
        note=payload["note"],
    )
    availability.full_clean()
    availability.save()
    create_interview_event(
        interview,
        request.user,
        "availability_submitted",
        f"Availability submitted for {availability.start_at.isoformat()} to {availability.end_at.isoformat()}.",
    )
    interview.refresh_from_db()
    return success_response(serialize_interview(get_interview_for_participant(request.user, interview.id), include_detail=True), status=201)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_interview_confirm_view(request, interview_id: int):
    interview = get_interview_for_company(request.user, interview_id)
    if interview.status not in {Interview.Status.REQUESTED, Interview.Status.RESCHEDULED}:
        raise ValidationError({"status": ["Only requested or rescheduled interviews can be confirmed."]})

    availability = validate_interview_confirmation_payload(parse_json_body(request), interview)
    interview.status = Interview.Status.CONFIRMED
    interview.scheduled_start = availability.start_at
    interview.scheduled_end = availability.end_at
    interview.confirmed_at = timezone.now()
    interview.full_clean()
    interview.save(update_fields=["status", "scheduled_start", "scheduled_end", "confirmed_at", "updated_at"])
    create_interview_event(
        interview,
        request.user,
        "confirmed",
        f"Interview confirmed for {availability.start_at.isoformat()} to {availability.end_at.isoformat()}.",
    )
    return success_response(serialize_interview(get_interview_for_company(request.user, interview.id), include_detail=True))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT, User.Role.COMPANY])
def interview_reschedule_view(request, interview_id: int):
    interview = get_interview_for_participant(request.user, interview_id)
    if interview.status not in {Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED}:
        raise ValidationError({"status": ["Only active interviews can be rescheduled."]})

    payload = validate_interview_reschedule_payload(parse_json_body(request))
    previous_schedule = "no confirmed schedule"
    if interview.scheduled_start and interview.scheduled_end:
        previous_schedule = f"{interview.scheduled_start.isoformat()} to {interview.scheduled_end.isoformat()}"

    interview.status = Interview.Status.RESCHEDULED
    interview.scheduled_start = None
    interview.scheduled_end = None
    interview.confirmed_at = None
    interview.completed_at = None
    interview.meeting_provider = ""
    interview.meeting_url = ""
    interview.full_clean()
    interview.save(
        update_fields=[
            "status",
            "scheduled_start",
            "scheduled_end",
            "confirmed_at",
            "completed_at",
            "meeting_provider",
            "meeting_url",
            "updated_at",
        ]
    )
    create_interview_event(
        interview,
        request.user,
        "rescheduled",
        f"Interview reschedule requested. Previous schedule: {previous_schedule}. Reason: {payload['reason']}",
    )
    return success_response(serialize_interview(get_interview_for_participant(request.user, interview.id), include_detail=True))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT, User.Role.COMPANY])
def interview_cancel_view(request, interview_id: int):
    interview = get_interview_for_participant(request.user, interview_id)
    if interview.status in {Interview.Status.CANCELLED, Interview.Status.COMPLETED}:
        raise ValidationError({"status": ["This interview can no longer be cancelled."]})

    payload = validate_interview_cancel_payload(parse_json_body(request))
    interview.status = Interview.Status.CANCELLED
    interview.cancelled_at = timezone.now()
    interview.completed_at = None
    interview.full_clean()
    interview.save(update_fields=["status", "cancelled_at", "completed_at", "updated_at"])
    create_interview_event(
        interview,
        request.user,
        "cancelled",
        f"Interview cancelled. Reason: {payload['reason']}",
    )
    return success_response(serialize_interview(get_interview_for_participant(request.user, interview.id), include_detail=True))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT, User.Role.COMPANY])
def interview_complete_view(request, interview_id: int):
    interview = get_interview_for_participant(request.user, interview_id)
    if interview.status != Interview.Status.CONFIRMED:
        raise ValidationError({"status": ["Only confirmed interviews can be marked as completed."]})

    payload = validate_interview_complete_payload(parse_json_body(request))
    interview.status = Interview.Status.COMPLETED
    interview.completed_at = timezone.now()
    interview.full_clean()
    interview.save(update_fields=["status", "completed_at", "updated_at"])
    create_interview_event(
        interview,
        request.user,
        "completed",
        f"Interview completed. Summary: {payload['summary']}",
    )
    return success_response(serialize_interview(get_interview_for_participant(request.user, interview.id), include_detail=True))


@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.STUDENT, User.Role.COMPANY])
def interview_meeting_link_view(request, interview_id: int):
    interview = get_interview_for_participant(request.user, interview_id)
    if interview.status != Interview.Status.CONFIRMED:
        raise ValidationError({"status": ["Meeting links can only be managed for confirmed interviews."]})

    payload = validate_meeting_link_payload(parse_json_body(request))
    interview.meeting_provider = payload["meeting_provider"]
    interview.meeting_url = payload["meeting_url"]
    interview.full_clean()
    interview.save(update_fields=["meeting_provider", "meeting_url", "updated_at"])
    create_interview_event(
        interview,
        request.user,
        "meeting_link_updated",
        f"Meeting link updated for provider {interview.meeting_provider}.",
    )
    return success_response(serialize_interview(get_interview_for_participant(request.user, interview.id), include_detail=True))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_view(request):
    profile = serialize_student_profile(request.user)
    skills = serialize_student_skills(request.user)
    learning = serialize_learning_summary(request.user)
    exams = serialize_exam_results_summary(request.user)
    learning_records = list(
        LearningRecord.objects.filter(student=request.user)
        .order_by("created_at", "id")
    )
    current_learning = (
        LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.IN_PROGRESS)
        .order_by("-updated_at", "-id")
        .first()
    )
    if current_learning is None:
        current_learning = (
            LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.NOT_STARTED)
            .order_by("created_at", "id")
            .first()
        )
    if current_learning is None:
        current_learning = (
            LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.COMPLETED)
            .order_by("-completed_at", "-id")
            .first()
        )

    completed_courses = learning["completed_courses"]
    passed_results = exams["passed_results"]
    skill_count = skills["skill_count"]

    if current_learning is None:
        continue_learning = {
            "roadmap_title": "Learning roadmap",
            "topic_title": "Start your first topic",
            "progress_percent": 0,
            "status": "not_started",
            "cta_label": "Start learning",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "start_learning",
            "title": "Start your first roadmap topic",
            "description": "Begin learning so you can unlock topic validation and build your hiring-ready skill profile.",
            "cta_label": "Start learning",
            "cta_href": "/student/learning",
            "requirement": None,
        }
    elif current_learning.status != LearningRecord.Status.COMPLETED:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": current_learning.course_title,
            "progress_percent": current_learning.progress_percent,
            "status": roadmap_state_for_learning_record(current_learning),
            "cta_label": "Continue learning" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start topic",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "complete_topic" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "start_topic",
            "title": "Complete your current topic" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start your next topic",
            "description": f"Finish {current_learning.course_title} to stay on track in your roadmap.",
            "cta_label": "Continue learning" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start topic",
            "cta_href": "/student/learning",
            "requirement": None,
        }
    elif completed_courses > passed_results:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": current_learning.course_title,
            "progress_percent": 100,
            "status": "completed",
            "cta_label": "Review topic",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "take_exam",
            "title": "Take the validation exam",
            "description": f"You completed {current_learning.course_title}. Pass the exam to unlock the next topic in the roadmap.",
            "cta_label": "Take exam",
            "cta_href": "/student/exams",
            "requirement": "90% required to unlock the next topic",
        }
    else:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": current_learning.course_title,
            "progress_percent": 100,
            "status": "completed",
            "cta_label": "Continue roadmap",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "continue_roadmap",
            "title": "Move to the next roadmap topic",
            "description": "Your latest topic has been validated. Keep building momentum with the next learning step.",
            "cta_label": "Continue learning",
            "cta_href": "/student/learning",
            "requirement": None,
        }

    return success_response(
        {
            "student_id": request.user.id,
            "student_name": request.user.full_name,
            "header_message": "Continue your roadmap and unlock your next skill.",
            "continue_learning": continue_learning,
            "next_action": next_action,
            "progress_overview": {
                "completed_topics": completed_courses,
                "exam_average": exams["average_score"],
                "current_level": derive_student_level(
                    completed_topics=completed_courses,
                    skill_count=skill_count,
                    exam_average=exams["average_score"],
                ),
            },
            "roadmap_preview": {
                "nodes": build_student_dashboard_roadmap_nodes(
                    learning_records=learning_records,
                    completed_courses=completed_courses,
                    passed_results=passed_results,
                    skill_count=skill_count,
                    profile_complete=profile["profile_complete"],
                )
            },
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_dashboard_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    interviews = list(
        Interview.objects.filter(company=company)
        .select_related("student", "company", "candidate_access", "requested_by")
        .order_by("-updated_at", "-id")
    )
    candidates = list(
        CandidateReviewAccess.objects.filter(company=company, is_active=True)
        .select_related("student", "company", "shortlist_entry", "shortlist_entry__created_by")
        .annotate(notes_count=Count("notes"))
        .order_by("-updated_at", "-id")
    )
    active_jobs = list(
        Vacancy.objects.filter(company=company, status=Vacancy.Status.ACTIVE)
        .select_related("company", "created_by")
        .order_by("-updated_at", "-id")
    )
    shortlist_count = CandidateShortlist.objects.filter(company=company).count()
    unread_notifications = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()
    active_interviews = [
        interview
        for interview in interviews
        if interview.status in {Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED}
    ]
    completed_interviews = [interview for interview in interviews if interview.status == Interview.Status.COMPLETED]

    return success_response(
        {
            "company_id": company.id,
            "company_name": company.name,
            "header_message": "Review candidates, keep jobs moving, and follow up on interviews from one hiring workspace.",
            "candidates_to_review": [serialize_company_dashboard_candidate(candidate) for candidate in candidates[:4]],
            "active_jobs": {
                "pipeline_summary": f"{len(candidates)} candidate review context{'s' if len(candidates) != 1 else ''} currently need attention.",
                "jobs": [serialize_company_dashboard_job(vacancy) for vacancy in active_jobs[:4]],
            },
            "interviews": {
                "active_count": len(active_interviews),
                "completed_count": len(completed_interviews),
                "items": [serialize_company_dashboard_interview(interview) for interview in interviews[:3]],
            },
            "analytics": {
                "candidates_to_review": len(candidates),
                "shortlisted_candidates": shortlist_count,
                "active_jobs": len(active_jobs),
                "unread_updates": unread_notifications,
            },
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_dashboard_view(request):
    users = list(User.objects.select_related("company").order_by("-date_joined", "-id")[:5])
    interviews = list(
        Interview.objects.select_related("student", "company", "candidate_access", "requested_by")
        .order_by("-updated_at", "-id")[:5]
    )
    total_interviews = Interview.objects.count()
    unread_notifications = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()

    return success_response(
        {
            "metrics": {
                "total_users": User.objects.count(),
                "students": User.objects.filter(role=User.Role.STUDENT).count(),
                "company_users": User.objects.filter(role=User.Role.COMPANY).count(),
                "admins": User.objects.filter(role=User.Role.ADMIN).count(),
                "companies": Company.objects.count(),
                "active_vacancies": Vacancy.objects.filter(status=Vacancy.Status.ACTIVE).count(),
                "total_interviews": total_interviews,
                "active_interviews": Interview.objects.filter(
                    status__in=[Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED]
                ).count(),
                "completed_interviews": Interview.objects.filter(status=Interview.Status.COMPLETED).count(),
                "cancelled_interviews": Interview.objects.filter(status=Interview.Status.CANCELLED).count(),
                "unread_notifications": unread_notifications,
            },
            "recent_users": [serialize_admin_user_summary(user) for user in users],
            "recent_interviews": [serialize_admin_interview_summary(interview) for interview in interviews],
            "recent_notifications": recent_notifications_for_user(request.user),
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_vacancies_view(request):
    vacancies = list(
        Vacancy.objects.select_related("company", "created_by")
        .order_by("-updated_at", "-id")
    )
    return success_response({"vacancies": [serialize_vacancy(vacancy) for vacancy in vacancies]})


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_users_view(request):
    if request.method == "GET":
        users = list(User.objects.select_related("company").order_by("email"))
        companies = list(Company.objects.order_by("name"))
        return success_response(
            {
                "users": [serialize_admin_user(user) for user in users],
                "companies": [serialize_admin_company(company) for company in companies],
            }
        )

    payload = validate_admin_user_payload(parse_json_body(request), creating=True)
    if User.objects.filter(email__iexact=payload["email"]).exists():
        raise ValidationError({"email": ["A user with this email already exists."]})

    validate_password(payload["password"])
    user = User.objects.create_user(
        email=payload["email"],
        password=payload["password"],
        full_name=payload["name"],
        role=payload["role"],
        company=payload["company"],
    )
    user.is_active = payload["is_active"]
    user.is_staff = payload["role"] == User.Role.ADMIN
    user.full_clean()
    user.save(update_fields=["is_active", "is_staff", "updated_at"])
    if payload["role"] == User.Role.STUDENT:
        StudentProfile.objects.get_or_create(user=user)

    return success_response(serialize_admin_user(user), status=201)


@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_user_detail_view(request, user_id: int):
    user = User.objects.select_related("company").filter(pk=user_id).first()
    if user is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested user was not found.",
            details={"user_id": [str(user_id)]},
            status=404,
        )

    payload = validate_admin_user_payload(parse_json_body(request), creating=False)
    ensure_admin_user_update_allowed(request.user, user, payload)

    if User.objects.filter(email__iexact=payload["email"]).exclude(pk=user.pk).exists():
        raise ValidationError({"email": ["A user with this email already exists."]})

    user.email = payload["email"]
    user.full_name = payload["name"]
    user.company = payload["company"]
    user.is_active = payload["is_active"]
    user.is_staff = payload["role"] == User.Role.ADMIN
    user.full_clean()
    user.save(update_fields=["email", "full_name", "company", "is_active", "is_staff", "updated_at"])
    return success_response(serialize_admin_user(user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_companies_view(request):
    if request.method == "GET":
        companies = list(Company.objects.order_by("name"))
        return success_response({"companies": [serialize_admin_company(company) for company in companies]})

    payload = validate_admin_company_payload(parse_json_body(request))
    company = Company(
        name=payload["name"],
        description=payload["description"],
        is_active=payload["is_active"],
    )
    company.full_clean()
    company.save()
    return success_response(serialize_admin_company(company), status=201)


@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_company_detail_view(request, company_id: int):
    company = Company.objects.filter(pk=company_id).first()
    if company is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested company was not found.",
            details={"company_id": [str(company_id)]},
            status=404,
        )

    payload = validate_admin_company_payload(parse_json_body(request))
    company.name = payload["name"]
    company.description = payload["description"]
    company.is_active = payload["is_active"]
    company.full_clean()
    company.save(update_fields=["name", "description", "is_active", "updated_at"])
    return success_response(serialize_admin_company(company))


@api_endpoint(["GET"], authentication_required=True)
def notifications_view(request):
    notifications = list(
        Notification.objects.filter(recipient=request.user)
        .select_related("actor")
        .order_by("-created_at", "-id")[:50]
    )
    unread_count = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()
    return success_response(
        {
            "unread_count": unread_count,
            "notifications": [serialize_notification(notification) for notification in notifications],
        }
    )


@api_endpoint(["POST"], authentication_required=True)
def notification_read_all_view(request):
    now = timezone.now()
    Notification.objects.filter(recipient=request.user, read_at__isnull=True).update(read_at=now, updated_at=now)
    notifications = list(
        Notification.objects.filter(recipient=request.user)
        .select_related("actor")
        .order_by("-created_at", "-id")[:50]
    )
    return success_response(
        {
            "unread_count": 0,
            "notifications": [serialize_notification(notification) for notification in notifications],
        }
    )


@api_endpoint(["POST"], authentication_required=True)
def notification_read_view(request, notification_id: int):
    notification = Notification.objects.filter(recipient=request.user, pk=notification_id).select_related("actor").first()
    if notification is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested notification was not found.",
            details={"notification_id": [str(notification_id)]},
            status=404,
        )

    notification.mark_read()
    return success_response(serialize_notification(notification))


@api_endpoint(["GET"], authentication_required=True)
def access_me_view(request):
    return success_response(
        {
            "user": serialize_user(request.user),
            "request_id": request.request_id,
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_access_view(request):
    return success_response({"message": "Student access granted.", "role": request.user.role})


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_access_view(request):
    return success_response({"message": "Company access granted.", "role": request.user.role})


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_access_view(request):
    return success_response({"message": "Admin access granted.", "role": request.user.role})
