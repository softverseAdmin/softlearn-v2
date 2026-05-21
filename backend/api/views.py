import logging
import re

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.cache import cache
from django.db import IntegrityError, connections, transaction
from django.db.models import Avg, Count, F, Q
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from urllib.parse import urlparse

from api.auth_views import (
    csrf_view,
    login_view,
    logout_view,
    password_change_view,
    password_reset_confirm_view,
    password_reset_request_view,
    serialize_user,
    session_view,
    signup_view,
    validate_signup_payload,
)
from api.message_views import (
    company_message_compose_contacts_view,
    company_message_thread_detail_view,
    company_message_thread_messages_view,
    company_message_threads_queryset,
    company_message_threads_view,
    company_messages_view,
    message_profile_image_for_user,
    serialize_company_messages,
    serialize_message_thread,
    serialize_student_messages,
    student_message_compose_contacts_view,
    student_message_thread_detail_view,
    student_message_thread_messages_view,
    student_message_threads_queryset,
    student_message_threads_view,
    student_messages_view,
)
from api.pagination import paginate_queryset, parse_pagination_params
from api.student_profile_views import (
    get_student_availability_profile,
    get_student_profile,
    serialize_student_availability_profile,
    serialize_student_certificate,
    serialize_student_education,
    serialize_student_experience,
    serialize_student_profile,
    serialize_student_resume,
    student_availability_view,
    student_certificate_detail_view,
    student_certificates_view,
    student_education_detail_view,
    student_education_view,
    student_experience_detail_view,
    student_experience_view,
    student_profile_view,
    student_resume_detail_view,
    student_resumes_view,
)
from api.course_assessments import (
    active_course_assessment_questions,
    active_course_lessons,
    build_course_assessment_map,
    build_course_assessment_generation_source,
    clear_cached_generated_course_assessment_questions,
    company_preview_course_lessons,
    course_assessment_unavailable_message,
    ensure_default_course_assessment_questions,
    ensure_company_preview_course_assessment_map,
    get_cached_generated_course_assessment_questions,
    latest_course_assessment_attempt,
    next_course_assessment_attempt_number,
    resolve_course_assessment_questions,
    serialize_company_preview_assessment_detail,
    serialize_course_assessment_detail,
    serialize_course_assessment_summary,
    serialize_generated_course_assessment_question,
    serialize_student_course_assessment_question,
)
from common.decorators import api_endpoint
from common.http import error_response, parse_json_body, success_response
from users.models import (
    Application,
    ApplicationStatusHistory,
    CandidateNote,
    CandidateReviewAccess,
    CandidateShortlist,
    Company,
    CompanyHiringPreferences,
    CompanyMember,
    Course,
    CourseAssessment,
    CourseAssessmentAttempt,
    CourseAssessmentAttemptSelection,
    CourseAssessmentOption,
    CourseAssessmentQuestion,
    CourseReview,
    Exam,
    ExamAnswerOption,
    ExamAttempt,
    ExamAttemptAnswer,
    ExamCategory,
    ExamQuestion,
    ExamResult,
    Interview,
    InterviewAvailability,
    InterviewEvent,
    JobBookmark,
    Lesson,
    LessonProgress,
    LearningRecord,
    Message,
    MessageThread,
    MockExam,
    MockExamAttempt,
    MockExamAttemptAnswer,
    Notification,
    Skill,
    PracticeQuestion,
    PracticeQuestionAttempt,
    PracticeQuestionOption,
    StudentAvailabilityProfile,
    StudentEducation,
    StudentExperience,
    StudentPerformanceMetric,
    StudentProfile,
    StudentResume,
    StudentSkill,
    TeacherProfile,
    StudyPlan,
    StudyPlanItem,
    StudentCertificate,
    StudentVisibilityEvent,
    StudentVisibilitySettings,
    User,
    Vacancy,
    VacancyLanguageRequirement,
    VacancySkillRequirement,
)
from users.media import file_url_or_none, text_value_or_none
from users.notifications import emit_interview_event_notifications
from services.security import SecurityManager

logger = logging.getLogger(__name__)

MATCH_RESULT_CACHE_TTL_SECONDS = 300


def readiness_checks(request) -> tuple[dict, int]:
    checks: dict[str, dict[str, str]] = {}
    overall_status = "ok"
    status_code = 200

    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        checks["database"] = {"status": "ok"}
    except Exception:
        checks["database"] = {"status": "error"}
        overall_status = "error"
        status_code = 503

    if getattr(settings, "ENABLE_REDIS_CACHE", False):
        cache_key = f"readiness:{getattr(request, 'request_id', 'unknown')}"
        try:
            cache.set(cache_key, "ok", timeout=5)
            cached_value = cache.get(cache_key)
            cache.delete(cache_key)
            if cached_value != "ok":
                raise RuntimeError("Cache round-trip failed.")
            checks["cache"] = {"status": "ok"}
        except Exception:
            checks["cache"] = {"status": "error"}
            overall_status = "error"
            status_code = 503
    else:
        checks["cache"] = {"status": "disabled"}

    return (
        {
            "status": overall_status,
            "request_id": request.request_id,
            "checks": checks,
        },
        status_code,
    )


def youtube_video_url_error(video_url: str) -> str | None:
    if not video_url:
        return None

    parsed_video_url = urlparse(video_url)
    hostname = (parsed_video_url.hostname or "").lower()
    allowed_hosts = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"}
    if parsed_video_url.scheme not in {"http", "https"} or hostname not in allowed_hosts:
        return "Video URL must be a valid YouTube link."
    return None


def http_url_error(value: str, *, field_label: str, allow_relative_path: bool = False) -> str | None:
    if not value:
        return None
    if allow_relative_path and value.startswith("/"):
        return None

    parsed_value = urlparse(value)
    if parsed_value.scheme not in {"http", "https"} or not parsed_value.netloc:
        return f"{field_label} must be a valid URL."
    return None


def serialize_course_preview_fields(course: Course) -> dict:
    return {
        "preview_title": text_value_or_none(course.preview_title),
        "preview_short_description": text_value_or_none(course.preview_short_description),
        "preview_video_url": text_value_or_none(course.preview_video_url),
        "preview_thumbnail_image": (
            file_url_or_none(course.preview_thumbnail_image_file) or text_value_or_none(course.preview_thumbnail_image)
        ),
        "preview_duration": course.preview_duration_minutes,
        "preview_access_type": text_value_or_none(course.preview_access_type),
        "preview_order": course.preview_order,
        "preview_status": text_value_or_none(course.preview_status),
    }


def sync_course_media_fields(course: Course, payload: dict) -> None:
    thumbnail_image = payload["thumbnail_image"]
    preview_thumbnail_image = payload["preview_thumbnail_image"]

    if thumbnail_image and not thumbnail_image.startswith("/"):
        if course.thumbnail_image_file:
            course.thumbnail_image_file.delete(save=False)
        course.thumbnail_image_file = ""

    if preview_thumbnail_image and not preview_thumbnail_image.startswith("/"):
        if course.preview_thumbnail_image_file:
            course.preview_thumbnail_image_file.delete(save=False)
        course.preview_thumbnail_image_file = ""

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
        "profile_image": file_url_or_none(company.profile_image_file) or text_value_or_none(company.profile_image),
        "cover_image": file_url_or_none(company.cover_image_file) or text_value_or_none(company.cover_image),
        "job_posting_id": company.job_posting_id,
        "founder_name": company.founder_name,
        "headquarters_address": company.headquarters_address,
        "office_locations": company.office_locations,
        "founded_at": company.founded_at,
        "website_url": company.website_url,
        "industry": company.industry,
        "company_points": company.company_points or [],
        "business_domains": company.business_domains or [],
        "business_models": company.business_models or [],
        "employee_count_label": company.employee_count_label,
        "market_category": company.market_category,
        "capital_label": company.capital_label,
        "revenue_label": company.revenue_label,
        "tagline": company.tagline,
        "company_features": company.company_features,
        "additional_company_info": company.additional_company_info,
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
        "course_id": record.course_id,
        "course_title": learning_record_title(record),
        "category": learning_record_category(record),
        "progress_percent": record.progress_percent,
        "status": record.status,
        "completed_at": record.completed_at.isoformat() if record.completed_at else None,
    }


def learning_record_title(record: LearningRecord) -> str:
    if record.course_id and record.course is not None:
        return record.course.title
    return record.course_title


def learning_record_category(record: LearningRecord) -> str:
    if record.course_id and record.course is not None:
        return record.course.category
    return record.category


def serialize_learning_summary(user: User) -> dict:
    records = list(
        LearningRecord.objects.filter(student=user)
        .select_related("course")
        .order_by("course_title", "id")
    )
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
        "exam_id": result.exam_id,
        "attempt_id": result.attempt_id,
        "exam_title": exam_result_title(result),
        "category": exam_result_category(result),
        "score_percent": result.score_percent,
        "passed": result.passed,
        "attempt_number": result.attempt_number,
        "taken_at": result.taken_at.isoformat(),
    }


def exam_result_title(result: ExamResult) -> str:
    if result.exam_id and result.exam is not None:
        return result.exam.title
    return result.exam_title


def exam_result_category(result: ExamResult) -> str:
    if result.exam_id and result.exam is not None:
        return result.exam.category
    return result.category


def serialize_exam_results_summary(user: User) -> dict:
    results = list(
        ExamResult.objects.filter(student=user)
        .select_related("exam")
        .order_by("-taken_at", "exam_title", "id")
    )
    available_exams = [serialize_student_available_exam(sync_exam_question_count(exam), student=user) for exam in visible_student_exams_queryset()]
    average_score = None
    if results:
        average_score = round(sum(result.score_percent for result in results) / len(results), 1)

    return {
        "student_id": user.id,
        "total_results": len(results),
        "passed_results": sum(1 for result in results if result.passed),
        "average_score": average_score,
        "results": [serialize_exam_result(result) for result in results],
        "available_exams": available_exams,
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


MATCH_SCORE_WEIGHTS = {
    "skill": 40,
    "language": 20,
    "location": 15,
    "readiness": 15,
    "profile": 10,
}

MATCH_RECOMMENDATION_THRESHOLD = 40.0

LANGUAGE_LEVEL_RANKS = {
    VacancyLanguageRequirement.Level.BASIC: 1,
    VacancyLanguageRequirement.Level.CONVERSATIONAL: 2,
    VacancyLanguageRequirement.Level.BUSINESS: 3,
    VacancyLanguageRequirement.Level.FLUENT: 4,
    VacancyLanguageRequirement.Level.NATIVE: 5,
}


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


def serialize_application_status_history(entry: ApplicationStatusHistory) -> dict:
    return {
        "id": entry.id,
        "from_status": entry.from_status or None,
        "to_status": entry.to_status,
        "actor_name": entry.actor.full_name if entry.actor else None,
        "actor_role": entry.actor.role if entry.actor else None,
        "note": entry.note,
        "created_at": entry.created_at.isoformat(),
    }


def application_is_withdrawable(application: Application) -> bool:
    return application.status in {Application.Status.SUBMITTED, Application.Status.UNDER_REVIEW}


def application_is_shortlistable(application: Application) -> bool:
    return application.status in {Application.Status.SUBMITTED, Application.Status.UNDER_REVIEW}


def application_is_rejectable(application: Application) -> bool:
    return application.status in {Application.Status.SUBMITTED, Application.Status.UNDER_REVIEW}


def serialize_student_application(application: Application) -> dict:
    return {
        "application_id": application.id,
        "vacancy_id": application.vacancy_id,
        "vacancy_title": application.vacancy.title,
        "company_id": application.company_id,
        "company_name": application.company.name,
        "status": application.status,
        "can_withdraw": application_is_withdrawable(application),
        "submitted_at": application.created_at.isoformat(),
        "updated_at": application.updated_at.isoformat(),
        "history": [serialize_application_status_history(item) for item in application.history.all()],
    }


def serialize_company_application(application: Application) -> dict:
    visibility = get_visibility_settings(application.student)
    student_profile = get_student_profile(application.student)
    candidate_access = CandidateReviewAccess.objects.filter(
        company=application.company,
        student=application.student,
        source=CandidateReviewAccess.Source.APPLICATION,
    ).first()
    return {
        "application_id": application.id,
        "candidate_access_id": candidate_access.id if candidate_access else None,
        "vacancy_id": application.vacancy_id,
        "vacancy_title": application.vacancy.title,
        "student_id": application.student_id,
        "display_name": application.student.full_name if visibility.share_profile_preview else "Private candidate",
        "desired_job_type": student_profile.desired_job_type if visibility.share_profile_preview else "",
        "desired_work_location": student_profile.desired_work_location if visibility.share_profile_preview else "",
        "status": application.status,
        "can_shortlist": application_is_shortlistable(application),
        "can_reject": application_is_rejectable(application),
        "submitted_at": application.created_at.isoformat(),
        "updated_at": application.updated_at.isoformat(),
        "history": [serialize_application_status_history(item) for item in application.history.all()],
    }


def serialize_match_factor_breakdown(match_result: dict) -> dict:
    return {
        "skill": match_result["factors"]["skill"],
        "language": match_result["factors"]["language"],
        "location": match_result["factors"]["location"],
        "readiness": match_result["factors"]["readiness"],
        "profile": match_result["factors"]["profile"],
    }


def privacy_safe_match_reasons(student: User, match_result: dict) -> tuple[list[str], list[str]]:
    visibility = get_visibility_settings(student)
    if visibility.share_profile_preview:
        return match_result["strengths"], match_result["gaps"]

    strengths: list[str] = []
    gaps: list[str] = []
    if match_result["factors"]["skill"] >= 60:
        strengths.append("Structured skill alignment supports this recommendation.")
    if match_result["factors"]["language"] >= 60:
        strengths.append("Language alignment supports this recommendation.")
    if match_result["factors"]["location"] >= 60:
        strengths.append("Location compatibility supports this recommendation.")
    if match_result["factors"]["readiness"] >= 60:
        strengths.append("Learning readiness supports this recommendation.")
    if match_result["factors"]["profile"] < 100:
        gaps.append("Some profile details remain incomplete.")
    if match_result["factors"]["skill"] < 60:
        gaps.append("More visible skill alignment would strengthen the match.")
    if match_result["factors"]["language"] < 60:
        gaps.append("Language alignment could be stronger.")

    return strengths[:4], gaps[:4]


def serialize_student_match_record(
    user: User,
    vacancy: Vacancy,
    match_result: dict,
    *,
    bookmarked_vacancy_ids: set[int],
    active_application_vacancy_ids: set[int],
) -> dict:
    vacancy_data = serialize_vacancy(
        vacancy,
        bookmarked_vacancy_ids=bookmarked_vacancy_ids,
        active_application_vacancy_ids=active_application_vacancy_ids,
    )
    return {
        **vacancy_data,
        "match_score": match_result["score"],
        "match_level": match_result["level"],
        "strengths": match_result["strengths"],
        "gaps": match_result["gaps"],
        "factor_breakdown": serialize_match_factor_breakdown(match_result),
    }


def serialize_company_vacancy_match_record(vacancy: Vacancy, student: User, match_result: dict) -> dict:
    visibility = get_visibility_settings(student)
    profile = get_student_profile(student)
    candidate_access = CandidateReviewAccess.objects.filter(
        company=vacancy.company,
        student=student,
        source=CandidateReviewAccess.Source.MATCH,
    ).first()
    strengths, gaps = privacy_safe_match_reasons(student, match_result)
    top_skills = list(
        StudentSkill.objects.filter(student=student)
        .select_related("skill")
        .order_by("skill__name")
        .values_list("skill__name", flat=True)[:3]
    ) if visibility.share_profile_preview else []

    return {
        "candidate_access_id": candidate_access.id if candidate_access else None,
        "vacancy_id": vacancy.id,
        "student_id": student.id,
        "display_name": student.full_name if visibility.share_profile_preview else "Private candidate",
        "desired_job_type": profile.desired_job_type if visibility.share_profile_preview else "",
        "desired_work_location": profile.desired_work_location if visibility.share_profile_preview else "",
        "top_skills": top_skills,
        "match_score": match_result["score"],
        "match_level": match_result["level"],
        "strengths": strengths,
        "gaps": gaps,
        "factor_breakdown": serialize_match_factor_breakdown(match_result),
        "visibility": {
            "profile_preview": visibility_state(visibility.share_profile_preview),
            "learning_record": visibility_state(visibility.share_learning_record),
            "exam_results": visibility_state(visibility.share_exam_results),
        },
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
    category = learning_record_category(record)
    if category.strip():
        return f"{category.replace('_', ' ').title()} roadmap"
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


def normalize_language_level(raw_value: str) -> str:
    cleaned = raw_value.strip().lower().replace("-", "_").replace(" ", "_")
    if cleaned in LANGUAGE_LEVEL_RANKS:
        return cleaned

    aliases = {
        "n5": VacancyLanguageRequirement.Level.BASIC,
        "n4": VacancyLanguageRequirement.Level.CONVERSATIONAL,
        "n3": VacancyLanguageRequirement.Level.BUSINESS,
        "n2": VacancyLanguageRequirement.Level.FLUENT,
        "n1": VacancyLanguageRequirement.Level.NATIVE,
        "beginner": VacancyLanguageRequirement.Level.BASIC,
        "intermediate": VacancyLanguageRequirement.Level.CONVERSATIONAL,
        "advanced": VacancyLanguageRequirement.Level.FLUENT,
    }
    return aliases.get(cleaned, "")


def match_level_for_score(score: float) -> str:
    if score >= 80:
        return "Strong Match"
    if score >= 60:
        return "Good Match"
    if score >= 40:
        return "Possible Match"
    return "Low Match"


def build_student_profile_completion(user: User, profile: StudentProfile) -> dict:
    has_education = StudentEducation.objects.filter(student=user).exists()
    has_experience = StudentExperience.objects.filter(student=user).exists()
    has_active_resume = StudentResume.objects.filter(student=user, is_active=True).exists()
    availability_profile = get_student_availability_profile(user)
    fields = {
        "full_name": bool(user.full_name.strip()),
        "desired_job_type": bool(profile.desired_job_type.strip()),
        "desired_work_location": bool(profile.desired_work_location.strip()),
        "japanese_level": bool(profile.japanese_level.strip()),
        "english_level": bool(profile.english_level.strip()),
        "education_record": has_education,
        "experience_record": has_experience,
        "active_resume": has_active_resume,
        "availability": availability_profile.availability_set,
    }
    completed = sum(1 for filled in fields.values() if filled)
    percent = round((completed / len(fields)) * 100, 1)
    strengths: list[str] = []
    gaps: list[str] = []

    if percent == 100:
        strengths.append("Profile is complete for hiring recommendations.")
    else:
        missing_fields = [field.replace("_", " ") for field, filled in fields.items() if not filled]
        if missing_fields:
            gaps.append(f"Complete profile fields: {', '.join(missing_fields[:3])}.")

    return {
        "percent": percent,
        "strengths": strengths,
        "gaps": gaps,
    }


def build_skill_match(student: User, vacancy: Vacancy) -> dict:
    student_skills = {
        student_skill.skill_id: student_skill.skill.name
        for student_skill in StudentSkill.objects.filter(student=student).select_related("skill")
    }
    required_requirements = [item for item in vacancy.skill_requirements.all() if item.requirement_type == VacancySkillRequirement.RequirementType.REQUIRED]
    preferred_requirements = [item for item in vacancy.skill_requirements.all() if item.requirement_type == VacancySkillRequirement.RequirementType.PREFERRED]

    matched_required = [item for item in required_requirements if item.skill_id in student_skills]
    matched_preferred = [item for item in preferred_requirements if item.skill_id in student_skills]
    missing_required = [item.skill.name for item in required_requirements if item.skill_id not in student_skills]
    missing_preferred = [item.skill.name for item in preferred_requirements if item.skill_id not in student_skills]

    if not required_requirements and not preferred_requirements:
        return {
            "percent": 100.0,
            "strengths": ["No vacancy-specific skill tags block this role."],
            "gaps": [],
        }

    required_percent = 100.0 if not required_requirements else (len(matched_required) / len(required_requirements)) * 100
    preferred_percent = 100.0 if not preferred_requirements else (len(matched_preferred) / len(preferred_requirements)) * 100
    percent = round((required_percent * 0.75) + (preferred_percent * 0.25), 1)

    strengths: list[str] = []
    gaps: list[str] = []
    if matched_required:
        strengths.append(
            f"Required skills aligned: {', '.join(item.skill.name for item in matched_required[:3])}."
        )
    elif required_requirements:
        gaps.append("No required vacancy skills are currently shown on the profile.")

    if matched_preferred:
        strengths.append(
            f"Preferred skills aligned: {', '.join(item.skill.name for item in matched_preferred[:3])}."
        )

    if missing_required:
        gaps.append(f"Missing required skills: {', '.join(missing_required[:3])}.")
    elif missing_preferred:
        gaps.append(f"Preferred skills not yet shown: {', '.join(missing_preferred[:3])}.")

    return {
        "percent": percent,
        "strengths": strengths[:2],
        "gaps": gaps[:2],
    }


def build_language_match(profile: StudentProfile, vacancy: Vacancy) -> dict:
    language_requirements = list(vacancy.language_requirements.all())
    if not language_requirements:
        return {
            "percent": 100.0,
            "strengths": ["No explicit vacancy language requirement blocks this role."],
            "gaps": [],
        }

    student_levels = {
        VacancyLanguageRequirement.Language.JAPANESE: normalize_language_level(profile.japanese_level),
        VacancyLanguageRequirement.Language.ENGLISH: normalize_language_level(profile.english_level),
    }

    weighted_scores: list[float] = []
    strengths: list[str] = []
    gaps: list[str] = []
    for requirement in language_requirements:
        student_level = student_levels.get(requirement.language, "")
        required_rank = LANGUAGE_LEVEL_RANKS[requirement.minimum_level]
        student_rank = LANGUAGE_LEVEL_RANKS.get(student_level, 0)
        meets = student_rank >= required_rank and student_rank > 0
        score = 100.0 if meets else (0.0 if requirement.requirement_type == VacancyLanguageRequirement.RequirementType.REQUIRED else 35.0)
        weight = 0.7 if requirement.requirement_type == VacancyLanguageRequirement.RequirementType.REQUIRED else 0.3
        weighted_scores.append(score * weight)

        if meets:
            strengths.append(
                f"{requirement.get_language_display()} meets the {requirement.get_minimum_level_display().lower()} requirement."
            )
        else:
            current_level = student_level.replace("_", " ") if student_level else "not set"
            gaps.append(
                f"{requirement.get_language_display()} is {current_level} against a {requirement.get_minimum_level_display().lower()} {requirement.requirement_type} baseline."
            )

    percent = round(sum(weighted_scores), 1)
    return {
        "percent": percent,
        "strengths": strengths[:2],
        "gaps": gaps[:2],
    }


def build_location_match(profile: StudentProfile, vacancy: Vacancy) -> dict:
    desired_location = profile.desired_work_location.strip().lower()
    vacancy_location = vacancy.location.strip().lower()
    work_style = vacancy.work_style

    if not desired_location:
        return {
            "percent": 50.0,
            "strengths": [],
            "gaps": ["Desired work location is not set yet."],
        }

    if desired_location == vacancy_location or desired_location == work_style:
        return {
            "percent": 100.0,
            "strengths": ["Location preference aligns with this vacancy."],
            "gaps": [],
        }

    if work_style == Vacancy.WorkStyle.REMOTE:
        return {
            "percent": 85.0,
            "strengths": ["Remote work style expands location compatibility."],
            "gaps": [],
        }

    if work_style == Vacancy.WorkStyle.HYBRID:
        return {
            "percent": 70.0,
            "strengths": ["Hybrid work style offers partial location flexibility."],
            "gaps": [f"Preferred location differs from {vacancy.location}."],
        }

    return {
        "percent": 25.0,
        "strengths": [],
        "gaps": [f"Preferred location differs from {vacancy.location}."],
    }


def build_readiness_match(student: User) -> dict:
    learning_summary = serialize_learning_summary(student)
    exam_summary = serialize_exam_results_summary(student)

    learning_score = min(
        100.0,
        (learning_summary["completed_courses"] * 25.0) + (learning_summary["in_progress_courses"] * 10.0),
    )
    exam_score = float(exam_summary["average_score"] or 0.0)
    percent = round((learning_score + exam_score) / 2.0, 1)

    strengths: list[str] = []
    gaps: list[str] = []
    if learning_summary["completed_courses"] > 0:
        strengths.append(f"Completed topics: {learning_summary['completed_courses']}.")
    if exam_summary["average_score"] is not None and exam_summary["average_score"] >= 75:
        strengths.append(f"Exam readiness average: {exam_summary['average_score']:.1f}%.")
    if learning_summary["completed_courses"] == 0:
        gaps.append("No completed learning topics yet.")
    if exam_summary["average_score"] is None:
        gaps.append("No exam evidence shared yet.")

    return {
        "percent": percent,
        "strengths": strengths[:2],
        "gaps": gaps[:2],
    }


def aggregate_match_result(student: User, vacancy: Vacancy) -> dict:
    profile = get_student_profile(student)
    skill_match = build_skill_match(student, vacancy)
    language_match = build_language_match(profile, vacancy)
    location_match = build_location_match(profile, vacancy)
    readiness_match = build_readiness_match(student)
    profile_match = build_student_profile_completion(student, profile)

    weighted_score = (
        (skill_match["percent"] * MATCH_SCORE_WEIGHTS["skill"])
        + (language_match["percent"] * MATCH_SCORE_WEIGHTS["language"])
        + (location_match["percent"] * MATCH_SCORE_WEIGHTS["location"])
        + (readiness_match["percent"] * MATCH_SCORE_WEIGHTS["readiness"])
        + (profile_match["percent"] * MATCH_SCORE_WEIGHTS["profile"])
    ) / 100.0
    score = round(weighted_score, 1)

    strengths = (
        skill_match["strengths"]
        + language_match["strengths"]
        + location_match["strengths"]
        + readiness_match["strengths"]
        + profile_match["strengths"]
    )[:4]
    gaps = (
        skill_match["gaps"]
        + language_match["gaps"]
        + location_match["gaps"]
        + readiness_match["gaps"]
        + profile_match["gaps"]
    )[:4]

    return {
        "score": score,
        "level": match_level_for_score(score),
        "strengths": strengths,
        "gaps": gaps,
        "factors": {
            "skill": round(skill_match["percent"], 1),
            "language": round(language_match["percent"], 1),
            "location": round(location_match["percent"], 1),
            "readiness": round(readiness_match["percent"], 1),
            "profile": round(profile_match["percent"], 1),
        },
    }


def cached_aggregate_match_result(student: User, vacancy: Vacancy) -> dict:
    cache_key = f"match-result:{student.id}:{vacancy.id}"
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    match_result = aggregate_match_result(student, vacancy)
    cache.set(cache_key, match_result, MATCH_RESULT_CACHE_TTL_SECONDS)
    return match_result


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
                "title": learning_record_title(record),
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


def serialize_admin_activity_item(item_id: str, kind: str, title: str, description: str, timestamp) -> dict:
    return {
        "id": item_id,
        "kind": kind,
        "title": title,
        "description": description,
        "timestamp": timestamp.isoformat(),
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
    user_count = getattr(company, "user_count", company.users.count())
    vacancy_count = getattr(company, "vacancy_count", company.vacancies.count())
    active_vacancy_count = getattr(
        company,
        "active_vacancy_count",
        company.vacancies.filter(status=Vacancy.Status.ACTIVE).count(),
    )
    return {
        "company_id": company.id,
        "name": company.name,
        "description": company.description,
        "is_active": company.is_active,
        "user_count": user_count,
        "vacancy_count": vacancy_count,
        "active_vacancy_count": active_vacancy_count,
        "created_at": company.created_at.isoformat(),
        "updated_at": company.updated_at.isoformat(),
    }


def company_can_edit_course(user: User, course: Course) -> bool:
    if user.role != User.Role.COMPANY:
        return False
    if user.company_id is None:
        return False
    return course.company_id == user.company_id


def teacher_can_edit_course(user: User, course: Course) -> bool:
    if user.role != User.Role.TEACHER:
        return False
    return course.company_id is None and course.created_by_id == user.id


def course_can_edit_course(user: User | None, course: Course) -> bool:
    if user is None:
        return False
    return company_can_edit_course(user, course) or teacher_can_edit_course(user, course)


def get_company_preview_course(user: User, course_id: int) -> Course | None:
    course = get_admin_course(course_id)
    if course is None:
        return None
    if course.status == Course.Status.INACTIVE:
        return None
    if course_can_edit_course(user, course):
        return course
    if course.status == Course.Status.ACTIVE:
        return course
    return None


def serialize_admin_course(course: Course, *, viewer: User | None = None) -> dict:
    return {
        "course_id": course.id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "difficulty_level": course.difficulty_level,
        "estimated_hours": course.estimated_hours,
        "thumbnail_image": file_url_or_none(course.thumbnail_image_file) or text_value_or_none(course.thumbnail_image),
        "thumbnail_alt_text": course.thumbnail_alt_text or None,
        "status": course.status,
        "lesson_count": course.lessons.count(),
        "learning_record_count": course.learning_records.count(),
        "company_id": course.company_id,
        "company_name": course.company.name if course.company_id else None,
        "created_by_id": course.created_by_id,
        "created_by_name": course.created_by.full_name if course.created_by_id else None,
        "can_edit": course_can_edit_course(viewer, course),
        "created_at": course.created_at.isoformat(),
        "updated_at": course.updated_at.isoformat(),
        **serialize_course_preview_fields(course),
    }


def serialize_admin_lesson(lesson: Lesson) -> dict:
    return {
        "lesson_id": lesson.id,
        "course_id": lesson.course_id,
        "course_title": lesson.course.title,
        "title": lesson.title,
        "summary": lesson.summary,
        "content": lesson.content,
        "transcript": lesson.transcript,
        "video_url": lesson.video_url,
        "sequence_number": lesson.sequence_number,
        "status": lesson.status,
        "progress_entry_count": lesson.progress_entries.count(),
        "created_at": lesson.created_at.isoformat(),
        "updated_at": lesson.updated_at.isoformat(),
    }


def build_course_readiness_cues(course: Course) -> list[str]:
    cues: list[str] = []
    if course.difficulty_level.strip():
        cues.append(f"Level: {course.difficulty_level}")
    if course.category.strip():
        cues.append(f"Category: {course.category}")
    if course.estimated_hours > 0:
        cues.append(f"Estimated {course.estimated_hours}h")
    return cues[:3]


def serialize_student_course_enrollment(
    learning_record: LearningRecord | None,
    *,
    lesson_count: int,
    completed_lesson_count: int,
) -> dict:
    return {
        "is_enrolled": learning_record is not None,
        "learning_record_id": learning_record.id if learning_record is not None else None,
        "status": learning_record.status if learning_record is not None else None,
        "progress_percent": learning_record.progress_percent if learning_record is not None else None,
        "completed_at": learning_record.completed_at.isoformat() if learning_record and learning_record.completed_at else None,
        "lesson_count": lesson_count,
        "completed_lesson_count": completed_lesson_count,
    }


def serialize_student_course_lesson(
    lesson: Lesson,
    *,
    progress: LessonProgress | None,
    is_accessible: bool,
    assessment: dict | None = None,
) -> dict:
    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "summary": lesson.summary,
        "sequence_number": lesson.sequence_number,
        "status": progress.status if progress is not None else None,
        "is_accessible": is_accessible,
        "detail_href": f"/student/courses/{lesson.course_id}/lessons/{lesson.id}" if is_accessible else None,
        "assessment": assessment,
    }


def normalize_average_rating(value) -> float | None:
    if value is None:
        return None
    return round(float(value), 1)


def course_review_summary_map(course_ids: list[int]) -> dict[int, dict]:
    summary_by_course_id = {
        course_id: {
            "average_rating": None,
            "rating_count": 0,
        }
        for course_id in course_ids
    }
    if not course_ids:
        return summary_by_course_id

    for item in (
        CourseReview.objects.filter(course_id__in=course_ids)
        .values("course_id")
        .annotate(average_rating=Avg("rating"), rating_count=Count("id"))
    ):
        summary_by_course_id[item["course_id"]] = {
            "average_rating": normalize_average_rating(item["average_rating"]),
            "rating_count": item["rating_count"],
        }

    return summary_by_course_id


def serialize_course_review(review: CourseReview, *, current_user: User | None = None) -> dict:
    return {
        "review_id": review.id,
        "student_id": review.student_id,
        "student_name": review.student.full_name,
        "rating": review.rating,
        "review_text": review.review_text,
        "created_at": review.created_at.isoformat(),
        "updated_at": review.updated_at.isoformat(),
        "is_current_user": current_user is not None and current_user.id == review.student_id,
    }


def serialize_student_course_summary(
    course: Course,
    *,
    learning_record: LearningRecord | None = None,
    learning_record_count: int = 0,
    average_rating: float | None = None,
    rating_count: int = 0,
    lesson_count: int = 0,
    next_step_label: str | None = None,
    next_step_href: str | None = None,
) -> dict:
    return {
        "course_id": course.id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "difficulty_level": course.difficulty_level,
        "estimated_hours": course.estimated_hours,
        "thumbnail_image": file_url_or_none(course.thumbnail_image_file) or text_value_or_none(course.thumbnail_image),
        "thumbnail_alt_text": course.thumbnail_alt_text or None,
        "status": course.status,
        "lesson_count": lesson_count,
        "learning_record_count": learning_record_count,
        "average_rating": average_rating,
        "rating_count": rating_count,
        "company_name": course.company.name if course.company_id else None,
        "company_profile_image": (
            file_url_or_none(course.company.profile_image_file) or text_value_or_none(course.company.profile_image)
            if course.company_id
            else None
        ),
        "created_by_name": course.created_by.full_name if course.created_by_id else None,
        "is_enrolled": learning_record is not None,
        "enrollment_status": learning_record.status if learning_record is not None else None,
        "progress_percent": learning_record.progress_percent if learning_record is not None else None,
        "readiness_cues": build_course_readiness_cues(course),
        "detail_href": f"/student/courses/{course.id}",
        "next_step_label": next_step_label or "View details",
        "next_step_href": next_step_href or f"/student/courses/{course.id}",
        **serialize_course_preview_fields(course),
    }


def serialize_company_course_summary(
    course: Course,
    *,
    lesson_count: int = 0,
) -> dict:
    return {
        "course_id": course.id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "difficulty_level": course.difficulty_level,
        "estimated_hours": course.estimated_hours,
        "thumbnail_image": file_url_or_none(course.thumbnail_image_file) or text_value_or_none(course.thumbnail_image),
        "thumbnail_alt_text": course.thumbnail_alt_text or None,
        "status": course.status,
        "lesson_count": lesson_count,
        "is_enrolled": False,
        "enrollment_status": None,
        "progress_percent": None,
        "readiness_cues": build_course_readiness_cues(course),
        "detail_href": "/company/courses",
        "next_step_label": "View course",
        "next_step_href": "/company/courses",
        **serialize_course_preview_fields(course),
    }


def serialize_student_course_detail(
    course: Course,
    *,
    current_user: User,
    learning_record: LearningRecord | None,
    learning_record_count: int,
    lessons: list[Lesson],
    lesson_progress_map: dict[int, LessonProgress],
    next_step_label: str,
    next_step_href: str | None,
) -> dict:
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts_by_assessment_id: dict[int, CourseAssessmentAttempt] = {}
    if learning_record is not None:
        for attempt in CourseAssessmentAttempt.objects.filter(
            student=learning_record.student,
            assessment__course=course,
            assessment__status=CourseAssessment.Status.ACTIVE,
        ).order_by("assessment_id", "-attempt_number", "-id"):
            if attempt.assessment_id not in latest_attempts_by_assessment_id:
                latest_attempts_by_assessment_id[attempt.assessment_id] = attempt
    completed_lesson_count = sum(
        1
        for lesson in lessons
        if lesson_progress_map.get(lesson.id) is not None
        and lesson_progress_map[lesson.id].status == LessonProgress.Status.COMPLETED
    )
    review_summary = course_review_summary_map([course.id]).get(course.id, {"average_rating": None, "rating_count": 0})
    recent_reviews = list(CourseReview.objects.filter(course=course).select_related("student")[:6])
    current_user_review = (
        CourseReview.objects.filter(course=course, student=current_user).select_related("student").first()
    )
    return {
        **serialize_student_course_summary(
            course,
            learning_record=learning_record,
            learning_record_count=learning_record_count,
            average_rating=review_summary["average_rating"],
            rating_count=review_summary["rating_count"],
            lesson_count=len(lessons),
            next_step_label=next_step_label,
            next_step_href=next_step_href,
        ),
        "enrollment": serialize_student_course_enrollment(
            learning_record,
            lesson_count=len(lessons),
            completed_lesson_count=completed_lesson_count,
        ),
        "lessons": [
            serialize_student_course_lesson(
                lesson,
                progress=lesson_progress_map.get(lesson.id),
                is_accessible=learning_record is not None
                and lesson_is_unlocked_for_student(
                    lesson,
                    lessons=lessons,
                    progress_map=lesson_progress_map,
                    assessment_by_lesson_id=assessment_by_lesson_id,
                    latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
                ),
                assessment=serialize_course_assessment_summary(
                    assessment_by_lesson_id.get(lesson.id),
                    student=learning_record.student,
                    unlocked=lesson_assessment_unlocked(lesson, progress_map=lesson_progress_map),
                )
                if learning_record is not None
                else None,
            )
            for lesson in lessons
        ],
        "final_exam": serialize_course_assessment_summary(
            final_assessment,
            student=learning_record.student,
            unlocked=final_course_assessment_unlocked(
                lessons=lessons,
                progress_map=lesson_progress_map,
                assessment_by_lesson_id=assessment_by_lesson_id,
                latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
            ),
        )
        if learning_record is not None
        else None,
        "learning_outcomes": [
            item
            for item in [
                f"Build {course.category.replace('_', ' ')} readiness." if course.category.strip() else "",
                f"Prepare for a {course.difficulty_level.lower()} learning path." if course.difficulty_level.strip() else "",
                f"Plan roughly {course.estimated_hours} hours of study." if course.estimated_hours > 0 else "",
            ]
            if item
        ][:3],
        "reviews": [serialize_course_review(review, current_user=current_user) for review in recent_reviews],
        "current_user_review": serialize_course_review(current_user_review, current_user=current_user) if current_user_review is not None else None,
    }


def company_preview_lesson_href(course_id: int, lesson_id: int) -> str:
    return f"/company/courses/{course_id}/preview/lessons/{lesson_id}"


def serialize_company_preview_course_detail(course: Course, *, lessons: list[Lesson]) -> dict:
    assessment_by_lesson_id, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    review_summary = course_review_summary_map([course.id]).get(course.id, {"average_rating": None, "rating_count": 0})
    return {
        **serialize_student_course_summary(
            course,
            learning_record=None,
            learning_record_count=course.learning_records.count(),
            average_rating=review_summary["average_rating"],
            rating_count=review_summary["rating_count"],
            lesson_count=len(lessons),
            next_step_label="Start preview",
            next_step_href=company_preview_lesson_href(course.id, lessons[0].id) if lessons else None,
        ),
        "detail_href": f"/company/courses/{course.id}/preview",
        "next_step_href": company_preview_lesson_href(course.id, lessons[0].id) if lessons else None,
        "enrollment": {
            "is_enrolled": False,
            "learning_record_id": None,
            "status": None,
            "progress_percent": 0,
            "completed_at": None,
            "lesson_count": len(lessons),
            "completed_lesson_count": 0,
        },
        "lessons": [
            {
                **serialize_student_course_lesson(
                    lesson,
                    progress=None,
                    is_accessible=lesson.sequence_number == 1,
                    assessment={
                        "assessment_id": assessment.id,
                        "title": assessment.title,
                        "description": assessment.description,
                        "kind": assessment.kind,
                        "passing_score_percent": assessment.passing_score_percent,
                        "question_count": CourseAssessmentQuestion.objects.filter(
                            assessment=assessment,
                            status=CourseAssessmentQuestion.Status.ACTIVE,
                        ).count(),
                        "is_unlocked": False,
                        "attempt_count": 0,
                        "best_score": None,
                        "latest_score": None,
                        "passed": False,
                    }
                    if (assessment := assessment_by_lesson_id.get(lesson.id)) is not None
                    else None,
                ),
                "detail_href": company_preview_lesson_href(course.id, lesson.id) if lesson.sequence_number == 1 else None,
            }
            for lesson in lessons
        ],
        "final_exam": {
            "assessment_id": final_assessment.id,
            "title": final_assessment.title,
            "description": final_assessment.description,
            "kind": final_assessment.kind,
            "passing_score_percent": final_assessment.passing_score_percent,
            "question_count": CourseAssessmentQuestion.objects.filter(
                assessment=final_assessment,
                status=CourseAssessmentQuestion.Status.ACTIVE,
            ).count(),
            "is_unlocked": False,
            "attempt_count": 0,
            "best_score": None,
            "latest_score": None,
            "passed": False,
        }
        if final_assessment is not None
        else None,
        "learning_outcomes": [
            item
            for item in [
                f"Build {course.category.replace('_', ' ')} readiness." if course.category.strip() else "",
                f"Prepare for a {course.difficulty_level.lower()} learning path." if course.difficulty_level.strip() else "",
                f"Plan roughly {course.estimated_hours} hours of study." if course.estimated_hours > 0 else "",
            ]
            if item
        ][:3],
        "reviews": [],
        "current_user_review": None,
    }


def serialize_company_preview_lesson_detail(
    lesson: Lesson,
    *,
    lessons: list[Lesson],
    lesson_exam: CourseAssessment | None,
    final_exam: CourseAssessment | None,
) -> dict:
    lesson_index = lessons.index(lesson)
    previous_lesson = lessons[lesson_index - 1] if lesson_index > 0 else None
    next_lesson = lessons[lesson_index + 1] if lesson_index < len(lessons) - 1 else None
    return {
        "lesson_id": lesson.id,
        "course_id": lesson.course_id,
        "course_title": lesson.course.title,
        "course_href": f"/company/courses/{lesson.course_id}/preview",
        "title": lesson.title,
        "summary": lesson.summary,
        "content": lesson.content,
        "video_url": lesson.video_url,
        "sequence_number": lesson.sequence_number,
        "total_lessons": len(lessons),
        "progress": {
            "status": LessonProgress.Status.NOT_STARTED,
            "started_at": None,
            "completed_at": None,
        },
        "previous_lesson_href": company_preview_lesson_href(previous_lesson.course_id, previous_lesson.id) if previous_lesson else None,
        "next_lesson_href": company_preview_lesson_href(next_lesson.course_id, next_lesson.id) if next_lesson else None,
        "lesson_exam": {
            "assessment_id": lesson_exam.id,
            "title": lesson_exam.title,
            "description": lesson_exam.description,
            "kind": lesson_exam.kind,
            "passing_score_percent": lesson_exam.passing_score_percent,
            "question_count": CourseAssessmentQuestion.objects.filter(
                assessment=lesson_exam,
                status=CourseAssessmentQuestion.Status.ACTIVE,
            ).count(),
            "is_unlocked": False,
            "attempt_count": 0,
            "best_score": None,
            "latest_score": None,
            "passed": False,
        }
        if lesson_exam is not None
        else None,
        "final_exam": {
            "assessment_id": final_exam.id,
            "title": final_exam.title,
            "description": final_exam.description,
            "kind": final_exam.kind,
            "passing_score_percent": final_exam.passing_score_percent,
            "question_count": CourseAssessmentQuestion.objects.filter(
                assessment=final_exam,
                status=CourseAssessmentQuestion.Status.ACTIVE,
            ).count(),
            "is_unlocked": False,
            "attempt_count": 0,
            "best_score": None,
            "latest_score": None,
            "passed": False,
        }
        if lesson_index == len(lessons) - 1 and final_exam is not None
        else None,
    }

def serialize_admin_exam(exam: Exam) -> dict:
    return {
        "exam_id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "category": exam.category,
        "duration_minutes": exam.duration_minutes,
        "passing_score_percent": exam.passing_score_percent,
        "question_count": exam.question_count,
        "max_attempts": exam.max_attempts,
        "status": exam.status,
        "result_count": exam.results.count(),
        "created_at": exam.created_at.isoformat(),
        "updated_at": exam.updated_at.isoformat(),
    }


def serialize_admin_exam_question(question: ExamQuestion) -> dict:
    return {
        "question_id": question.id,
        "exam_id": question.exam_id,
        "prompt": question.prompt,
        "instructions": question.instructions,
        "question_type": question.question_type,
        "sequence_number": question.sequence_number,
        "points": question.points,
        "status": question.status,
        "option_count": question.answer_options.count(),
        "created_at": question.created_at.isoformat(),
        "updated_at": question.updated_at.isoformat(),
    }


def serialize_admin_exam_answer_option(option: ExamAnswerOption) -> dict:
    return {
        "option_id": option.id,
        "question_id": option.question_id,
        "option_text": option.option_text,
        "sequence_number": option.sequence_number,
        "is_correct": option.is_correct,
        "status": option.status,
        "created_at": option.created_at.isoformat(),
        "updated_at": option.updated_at.isoformat(),
    }


def serialize_student_exam_option(option: ExamAnswerOption) -> dict:
    return {
        "option_id": option.id,
        "option_text": option.option_text,
        "sequence_number": option.sequence_number,
    }


def serialize_student_exam_question(question: ExamQuestion) -> dict:
    options = list(
        question.answer_options.filter(status=ExamAnswerOption.Status.ACTIVE).order_by("sequence_number", "id")
    )
    return {
        "question_id": question.id,
        "prompt": question.prompt,
        "instructions": question.instructions,
        "question_type": question.question_type,
        "sequence_number": question.sequence_number,
        "points": question.points,
        "options": [serialize_student_exam_option(option) for option in options],
    }


def serialize_student_available_exam(exam: Exam, *, student: User) -> dict:
    eligibility = evaluate_exam_retake_eligibility(student, exam)
    return {
        "exam_id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "category": exam.category,
        "duration_minutes": exam.duration_minutes,
        "passing_score_percent": exam.passing_score_percent,
        "question_count": exam.question_count,
        "max_attempts": exam.max_attempts,
        "attempt_count": eligibility["attempt_count"],
        "can_take": eligibility["can_take"],
        "retake_message": eligibility["message"],
        "next_attempt_number": eligibility["next_attempt_number"],
        "detail_href": f"/student/exams/{exam.id}",
    }


def serialize_student_exam_detail(exam: Exam, *, student: User) -> dict:
    eligibility = evaluate_exam_retake_eligibility(student, exam)
    questions = active_exam_questions(exam)
    return {
        "exam_id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "category": exam.category,
        "duration_minutes": exam.duration_minutes,
        "passing_score_percent": exam.passing_score_percent,
        "question_count": len(questions),
        "max_attempts": exam.max_attempts,
        "attempt_count": eligibility["attempt_count"],
        "can_take": eligibility["can_take"],
        "retake_message": eligibility["message"],
        "next_attempt_number": eligibility["next_attempt_number"],
        "questions": [serialize_student_exam_question(question) for question in questions],
    }

def latest_course_assessment_attempts_by_assessment_id(
    *,
    student: User,
    course: Course,
) -> dict[int, CourseAssessmentAttempt]:
    latest_attempts: dict[int, CourseAssessmentAttempt] = {}
    for attempt in CourseAssessmentAttempt.objects.filter(
        student=student,
        assessment__course=course,
        assessment__status=CourseAssessment.Status.ACTIVE,
    ).order_by("assessment_id", "-attempt_number", "-id"):
        if attempt.assessment_id not in latest_attempts:
            latest_attempts[attempt.assessment_id] = attempt
    return latest_attempts


def lesson_assessment_unlocked(
    lesson: Lesson,
    *,
    progress_map: dict[int, LessonProgress],
) -> bool:
    progress = progress_map.get(lesson.id)
    return progress is not None and progress.status == LessonProgress.Status.COMPLETED


def lesson_is_unlocked_for_student(
    lesson: Lesson,
    *,
    lessons: list[Lesson],
    progress_map: dict[int, LessonProgress],
    assessment_by_lesson_id: dict[int, CourseAssessment],
    latest_attempts_by_assessment_id: dict[int, CourseAssessmentAttempt],
) -> bool:
    lesson_index = next((index for index, item in enumerate(lessons) if item.id == lesson.id), -1)
    if lesson_index <= 0:
        return True

    previous_lesson = lessons[lesson_index - 1]
    previous_progress = progress_map.get(previous_lesson.id)
    if previous_progress is None or previous_progress.status != LessonProgress.Status.COMPLETED:
        return False

    previous_assessment = assessment_by_lesson_id.get(previous_lesson.id)
    if previous_assessment is None:
        return True

    previous_attempt = latest_attempts_by_assessment_id.get(previous_assessment.id)
    return previous_attempt is not None and previous_attempt.passed


def final_course_assessment_unlocked(
    *,
    lessons: list[Lesson],
    progress_map: dict[int, LessonProgress],
    assessment_by_lesson_id: dict[int, CourseAssessment],
    latest_attempts_by_assessment_id: dict[int, CourseAssessmentAttempt],
) -> bool:
    if not lessons:
        return False

    last_lesson = lessons[-1]
    last_progress = progress_map.get(last_lesson.id)
    if last_progress is None or last_progress.status != LessonProgress.Status.COMPLETED:
        return False

    last_lesson_assessment = assessment_by_lesson_id.get(last_lesson.id)
    if last_lesson_assessment is None:
        return True

    latest_attempt = latest_attempts_by_assessment_id.get(last_lesson_assessment.id)
    return latest_attempt is not None and latest_attempt.passed

def serialize_preparation_category_summary(category: str, *, student: User) -> dict:
    practice_attempts = list(
        PracticeQuestionAttempt.objects.filter(student=student, exam__category=category).select_related("question", "exam")
    )
    mock_attempts = list(MockExamAttempt.objects.filter(student=student, category=category).order_by("-submitted_at", "-id"))
    active_exams = [sync_exam_question_count(exam) for exam in visible_student_exams_queryset().filter(category=category)]
    ready_exams = [exam for exam in active_exams if exam_is_ready_for_student(exam)]
    learning_records = list(LearningRecord.objects.filter(student=student, category=category))
    correct_practice = sum(1 for attempt in practice_attempts if attempt.is_correct)
    practice_accuracy = round((correct_practice / len(practice_attempts)) * 100, 1) if practice_attempts else None
    best_mock_score = max((attempt.score_percent for attempt in mock_attempts), default=None)
    latest_mock_score = mock_attempts[0].score_percent if mock_attempts else None

    return {
        "category": category,
        "label": category.replace("_", " ").title(),
        "course_count": sum(1 for record in learning_records if record.course_id),
        "completed_courses": sum(1 for record in learning_records if record.status == LearningRecord.Status.COMPLETED),
        "in_progress_courses": sum(
            1 for record in learning_records if record.status in {LearningRecord.Status.NOT_STARTED, LearningRecord.Status.IN_PROGRESS}
        ),
        "practice_question_count": visible_practice_questions_queryset(category=category).count(),
        "practice_attempt_count": len(practice_attempts),
        "practice_accuracy": practice_accuracy,
        "mock_attempt_count": len(mock_attempts),
        "best_mock_score": best_mock_score,
        "latest_mock_score": latest_mock_score,
        "available_exam_count": len(ready_exams),
    }


def serialize_practice_question(question: ExamQuestion, *, student: User) -> dict:
    attempts = list(
        PracticeQuestionAttempt.objects.filter(student=student, question=question)
        .select_related("selected_option")
        .order_by("-created_at", "-id")[:5]
    )
    latest_attempt = attempts[0] if attempts else None
    return {
        "question_id": question.id,
        "exam_id": question.exam_id,
        "exam_title": question.exam.title,
        "category": question.exam.category,
        "prompt": question.prompt,
        "instructions": question.instructions,
        "sequence_number": question.sequence_number,
        "points": question.points,
        "options": [serialize_student_exam_option(option) for option in question.answer_options.all() if option.status == ExamAnswerOption.Status.ACTIVE],
        "attempt_count": PracticeQuestionAttempt.objects.filter(student=student, question=question).count(),
        "last_outcome": latest_attempt.is_correct if latest_attempt else None,
    }


def serialize_mock_exam_attempt(attempt: MockExamAttempt) -> dict:
    return {
        "attempt_id": attempt.id,
        "exam_id": attempt.exam_id,
        "exam_title": attempt.exam_title,
        "category": attempt.category,
        "attempt_number": attempt.attempt_number,
        "score_percent": attempt.score_percent,
        "correct_answer_count": attempt.correct_answer_count,
        "total_questions": attempt.total_questions,
        "submitted_at": attempt.submitted_at.isoformat(),
    }


def serialize_student_mock_exam(exam: Exam, *, student: User) -> dict:
    attempts = list(MockExamAttempt.objects.filter(student=student, exam=exam).order_by("-attempt_number"))
    best_score = max((attempt.score_percent for attempt in attempts), default=None)
    last_score = attempts[0].score_percent if attempts else None
    return {
        "exam_id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "category": exam.category,
        "duration_minutes": exam.duration_minutes,
        "question_count": len(active_exam_questions(exam)),
        "attempt_count": len(attempts),
        "best_score": best_score,
        "last_score": last_score,
        "detail_href": f"/student/mock-exams/{exam.id}",
    }


def serialize_student_mock_exam_detail(exam: Exam, *, student: User) -> dict:
    attempts = list(MockExamAttempt.objects.filter(student=student, exam=exam).order_by("-attempt_number"))
    return {
        "exam_id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "category": exam.category,
        "duration_minutes": exam.duration_minutes,
        "question_count": len(active_exam_questions(exam)),
        "attempt_count": len(attempts),
        "next_attempt_number": next_mock_exam_attempt_number(student, exam),
        "best_score": max((attempt.score_percent for attempt in attempts), default=None),
        "last_score": attempts[0].score_percent if attempts else None,
        "questions": [serialize_student_exam_question(question) for question in active_exam_questions(exam)],
    }


def serialize_preparation_summary(user: User) -> dict:
    categories = preparation_categories_for_student(user)
    practice_attempts = list(PracticeQuestionAttempt.objects.filter(student=user).select_related("exam", "question").order_by("-created_at", "-id"))
    mock_attempts = list(MockExamAttempt.objects.filter(student=user).order_by("-submitted_at", "-id"))
    correct_practice = sum(1 for attempt in practice_attempts if attempt.is_correct)
    practice_accuracy = round((correct_practice / len(practice_attempts)) * 100, 1) if practice_attempts else None
    active_exams = [sync_exam_question_count(exam) for exam in visible_student_exams_queryset()]
    mock_ready_exams = [exam for exam in active_exams if exam_is_ready_for_student(exam)]

    return {
        "student_id": user.id,
        "categories": [serialize_preparation_category_summary(category, student=user) for category in categories],
        "study_plan": {
            "items": [build_study_plan_item(category, student=user) for category in categories],
        },
        "performance": {
            "practice_attempt_count": len(practice_attempts),
            "practice_accuracy": practice_accuracy,
            "mock_attempt_count": len(mock_attempts),
            "best_mock_score": max((attempt.score_percent for attempt in mock_attempts), default=None),
            "recent_mock_score": mock_attempts[0].score_percent if mock_attempts else None,
            "category_breakdown": [build_preparation_performance_category(category, student=user) for category in categories],
        },
        "mock_exams": [serialize_student_mock_exam(exam, student=user) for exam in mock_ready_exams],
        "recent_activity": {
            "practice_attempts": [serialize_practice_attempt_summary(attempt) for attempt in practice_attempts[:5]],
            "mock_attempts": [serialize_mock_exam_attempt(attempt) for attempt in mock_attempts[:5]],
        },
    }


def serialize_admin_company_user(user: User) -> dict:
    return {
        "user_id": user.id,
        "name": user.full_name,
        "email": user.email,
        "company_id": user.company_id,
        "company_name": user.company.name if user.company else None,
        "is_active": user.is_active,
    }


def serialize_vacancy_skill_requirement(requirement: VacancySkillRequirement) -> dict:
    return {
        "id": requirement.id,
        "skill_id": requirement.skill_id,
        "skill_name": requirement.skill.name,
        "skill_slug": requirement.skill.slug,
        "requirement_type": requirement.requirement_type,
    }


def serialize_vacancy_language_requirement(requirement: VacancyLanguageRequirement) -> dict:
    return {
        "id": requirement.id,
        "language": requirement.language,
        "language_label": requirement.get_language_display(),
        "minimum_level": requirement.minimum_level,
        "minimum_level_label": requirement.get_minimum_level_display(),
        "requirement_type": requirement.requirement_type,
    }


def serialize_choice_option(value: str, label: str) -> dict:
    return {
        "value": value,
        "label": label,
    }


def default_vacancy_posting_details() -> dict:
    return {
        "job_highlights": "",
        "responsibilities": "",
        "role_change_scope": "",
        "required_experience": "",
        "preferred_experience": "",
        "culture_and_other": "",
        "employment_term": "",
        "probation_period": "",
        "probation_conditions": "",
        "contract_renewal": "",
        "working_hours": "",
        "break_time": "",
        "flex_time": "",
        "overtime": "",
        "compensation_type": "",
        "planned_annual_salary": "",
        "monthly_salary": "",
        "overtime_pay": "",
        "interview_rounds": "",
        "selection_method": "",
        "location_change_scope": "",
        "nearest_station": "",
        "allowances": "",
        "insurance": "",
        "notes": "",
    }


def serialize_vacancy_posting_details(value: dict | None) -> dict:
    details = default_vacancy_posting_details()
    if isinstance(value, dict):
        for key in details:
            details[key] = str(value.get(key, "")).strip()
    return details


def serialize_vacancy(
    vacancy: Vacancy,
    *,
    bookmarked_vacancy_ids: set[int] | None = None,
    active_application_vacancy_ids: set[int] | None = None,
) -> dict:
    skill_requirements = list(vacancy.skill_requirements.all())
    language_requirements = list(vacancy.language_requirements.all())
    return {
        "vacancy_id": vacancy.id,
        "company_id": vacancy.company_id,
        "company_name": vacancy.company.name,
        "company_profile_image": file_url_or_none(vacancy.company.profile_image_file)
        or text_value_or_none(vacancy.company.profile_image),
        "title": vacancy.title,
        "description": vacancy.description,
        "employment_type": vacancy.employment_type,
        "experience_level": vacancy.experience_level,
        "location": vacancy.location,
        "work_style": vacancy.work_style,
        "work_style_label": vacancy.get_work_style_display(),
        "relocation_support": vacancy.relocation_support,
        "min_salary": vacancy.min_salary,
        "max_salary": vacancy.max_salary,
        "posting_details": serialize_vacancy_posting_details(vacancy.posting_details),
        "skill_requirements": [
            serialize_vacancy_skill_requirement(requirement) for requirement in skill_requirements
        ],
        "language_requirements": [
            serialize_vacancy_language_requirement(requirement) for requirement in language_requirements
        ],
        "is_bookmarked": vacancy.id in bookmarked_vacancy_ids if bookmarked_vacancy_ids is not None else False,
        "has_active_application": (
            vacancy.id in active_application_vacancy_ids if active_application_vacancy_ids is not None else False
        ),
        "can_apply": vacancy.id not in active_application_vacancy_ids if active_application_vacancy_ids is not None else True,
        "status": vacancy.status,
        "created_by_id": vacancy.created_by_id,
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
    top_skills = sorted(student_skill.skill.name for student_skill in access.student.student_skills.all())[:3]

    return {
        "candidate_access_id": access.id,
        "source": access.source,
        "student_id": access.student_id,
        "display_name": access.student.full_name if profile_visible else "Private candidate",
        "profile_image": (
            file_url_or_none(student_profile.profile_image_file) or text_value_or_none(student_profile.profile_image)
        )
        if profile_visible
        else None,
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
        "applications_count": getattr(vacancy, "applications_count", 0),
        "posted_at": vacancy.created_at.isoformat(),
        "updated_at": vacancy.updated_at.isoformat(),
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
        "scheduled_start": interview.scheduled_start.isoformat() if interview.scheduled_start else None,
        "meeting_url": interview.meeting_url or None,
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
        "about_me": str(payload.get("about_me", "")).strip(),
        "profile_image": str(payload.get("profile_image", "")).strip(),
        "cover_image": str(payload.get("cover_image", "")).strip(),
    }

    errors = {}
    if not cleaned["name"]:
        errors["name"] = ["This field is required."]

    if errors:
        raise ValidationError(errors)

    return cleaned


def parse_skill_ids(payload: dict, errors: dict) -> list[int]:
    raw_value = payload.get("skill_ids", [])
    if raw_value in (None, ""):
        raw_value = []
    if not isinstance(raw_value, list):
        errors["skill_ids"] = ["This field must be an array of skill IDs."]
        return []

    skill_ids: list[int] = []
    for value in raw_value:
        if not isinstance(value, int):
            errors["skill_ids"] = ["Each skill ID must be an integer."]
            return []
        if value not in skill_ids:
            skill_ids.append(value)

    existing_skill_ids = set(Skill.objects.filter(id__in=skill_ids).values_list("id", flat=True))
    missing_skill_ids = [str(skill_id) for skill_id in skill_ids if skill_id not in existing_skill_ids]
    if missing_skill_ids:
        errors["skill_ids"] = [f"Unknown skill IDs: {', '.join(missing_skill_ids)}."]

    return skill_ids


def parse_required_date(value, field_name: str, errors: dict) -> object | None:
    cleaned_value = str(value or "").strip()
    if not cleaned_value:
        errors[field_name] = ["This field is required."]
        return None
    parsed = parse_date(cleaned_value)
    if parsed is None:
        errors[field_name] = ["Use ISO date format YYYY-MM-DD."]
        return None
    return parsed


def parse_optional_date(value, field_name: str, errors: dict) -> object | None:
    cleaned_value = str(value or "").strip()
    if not cleaned_value:
        return None
    parsed = parse_date(cleaned_value)
    if parsed is None:
        errors[field_name] = ["Use ISO date format YYYY-MM-DD."]
    return parsed


def validate_student_education_payload(payload: dict) -> dict:
    errors = {}
    cleaned = {
        "institution": str(payload.get("institution", "")).strip(),
        "field_of_study": str(payload.get("field_of_study", "")).strip(),
        "completion_status": str(payload.get("completion_status", "")).strip() or StudentEducation.CompletionStatus.IN_PROGRESS,
        "grade": str(payload.get("grade", "")).strip(),
        "activities": str(payload.get("activities", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
    }
    cleaned["skill_ids"] = parse_skill_ids(payload, errors)
    cleaned["start_date"] = parse_required_date(payload.get("start_date"), "start_date", errors)
    cleaned["end_date"] = parse_optional_date(payload.get("end_date"), "end_date", errors)

    if not cleaned["institution"]:
        errors["institution"] = ["This field is required."]
    if not cleaned["field_of_study"]:
        errors["field_of_study"] = ["This field is required."]
    if cleaned["completion_status"] not in StudentEducation.CompletionStatus.values:
        errors["completion_status"] = [
            f"Completion status must be one of: {', '.join(StudentEducation.CompletionStatus.values)}."
        ]

    if errors:
        raise ValidationError(errors)
    return cleaned


def validate_student_experience_payload(payload: dict) -> dict:
    errors = {}
    cleaned = {
        "organization": str(payload.get("organization", "")).strip(),
        "role_title": str(payload.get("role_title", "")).strip(),
        "experience_type": str(payload.get("experience_type", "")).strip() or StudentExperience.ExperienceType.WORK,
        "summary": str(payload.get("summary", "")).strip(),
        "is_current": bool(payload.get("is_current", False)),
    }
    cleaned["skill_ids"] = parse_skill_ids(payload, errors)
    if payload.get("is_current") not in (True, False, None):
        errors["is_current"] = ["This field must be a boolean."]

    cleaned["start_date"] = parse_required_date(payload.get("start_date"), "start_date", errors)
    cleaned["end_date"] = parse_optional_date(payload.get("end_date"), "end_date", errors)

    if not cleaned["organization"]:
        errors["organization"] = ["This field is required."]
    if not cleaned["role_title"]:
        errors["role_title"] = ["This field is required."]
    if cleaned["experience_type"] not in StudentExperience.ExperienceType.values:
        errors["experience_type"] = [
            f"Experience type must be one of: {', '.join(StudentExperience.ExperienceType.values)}."
        ]
    if cleaned["is_current"] and cleaned["end_date"] is not None:
        errors["end_date"] = ["Current experience cannot have an end date."]

    if errors:
        raise ValidationError(errors)
    return cleaned


def validate_student_certificate_payload(payload: dict) -> dict:
    errors = {}
    cleaned = {
        "name": str(payload.get("name", "")).strip(),
        "issuer": str(payload.get("issuer", "")).strip(),
        "credential_id": str(payload.get("credential_id", "")).strip(),
        "credential_url": str(payload.get("credential_url", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
    }
    cleaned["skill_ids"] = parse_skill_ids(payload, errors)
    cleaned["issue_date"] = parse_required_date(payload.get("issue_date"), "issue_date", errors)
    cleaned["expiry_date"] = parse_optional_date(payload.get("expiry_date"), "expiry_date", errors)

    if not cleaned["name"]:
        errors["name"] = ["This field is required."]
    if not cleaned["issuer"]:
        errors["issuer"] = ["This field is required."]

    if errors:
        raise ValidationError(errors)
    return cleaned


def validate_student_resume_payload(payload: dict) -> dict:
    errors = {}
    cleaned = {
        "display_name": str(payload.get("display_name", "")).strip(),
        "file_name": str(payload.get("file_name", "")).strip(),
        "source_type": str(payload.get("source_type", "")).strip() or StudentResume.SourceType.MANUAL,
        "is_active": payload.get("is_active", True),
    }
    if not cleaned["display_name"]:
        errors["display_name"] = ["This field is required."]
    if not cleaned["file_name"]:
        errors["file_name"] = ["This field is required."]
    if cleaned["source_type"] not in StudentResume.SourceType.values:
        errors["source_type"] = [f"Source type must be one of: {', '.join(StudentResume.SourceType.values)}."]
    if not isinstance(cleaned["is_active"], bool):
        errors["is_active"] = ["This field must be a boolean."]
    if errors:
        raise ValidationError(errors)
    return cleaned


def validate_student_availability_payload(payload: dict) -> dict:
    errors = {}
    cleaned = {
        "job_search_status": str(payload.get("job_search_status", "")).strip(),
        "interview_availability": str(payload.get("interview_availability", "")).strip(),
        "scheduling_notes": str(payload.get("scheduling_notes", "")).strip(),
    }
    cleaned["earliest_start_date"] = parse_optional_date(payload.get("earliest_start_date"), "earliest_start_date", errors)

    if cleaned["job_search_status"] and cleaned["job_search_status"] not in StudentAvailabilityProfile.JobSearchStatus.values:
        errors["job_search_status"] = [
            f"Job search status must be one of: {', '.join(StudentAvailabilityProfile.JobSearchStatus.values)}."
        ]

    if errors:
        raise ValidationError(errors)
    return cleaned


def validate_company_profile_payload(payload: dict) -> dict:
    def validate_string_list(field_name: str) -> list[str]:
        raw_value = payload.get(field_name, [])
        if raw_value in (None, ""):
            return []
        if not isinstance(raw_value, list):
            raise ValidationError({field_name: ["This field must be a list."]})

        cleaned_values = []
        for entry in raw_value:
            cleaned_entry = str(entry).strip()
            if cleaned_entry:
                cleaned_values.append(cleaned_entry)
        return cleaned_values

    cleaned = {
        "name": str(payload.get("name", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
        "profile_image": str(payload.get("profile_image", "")).strip(),
        "cover_image": str(payload.get("cover_image", "")).strip(),
        "job_posting_id": str(payload.get("job_posting_id", "")).strip(),
        "founder_name": str(payload.get("founder_name", "")).strip(),
        "headquarters_address": str(payload.get("headquarters_address", "")).strip(),
        "office_locations": str(payload.get("office_locations", "")).strip(),
        "founded_at": str(payload.get("founded_at", "")).strip(),
        "website_url": str(payload.get("website_url", "")).strip(),
        "industry": str(payload.get("industry", "")).strip(),
        "company_points": validate_string_list("company_points"),
        "business_domains": validate_string_list("business_domains"),
        "business_models": validate_string_list("business_models"),
        "employee_count_label": str(payload.get("employee_count_label", "")).strip(),
        "market_category": str(payload.get("market_category", "")).strip(),
        "capital_label": str(payload.get("capital_label", "")).strip(),
        "revenue_label": str(payload.get("revenue_label", "")).strip(),
        "tagline": str(payload.get("tagline", "")).strip(),
        "company_features": str(payload.get("company_features", "")).strip(),
        "additional_company_info": str(payload.get("additional_company_info", "")).strip(),
    }
    errors = {}
    if not cleaned["name"]:
        errors["name"] = ["This field is required."]
    if cleaned["profile_image"].startswith("data:"):
        errors["profile_image"] = ["Upload profile images through the media upload endpoint."]
    if cleaned["cover_image"].startswith("data:"):
        errors["cover_image"] = ["Upload cover images through the media upload endpoint."]
    if errors:
        raise ValidationError(errors)
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


def validate_student_message_thread_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    participant_name = payload.get("participant_name")
    if not isinstance(participant_name, str) or not participant_name.strip():
        errors["participant_name"] = ["This field is required."]
    else:
        cleaned["participant_name"] = participant_name.strip()

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        errors["message"] = ["This field is required."]
    else:
        cleaned["message"] = message.strip()

    company_name = payload.get("company_name", "")
    if company_name is None:
        company_name = ""
    if not isinstance(company_name, str):
        errors["company_name"] = ["Company name must be a string."]
    else:
        cleaned["company_name"] = company_name.strip()

    role_label = payload.get("role_label", "")
    if role_label is None:
        role_label = ""
    if not isinstance(role_label, str):
        errors["role_label"] = ["Role label must be a string."]
    else:
        cleaned["role_label"] = role_label.strip()

    participant_user = None
    raw_participant_user_id = payload.get("participant_user_id")
    if raw_participant_user_id not in (None, ""):
        try:
            participant_user = User.objects.select_related("company").get(pk=int(raw_participant_user_id), role=User.Role.COMPANY)
        except (TypeError, ValueError):
            errors["participant_user_id"] = ["A valid participant_user_id is required."]
        except User.DoesNotExist:
            errors["participant_user_id"] = ["Selected participant user does not exist."]

    category = payload.get("category", MessageThread.Category.APPLICATIONS)
    valid_categories = {choice for choice, _ in MessageThread.Category.choices}
    if category not in valid_categories:
        errors["category"] = ["Category must be one of: applications, interviews, support."]
    else:
        cleaned["category"] = category

    if errors:
        raise ValidationError(errors)

    cleaned["participant_user"] = participant_user
    return cleaned


def validate_student_message_compose_contact_access(user: User, participant_user: User | None) -> None:
    if participant_user is None or participant_user.company_id is None:
        return

    related_company_ids = set(Application.objects.filter(student=user).values_list("company_id", flat=True)) | set(
        Interview.objects.filter(student=user).values_list("company_id", flat=True)
    )
    if participant_user.company_id not in related_company_ids:
        raise ValidationError({"participant_user_id": ["Selected contact is not available for this student."]})


def find_existing_message_thread(user: User, payload: dict) -> MessageThread | None:
    participant_user = payload["participant_user"]
    if participant_user is not None:
        return (
            MessageThread.objects.filter(student=user, participant_user=participant_user)
            .order_by("-updated_at", "-id")
            .first()
        )

    return (
        MessageThread.objects.filter(
            student=user,
            participant_user__isnull=True,
            participant_name=payload["participant_name"],
            company_name=payload["company_name"],
            role_label=payload["role_label"],
        )
        .order_by("-updated_at", "-id")
        .first()
    )


def validate_student_message_payload(payload: dict) -> dict:
    body = payload.get("body")
    if not isinstance(body, str) or not body.strip():
        raise ValidationError({"body": ["This field is required."]})
    return {"body": body.strip()}


def validate_student_message_thread_update_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    if "is_starred" in payload:
        if not isinstance(payload.get("is_starred"), bool):
            errors["is_starred"] = ["This field must be a boolean."]
        else:
            cleaned["is_starred"] = payload["is_starred"]

    if "mark_as_read" in payload:
        if not isinstance(payload.get("mark_as_read"), bool):
            errors["mark_as_read"] = ["This field must be a boolean."]
        else:
            cleaned["mark_as_read"] = payload["mark_as_read"]

    if not cleaned and not errors:
        errors["non_field_errors"] = ["At least one updatable field is required."]

    if errors:
        raise ValidationError(errors)

    return cleaned


def validate_company_message_thread_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    student_user = None
    raw_student_user_id = payload.get("participant_user_id")
    if raw_student_user_id in (None, ""):
        errors["participant_user_id"] = ["This field is required."]
    else:
        try:
            student_user = User.objects.get(pk=int(raw_student_user_id), role=User.Role.STUDENT)
        except (TypeError, ValueError):
            errors["participant_user_id"] = ["A valid participant_user_id is required."]
        except User.DoesNotExist:
            errors["participant_user_id"] = ["Selected student does not exist."]

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        errors["message"] = ["This field is required."]
    else:
        cleaned["message"] = message.strip()

    category = payload.get("category", MessageThread.Category.APPLICATIONS)
    valid_categories = {choice for choice, _ in MessageThread.Category.choices}
    if category not in valid_categories:
        errors["category"] = ["Category must be one of: applications, interviews, support."]
    else:
        cleaned["category"] = category

    if errors:
        raise ValidationError(errors)

    cleaned["student_user"] = student_user
    return cleaned


def validate_company_message_compose_contact_access(user: User, student_user: User) -> None:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if student_user.role != User.Role.STUDENT or not student_user.is_active:
        raise PermissionDenied("Selected student is not available for company messaging.")

    has_active_candidate_access = CandidateReviewAccess.objects.filter(
        company=company,
        student=student_user,
        is_active=True,
        student__role=User.Role.STUDENT,
        student__is_active=True,
    ).exists()
    if not has_active_candidate_access:
        raise PermissionDenied("Company messaging is limited to students with an approved candidate access context.")


def company_message_thread_role_label(user: User) -> str:
    membership = CompanyMember.objects.filter(company_id=user.company_id, user=user).only("role").first()
    if membership is not None:
        return membership.role.replace("_", " ").title()
    return "Company contact"


def validate_candidate_note_payload(payload: dict) -> dict:
    body = str(payload.get("body", "")).strip()
    if not body:
        raise ValidationError({"body": ["This field is required."]})
    return {"body": body}


def validate_interview_request_payload(payload: dict) -> dict:
    purpose = str(payload.get("purpose", "")).strip()
    role_context = str(payload.get("role_context", "")).strip()
    raw_start_at = str(payload.get("start_at", "")).strip()
    raw_end_at = str(payload.get("end_at", "")).strip()
    if not purpose:
        raise ValidationError({"purpose": ["This field is required."]})
    cleaned = {
        "purpose": purpose,
        "role_context": role_context,
    }

    if not raw_start_at and not raw_end_at:
        return cleaned

    start_at = parse_datetime(raw_start_at)
    end_at = parse_datetime(raw_end_at)
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
        raise ValidationError({"end_at": ["Interview end time must be after the start time."]})

    cleaned["start_at"] = start_at
    cleaned["end_at"] = end_at
    return cleaned


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


def get_admin_company_queryset():
    return Company.objects.annotate(
        user_count=Count("users", distinct=True),
        vacancy_count=Count("vacancies", distinct=True),
        active_vacancy_count=Count(
            "vacancies",
            filter=Q(vacancies__status=Vacancy.Status.ACTIVE),
            distinct=True,
        ),
    )


def validate_admin_course_payload(payload: dict, *, require_preview: bool = True) -> dict:
    title = str(payload.get("title", "")).strip()
    description = str(payload.get("description", "")).strip()
    category = str(payload.get("category", "")).strip()
    difficulty_level = str(payload.get("difficulty_level", "")).strip()
    thumbnail_image = str(payload.get("thumbnail_image", "")).strip()
    thumbnail_alt_text = str(payload.get("thumbnail_alt_text", "")).strip()
    preview_title = str(payload.get("preview_title", "")).strip()
    preview_short_description = str(payload.get("preview_short_description", "")).strip()
    preview_video_url = str(payload.get("preview_video_url", "")).strip()
    preview_thumbnail_image = str(payload.get("preview_thumbnail_image", "")).strip()
    preview_access_type = str(payload.get("preview_access_type", "")).strip().lower()
    preview_status = str(payload.get("preview_status", "")).strip().lower()
    preview_thumbnail_upload_pending = bool(payload.get("preview_thumbnail_upload_pending", False))
    status = str(payload.get("status", Course.Status.DRAFT)).strip().lower()
    raw_estimated_hours = payload.get("estimated_hours", 0)
    raw_preview_duration = payload.get("preview_duration")
    raw_preview_order = payload.get("preview_order")

    errors = {}
    if not title:
        errors["title"] = ["This field is required."]
    if not category:
        errors["category"] = ["This field is required."]
    if require_preview and not preview_title:
        errors["preview_title"] = ["This field is required."]
    if require_preview and not preview_short_description:
        errors["preview_short_description"] = ["This field is required."]
    if require_preview and not preview_video_url:
        errors["preview_video_url"] = ["This field is required."]
    if require_preview and not preview_thumbnail_image and not preview_thumbnail_upload_pending:
        errors["preview_thumbnail_image"] = ["Provide a preview image URL or upload a preview image."]
    if thumbnail_image.startswith("data:"):
        errors["thumbnail_image"] = ["Upload thumbnails through the course thumbnail upload endpoint."]
    if preview_thumbnail_image.startswith("data:"):
        errors["preview_thumbnail_image"] = ["Upload preview images through the course preview image upload endpoint."]
    if status not in Course.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(Course.Status.values)}."]
    if preview_access_type:
        if preview_access_type not in Course.PreviewAccessType.values:
            errors["preview_access_type"] = [f"Preview access type must be one of: {', '.join(Course.PreviewAccessType.values)}."]
    elif require_preview:
        errors["preview_access_type"] = [f"Preview access type must be one of: {', '.join(Course.PreviewAccessType.values)}."]
    if preview_status:
        if preview_status not in Course.PreviewStatus.values:
            errors["preview_status"] = [f"Preview status must be one of: {', '.join(Course.PreviewStatus.values)}."]
    elif require_preview:
        errors["preview_status"] = [f"Preview status must be one of: {', '.join(Course.PreviewStatus.values)}."]
    if len(preview_short_description) > 500:
        errors["preview_short_description"] = ["Preview short description must be 500 characters or fewer."]
    if len(thumbnail_alt_text) > 255:
        errors["thumbnail_alt_text"] = ["Thumbnail alt text must be 255 characters or fewer."]

    try:
        estimated_hours = int(raw_estimated_hours)
    except (TypeError, ValueError):
        estimated_hours = 0
        errors["estimated_hours"] = ["Estimated hours must be a valid integer."]
    else:
        if estimated_hours < 0:
            errors["estimated_hours"] = ["Estimated hours must be zero or greater."]

    preview_duration = None
    if raw_preview_duration not in (None, ""):
        try:
            preview_duration = int(raw_preview_duration)
        except (TypeError, ValueError):
            errors["preview_duration"] = ["Preview duration must be a valid integer."]
        else:
            if preview_duration <= 0:
                errors["preview_duration"] = ["Preview duration must be greater than zero."]
    elif require_preview:
        errors["preview_duration"] = ["Preview duration must be a valid integer."]

    preview_order = None
    if raw_preview_order not in (None, ""):
        try:
            preview_order = int(raw_preview_order)
        except (TypeError, ValueError):
            errors["preview_order"] = ["Preview order must be a valid integer."]
        else:
            if preview_order <= 0:
                errors["preview_order"] = ["Preview order must be greater than zero."]
    elif require_preview:
        errors["preview_order"] = ["Preview order must be a valid integer."]

    preview_video_url_error = http_url_error(preview_video_url, field_label="Preview video URL")
    if preview_video_url_error:
        errors["preview_video_url"] = [preview_video_url_error]

    preview_thumbnail_image_error = http_url_error(
        preview_thumbnail_image,
        field_label="Preview image URL",
        allow_relative_path=True,
    )
    if preview_thumbnail_image_error:
        errors["preview_thumbnail_image"] = [preview_thumbnail_image_error]

    if errors:
        raise ValidationError(errors)

    return {
        "title": title,
        "description": description,
        "category": category,
        "difficulty_level": difficulty_level,
        "estimated_hours": estimated_hours,
        "thumbnail_image": thumbnail_image,
        "thumbnail_alt_text": thumbnail_alt_text,
        "preview_title": preview_title,
        "preview_short_description": preview_short_description,
        "preview_video_url": preview_video_url,
        "preview_thumbnail_image": preview_thumbnail_image,
        "preview_duration": preview_duration,
        "preview_access_type": preview_access_type,
        "preview_order": preview_order,
        "preview_status": preview_status,
        "status": status,
    }


def validate_admin_lesson_payload(payload: dict) -> dict:
    title = str(payload.get("title", "")).strip()
    summary = str(payload.get("summary", "")).strip()
    content = str(payload.get("content", "")).strip()
    transcript = str(payload.get("transcript", "")).strip()
    video_url = str(payload.get("video_url", "")).strip()
    status = str(payload.get("status", Lesson.Status.DRAFT)).strip().lower()
    raw_sequence_number = payload.get("sequence_number")

    errors = {}
    if not title:
        errors["title"] = ["This field is required."]
    if raw_sequence_number in (None, ""):
        errors["sequence_number"] = ["This field is required."]
    if status not in Lesson.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(Lesson.Status.values)}."]

    try:
        sequence_number = int(raw_sequence_number)
    except (TypeError, ValueError):
        sequence_number = 0
        errors["sequence_number"] = ["Sequence number must be a valid integer."]
    else:
        if sequence_number <= 0:
            errors["sequence_number"] = ["Sequence number must be greater than zero."]

    video_url_error = youtube_video_url_error(video_url)
    if video_url_error:
        errors["video_url"] = [video_url_error]

    if errors:
        raise ValidationError(errors)

    return {
        "title": title,
        "summary": summary,
        "content": content,
        "transcript": transcript,
        "video_url": video_url,
        "sequence_number": sequence_number,
        "status": status,
    }


def validate_admin_exam_payload(payload: dict) -> dict:
    title = str(payload.get("title", "")).strip()
    description = str(payload.get("description", "")).strip()
    category = str(payload.get("category", "")).strip()
    status = str(payload.get("status", Exam.Status.DRAFT)).strip().lower()
    raw_duration_minutes = payload.get("duration_minutes", 0)
    raw_passing_score_percent = payload.get("passing_score_percent", 70)
    raw_question_count = payload.get("question_count", 0)
    raw_max_attempts = payload.get("max_attempts", 3)

    errors = {}
    if not title:
        errors["title"] = ["This field is required."]
    if not category:
        errors["category"] = ["This field is required."]
    if status not in Exam.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(Exam.Status.values)}."]

    try:
        duration_minutes = int(raw_duration_minutes)
    except (TypeError, ValueError):
        duration_minutes = 0
        errors["duration_minutes"] = ["Duration minutes must be a valid integer."]
    else:
        if duration_minutes < 0:
            errors["duration_minutes"] = ["Duration minutes must be zero or greater."]

    try:
        passing_score_percent = int(raw_passing_score_percent)
    except (TypeError, ValueError):
        passing_score_percent = 70
        errors["passing_score_percent"] = ["Passing score percent must be a valid integer."]
    else:
        if passing_score_percent < 0 or passing_score_percent > 100:
            errors["passing_score_percent"] = ["Passing score percent must be between 0 and 100."]

    try:
        question_count = int(raw_question_count)
    except (TypeError, ValueError):
        question_count = 0
        errors["question_count"] = ["Question count must be a valid integer."]
    else:
        if question_count < 0:
            errors["question_count"] = ["Question count must be zero or greater."]

    try:
        max_attempts = int(raw_max_attempts)
    except (TypeError, ValueError):
        max_attempts = 3
        errors["max_attempts"] = ["Max attempts must be a valid integer."]
    else:
        if max_attempts <= 0:
            errors["max_attempts"] = ["Max attempts must be greater than zero."]

    if errors:
        raise ValidationError(errors)

    return {
        "title": title,
        "description": description,
        "category": category,
        "duration_minutes": duration_minutes,
        "passing_score_percent": passing_score_percent,
        "question_count": question_count,
        "max_attempts": max_attempts,
        "status": status,
    }


def validate_admin_exam_question_payload(payload: dict) -> dict:
    prompt = str(payload.get("prompt", "")).strip()
    instructions = str(payload.get("instructions", "")).strip()
    question_type = str(payload.get("question_type", ExamQuestion.QuestionType.SINGLE_CHOICE)).strip().lower()
    status = str(payload.get("status", ExamQuestion.Status.DRAFT)).strip().lower()
    raw_sequence_number = payload.get("sequence_number")
    raw_points = payload.get("points", 1)

    errors = {}
    if not prompt:
        errors["prompt"] = ["This field is required."]
    if question_type not in ExamQuestion.QuestionType.values:
        errors["question_type"] = [f"Question type must be one of: {', '.join(ExamQuestion.QuestionType.values)}."]
    if status not in ExamQuestion.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(ExamQuestion.Status.values)}."]

    try:
        sequence_number = int(raw_sequence_number)
    except (TypeError, ValueError):
        sequence_number = 0
        errors["sequence_number"] = ["Sequence number must be a valid integer."]
    else:
        if sequence_number <= 0:
            errors["sequence_number"] = ["Sequence number must be greater than zero."]

    try:
        points = int(raw_points)
    except (TypeError, ValueError):
        points = 1
        errors["points"] = ["Points must be a valid integer."]
    else:
        if points <= 0:
            errors["points"] = ["Points must be greater than zero."]

    if errors:
        raise ValidationError(errors)

    return {
        "prompt": prompt,
        "instructions": instructions,
        "question_type": question_type,
        "sequence_number": sequence_number,
        "points": points,
        "status": status,
    }


def validate_admin_exam_answer_option_payload(payload: dict) -> dict:
    option_text = str(payload.get("option_text", "")).strip()
    status = str(payload.get("status", ExamAnswerOption.Status.ACTIVE)).strip().lower()
    raw_sequence_number = payload.get("sequence_number")
    is_correct = payload.get("is_correct", False)

    errors = {}
    if not option_text:
        errors["option_text"] = ["This field is required."]
    if status not in ExamAnswerOption.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(ExamAnswerOption.Status.values)}."]
    if not isinstance(is_correct, bool):
        errors["is_correct"] = ["This field must be a boolean."]

    try:
        sequence_number = int(raw_sequence_number)
    except (TypeError, ValueError):
        sequence_number = 0
        errors["sequence_number"] = ["Sequence number must be a valid integer."]
    else:
        if sequence_number <= 0:
            errors["sequence_number"] = ["Sequence number must be greater than zero."]

    if errors:
        raise ValidationError(errors)

    return {
        "option_text": option_text,
        "sequence_number": sequence_number,
        "is_correct": is_correct,
        "status": status,
    }


def validate_student_lesson_progress_payload(payload: dict) -> dict:
    status = str(payload.get("status", "")).strip().lower()
    allowed_statuses = {
        LessonProgress.Status.IN_PROGRESS,
        LessonProgress.Status.COMPLETED,
    }
    if status not in allowed_statuses:
        raise ValidationError(
            {
                "status": [
                    f"Status must be one of: {', '.join(sorted(allowed_statuses))}."
                ]
            }
        )

    return {"status": status}


def validate_student_course_review_payload(payload: dict) -> dict:
    raw_rating = payload.get("rating")
    review_text = str(payload.get("review_text", "")).strip()
    errors = {}

    try:
        rating = int(raw_rating)
    except (TypeError, ValueError):
        rating = 0
        errors["rating"] = ["Rating must be a valid integer."]
    else:
        if rating < 1 or rating > 5:
            errors["rating"] = ["Rating must be between 1 and 5."]

    if len(review_text) > 1200:
        errors["review_text"] = ["Review text must be 1200 characters or fewer."]

    if errors:
        raise ValidationError(errors)

    return {
        "rating": rating,
        "review_text": review_text,
    }


def validate_exam_submission_payload(payload: dict, *, exam: Exam) -> dict:
    raw_answers = payload.get("answers")
    if not isinstance(raw_answers, list) or not raw_answers:
        raise ValidationError({"answers": ["A non-empty answers list is required."]})

    questions = {
        question.id: question
        for question in active_exam_questions(exam)
    }
    if not questions:
        raise ValidationError({"exam": ["This exam has no active questions."]})

    answers_by_question_id: dict[int, int] = {}
    errors: list[str] = []
    for index, raw_item in enumerate(raw_answers):
        if not isinstance(raw_item, dict):
            errors.append(f"Answer #{index + 1} must be an object.")
            continue

        try:
            question_id = int(raw_item.get("question_id"))
            selected_option_id = int(raw_item.get("selected_option_id"))
        except (TypeError, ValueError):
            errors.append(f"Answer #{index + 1} must include valid question_id and selected_option_id values.")
            continue

        question = questions.get(question_id)
        if question is None:
            errors.append(f"Answer #{index + 1} references an invalid question.")
            continue

        valid_option_ids = {
            option.id
            for option in question.answer_options.all()
            if option.status == ExamAnswerOption.Status.ACTIVE
        }
        if selected_option_id not in valid_option_ids:
            errors.append(f"Answer #{index + 1} references an invalid option for the selected question.")
            continue

        if question_id in answers_by_question_id:
            errors.append(f"Answer #{index + 1} duplicates question {question.sequence_number}.")
            continue

        answers_by_question_id[question_id] = selected_option_id

    if len(answers_by_question_id) != len(questions):
        missing_questions = sorted(set(questions.keys()) - set(answers_by_question_id.keys()))
        if missing_questions:
            errors.append("All active exam questions must be answered before submission.")

    if errors:
        raise ValidationError({"answers": errors})

    return {"answers_by_question_id": answers_by_question_id}


def validate_course_assessment_submission_payload(
    payload: dict,
    *,
    assessment: CourseAssessment,
    generated_questions: list[dict] | None = None,
) -> dict:
    raw_answers = payload.get("answers")
    if not isinstance(raw_answers, list) or not raw_answers:
        raise ValidationError({"answers": ["A non-empty answers list is required."]})

    if generated_questions is not None:
        questions = {
            int(question["question_id"]): question
            for question in generated_questions
        }
    else:
        questions = {
            question.id: question
            for question in active_course_assessment_questions(assessment)
        }
    if not questions:
        raise ValidationError({"assessment": ["This assessment has no active questions."]})

    answers_by_question_id: dict[int, list[int]] = {}
    errors: list[str] = []
    for index, raw_item in enumerate(raw_answers):
        if not isinstance(raw_item, dict):
            errors.append(f"Answer #{index + 1} must be an object.")
            continue

        try:
            question_id = int(raw_item.get("question_id"))
        except (TypeError, ValueError):
            errors.append(f"Answer #{index + 1} must include a valid question_id value.")
            continue

        question = questions.get(question_id)
        if question is None:
            errors.append(f"Answer #{index + 1} references an unavailable question.")
            continue

        raw_selected_option_ids = raw_item.get("selected_option_ids")
        if not isinstance(raw_selected_option_ids, list) or not raw_selected_option_ids:
            errors.append(f"Answer #{index + 1} must include a non-empty selected_option_ids list.")
            continue

        try:
            selected_option_ids = [int(option_id) for option_id in raw_selected_option_ids]
        except (TypeError, ValueError):
            errors.append(f"Answer #{index + 1} contains an invalid selected option id.")
            continue

        if generated_questions is not None:
            active_option_ids = {int(option["option_id"]) for option in question["options"]}
        else:
            active_option_ids = {
                option.id
                for option in question.options.all()
                if option.status == CourseAssessmentOption.Status.ACTIVE
            }
        if not set(selected_option_ids).issubset(active_option_ids):
            question_sequence_number = question["sequence_number"] if generated_questions is not None else question.sequence_number
            errors.append(f"Answer #{index + 1} contains an invalid option for question {question_sequence_number}.")
            continue

        unique_option_ids = sorted(set(selected_option_ids))
        if (
            (
                question["question_type"]
                if generated_questions is not None
                else question.question_type
            )
            == CourseAssessmentQuestion.QuestionType.SINGLE_CHOICE
            and len(unique_option_ids) != 1
        ):
            question_sequence_number = question["sequence_number"] if generated_questions is not None else question.sequence_number
            errors.append(f"Question {question_sequence_number} requires exactly one selected option.")
            continue

        answers_by_question_id[question_id] = unique_option_ids

    if len(answers_by_question_id) != len(questions):
        missing_count = len(questions) - len(answers_by_question_id)
        if missing_count > 0:
            errors.append("Every question must be answered before submitting.")

    if errors:
        raise ValidationError({"answers": errors})

    return {"answers_by_question_id": answers_by_question_id}


def validate_skill_selection_payload(raw_value, field_name: str) -> tuple[list[Skill], list[str]]:
    if raw_value in (None, ""):
        return [], []
    if not isinstance(raw_value, list):
        return [], ["This field must be a list of skill ids."]

    cleaned_ids: list[int] = []
    errors: list[str] = []
    for raw_item in raw_value:
        try:
            skill_id = int(raw_item)
        except (TypeError, ValueError):
            errors.append("Each skill id must be a valid integer.")
            continue
        cleaned_ids.append(skill_id)

    if len(set(cleaned_ids)) != len(cleaned_ids):
        errors.append("Duplicate skill ids are not allowed.")

    if errors:
        return [], errors

    skills_by_id = Skill.objects.in_bulk(cleaned_ids)
    missing_ids = [str(skill_id) for skill_id in cleaned_ids if skill_id not in skills_by_id]
    if missing_ids:
        return [], [f"Unknown skill ids: {', '.join(missing_ids)}."]

    return [skills_by_id[skill_id] for skill_id in cleaned_ids], []


def validate_language_requirements_payload(raw_value) -> tuple[list[dict], list[str]]:
    if raw_value in (None, ""):
        return [], []
    if not isinstance(raw_value, list):
        return [], ["This field must be a list of language requirement objects."]

    cleaned_requirements: list[dict] = []
    errors: list[str] = []
    seen_languages: set[str] = set()

    for index, raw_item in enumerate(raw_value):
        if not isinstance(raw_item, dict):
            errors.append(f"Language requirement #{index + 1} must be an object.")
            continue

        language = str(raw_item.get("language", "")).strip().lower()
        minimum_level = str(raw_item.get("minimum_level", "")).strip().lower()
        requirement_type = str(raw_item.get("requirement_type", "")).strip().lower()

        if language not in VacancyLanguageRequirement.Language.values:
            errors.append(
                f"Language requirement #{index + 1} must use one of: {', '.join(VacancyLanguageRequirement.Language.values)}."
            )
            continue
        if minimum_level not in VacancyLanguageRequirement.Level.values:
            errors.append(
                f"Language requirement #{index + 1} minimum_level must be one of: {', '.join(VacancyLanguageRequirement.Level.values)}."
            )
            continue
        if requirement_type not in VacancyLanguageRequirement.RequirementType.values:
            errors.append(
                f"Language requirement #{index + 1} requirement_type must be one of: {', '.join(VacancyLanguageRequirement.RequirementType.values)}."
            )
            continue
        if language in seen_languages:
            errors.append(f"Language requirement #{index + 1} duplicates the {language} requirement.")
            continue

        seen_languages.add(language)
        cleaned_requirements.append(
            {
                "language": language,
                "minimum_level": minimum_level,
                "requirement_type": requirement_type,
            }
        )

    return cleaned_requirements, errors


def validate_vacancy_payload(payload: dict) -> dict:
    cleaned = {
        "title": str(payload.get("title", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
        "employment_type": str(payload.get("employment_type", "")).strip(),
        "experience_level": str(payload.get("experience_level", "")).strip(),
        "location": str(payload.get("location", "")).strip(),
        "work_style": str(payload.get("work_style", Vacancy.WorkStyle.ONSITE)).strip(),
        "status": str(payload.get("status", Vacancy.Status.DRAFT)).strip(),
    }
    raw_posting_details = payload.get("posting_details", {})
    raw_relocation_support = payload.get("relocation_support", False)
    raw_min_salary = payload.get("min_salary")
    raw_max_salary = payload.get("max_salary")
    required_skills, required_skill_errors = validate_skill_selection_payload(
        payload.get("required_skill_ids", []),
        "required_skill_ids",
    )
    preferred_skills, preferred_skill_errors = validate_skill_selection_payload(
        payload.get("preferred_skill_ids", []),
        "preferred_skill_ids",
    )
    language_requirements, language_requirement_errors = validate_language_requirements_payload(
        payload.get("language_requirements", []),
    )
    errors = {}

    posting_details = default_vacancy_posting_details()
    if not isinstance(raw_posting_details, dict):
        errors["posting_details"] = ["This field must be an object."]
    else:
        posting_details = serialize_vacancy_posting_details(raw_posting_details)

    for field in ("title", "description", "employment_type", "experience_level", "location"):
        if not cleaned[field]:
            errors[field] = ["This field is required."]

    if cleaned["work_style"] not in Vacancy.WorkStyle.values:
        errors["work_style"] = [f"Work style must be one of: {', '.join(Vacancy.WorkStyle.values)}."]
    if cleaned["status"] not in Vacancy.Status.values:
        errors["status"] = [f"Status must be one of: {', '.join(Vacancy.Status.values)}."]
    if not isinstance(raw_relocation_support, bool):
        errors["relocation_support"] = ["This field must be a boolean."]

    min_salary = None
    if raw_min_salary not in (None, ""):
        try:
            min_salary = int(raw_min_salary)
        except (TypeError, ValueError):
            errors["min_salary"] = ["This field must be an integer."]

    max_salary = None
    if raw_max_salary not in (None, ""):
        try:
            max_salary = int(raw_max_salary)
        except (TypeError, ValueError):
            errors["max_salary"] = ["This field must be an integer."]

    if min_salary is not None and min_salary < 0:
        errors["min_salary"] = ["This field must be zero or greater."]
    if max_salary is not None and max_salary < 0:
        errors["max_salary"] = ["This field must be zero or greater."]
    if min_salary is not None and max_salary is not None and min_salary > max_salary:
        errors["max_salary"] = ["Maximum salary must be greater than or equal to minimum salary."]
    if required_skill_errors:
        errors["required_skill_ids"] = required_skill_errors
    if preferred_skill_errors:
        errors["preferred_skill_ids"] = preferred_skill_errors
    if language_requirement_errors:
        errors["language_requirements"] = language_requirement_errors

    overlap_skill_ids = {skill.id for skill in required_skills}.intersection(skill.id for skill in preferred_skills)
    if overlap_skill_ids:
        errors["preferred_skill_ids"] = ["A skill cannot be both required and preferred for the same vacancy."]

    if errors:
        raise ValidationError(errors)

    return {
        **cleaned,
        "relocation_support": raw_relocation_support,
        "min_salary": min_salary,
        "max_salary": max_salary,
        "posting_details": posting_details,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "language_requirements": language_requirements,
    }


def validate_application_payload(payload: dict) -> dict:
    raw_vacancy_id = payload.get("vacancy_id")
    if raw_vacancy_id in (None, ""):
        raise ValidationError({"vacancy_id": ["This field is required."]})

    try:
        vacancy_id = int(raw_vacancy_id)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"vacancy_id": ["A valid vacancy_id is required."]}) from exc

    return {"vacancy_id": vacancy_id}


def validate_admin_vacancy_payload(payload: dict) -> dict:
    cleaned = validate_vacancy_payload(payload)
    raw_company_id = payload.get("company_id")
    raw_created_by_id = payload.get("created_by_id")
    errors = {}

    company = None
    created_by = None

    if raw_company_id in (None, ""):
        errors["company_id"] = ["This field is required."]
    else:
        try:
            company = Company.objects.get(pk=int(raw_company_id))
        except (TypeError, ValueError):
            errors["company_id"] = ["A valid company_id is required."]
        except Company.DoesNotExist:
            errors["company_id"] = ["Selected company does not exist."]

    if raw_created_by_id in (None, ""):
        errors["created_by_id"] = ["This field is required."]
    else:
        try:
            created_by = User.objects.select_related("company").get(pk=int(raw_created_by_id))
        except (TypeError, ValueError):
            errors["created_by_id"] = ["A valid created_by_id is required."]
        except User.DoesNotExist:
            errors["created_by_id"] = ["Selected company user does not exist."]

    if created_by is not None and created_by.role != User.Role.COMPANY:
        errors["created_by_id"] = ["Vacancies must be created by company users."]

    if company is not None and created_by is not None and created_by.company_id != company.id:
        errors["created_by_id"] = ["Selected company user must belong to the selected company."]

    if errors:
        raise ValidationError(errors)

    return {
        **cleaned,
        "company": company,
        "created_by": created_by,
    }


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
        .prefetch_related("skill_requirements__skill", "language_requirements")
        .first()
    )
    if vacancy is None:
        raise ValidationError({"vacancy_id": ["Vacancy was not found for this company context."]})
    return vacancy


def visible_student_vacancies_queryset():
    return (
        Vacancy.objects.filter(status=Vacancy.Status.ACTIVE, company__is_active=True)
        .select_related("company", "created_by")
        .prefetch_related("skill_requirements__skill", "language_requirements")
    )


def visible_student_vacancies_base_queryset():
    return Vacancy.objects.filter(status=Vacancy.Status.ACTIVE, company__is_active=True)


def matchable_students_queryset():
    return User.objects.filter(role=User.Role.STUDENT, is_active=True).order_by("id")


def get_visible_student_vacancy(vacancy_id: int) -> Vacancy | None:
    return (
        visible_student_vacancies_queryset()
        .filter(pk=vacancy_id)
        .first()
    )


def get_student_application(user: User, application_id: int) -> Application | None:
    return (
        Application.objects.filter(pk=application_id, student=user)
        .select_related("company", "vacancy")
        .prefetch_related("history__actor")
        .first()
    )


def get_company_application(user: User, application_id: int) -> Application | None:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    return (
        Application.objects.filter(pk=application_id, company=company)
        .select_related("company", "vacancy", "student")
        .prefetch_related("history__actor")
        .first()
    )


def get_admin_vacancy(vacancy_id: int) -> Vacancy | None:
    return (
        Vacancy.objects.filter(pk=vacancy_id)
        .select_related("company", "created_by")
        .prefetch_related("skill_requirements__skill", "language_requirements")
        .first()
    )


def get_admin_course(course_id: int) -> Course | None:
    return Course.objects.filter(pk=course_id).select_related("company", "created_by").first()


def get_admin_lesson(lesson_id: int) -> Lesson | None:
    return Lesson.objects.filter(pk=lesson_id).select_related("course", "course__company", "course__created_by").first()


def publish_course_if_has_active_lessons(course: Course) -> None:
    if course.status != Course.Status.DRAFT:
        return
    if not Lesson.objects.filter(course=course, status=Lesson.Status.ACTIVE).exists():
        return
    course.status = Course.Status.ACTIVE
    course.full_clean()
    course.save(update_fields=["status", "updated_at"])


def publish_draft_courses_with_active_lessons() -> None:
    draft_course_ids = list(
        Course.objects.filter(status=Course.Status.DRAFT, lessons__status=Lesson.Status.ACTIVE)
        .values_list("id", flat=True)
        .distinct()
    )
    if not draft_course_ids:
        return
    Course.objects.filter(id__in=draft_course_ids).update(
        status=Course.Status.ACTIVE,
        updated_at=timezone.now(),
    )


def visible_student_courses_queryset():
    publish_draft_courses_with_active_lessons()
    return Course.objects.select_related("company", "created_by").filter(status=Course.Status.ACTIVE).order_by("-updated_at", "-id")


def get_visible_student_course(course_id: int) -> Course | None:
    return visible_student_courses_queryset().filter(pk=course_id).first()


def get_student_course_learning_record(student: User, course: Course) -> LearningRecord | None:
    return (
        LearningRecord.objects.filter(student=student, course=course)
        .select_related("course")
        .first()
    )

def ensure_learning_record_for_course(student: User, course: Course) -> tuple[LearningRecord, bool]:
    learning_record = get_student_course_learning_record(student, course)
    created = False
    if learning_record is None:
        learning_record = LearningRecord(
            student=student,
            course=course,
            course_title=course.title,
            category=course.category,
            progress_percent=0,
            status=LearningRecord.Status.NOT_STARTED,
            completed_at=None,
        )
        learning_record.full_clean()
        learning_record.save()
        created = True

    update_fields: list[str] = []
    if learning_record.course_title != course.title:
        learning_record.course_title = course.title
        update_fields.append("course_title")
    if learning_record.category != course.category:
        learning_record.category = course.category
        update_fields.append("category")
    if update_fields:
        learning_record.save(update_fields=[*update_fields, "updated_at"])

    return learning_record, created


def ensure_lesson_progress_records(learning_record: LearningRecord) -> dict[int, LessonProgress]:
    if learning_record.course_id is None:
        return {}

    lessons = active_course_lessons(learning_record.course)
    existing_entries = {
        entry.lesson_id: entry
        for entry in LessonProgress.objects.filter(
            learning_record=learning_record,
            lesson__course_id=learning_record.course_id,
            lesson__status=Lesson.Status.ACTIVE,
        ).select_related("lesson")
    }

    for lesson in lessons:
        if lesson.id in existing_entries:
            continue
        entry = LessonProgress(
            learning_record=learning_record,
            lesson=lesson,
            status=LessonProgress.Status.NOT_STARTED,
        )
        entry.full_clean()
        entry.save()
        existing_entries[lesson.id] = entry

    return existing_entries


def sync_learning_record_progress(learning_record: LearningRecord) -> LearningRecord:
    if learning_record.course_id is None:
        return learning_record

    progress_entries = ensure_lesson_progress_records(learning_record)
    lessons = active_course_lessons(learning_record.course)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(learning_record.course)
    latest_attempts_by_assessment_id: dict[int, CourseAssessmentAttempt] = {}
    for attempt in CourseAssessmentAttempt.objects.filter(
        student=learning_record.student,
        assessment__course=learning_record.course,
        assessment__status=CourseAssessment.Status.ACTIVE,
    ).order_by("assessment_id", "-attempt_number", "-id"):
        if attempt.assessment_id not in latest_attempts_by_assessment_id:
            latest_attempts_by_assessment_id[attempt.assessment_id] = attempt
    completed_count = sum(
        1
        for lesson in lessons
        if progress_entries.get(lesson.id) is not None
        and progress_entries[lesson.id].status == LessonProgress.Status.COMPLETED
    )
    has_in_progress = any(
        progress_entries.get(lesson.id) is not None
        and progress_entries[lesson.id].status == LessonProgress.Status.IN_PROGRESS
        for lesson in lessons
    )

    desired_status = learning_record.status
    desired_progress = learning_record.progress_percent
    desired_completed_at = learning_record.completed_at

    if lessons:
        desired_status = LearningRecord.Status.NOT_STARTED
        desired_progress = 0
        desired_completed_at = None
        if completed_count == len(lessons):
            final_attempt = latest_attempts_by_assessment_id.get(final_assessment.id) if final_assessment is not None else None
            if final_assessment is None or (final_attempt is not None and final_attempt.passed):
                desired_status = LearningRecord.Status.COMPLETED
                desired_progress = 100
                desired_completed_at = learning_record.completed_at or timezone.now()
            else:
                desired_status = LearningRecord.Status.IN_PROGRESS
                desired_progress = 95
        elif completed_count > 0 or has_in_progress:
            desired_status = LearningRecord.Status.IN_PROGRESS
            desired_progress = max(
                1,
                round(((completed_count + (0.5 if has_in_progress else 0)) / len(lessons)) * 100),
            )

    update_fields: list[str] = []
    if learning_record.course_title != learning_record.course.title:
        learning_record.course_title = learning_record.course.title
        update_fields.append("course_title")
    if learning_record.category != learning_record.course.category:
        learning_record.category = learning_record.course.category
        update_fields.append("category")
    if learning_record.status != desired_status:
        learning_record.status = desired_status
        update_fields.append("status")
    if learning_record.progress_percent != desired_progress:
        learning_record.progress_percent = desired_progress
        update_fields.append("progress_percent")
    if learning_record.completed_at != desired_completed_at:
        learning_record.completed_at = desired_completed_at
        update_fields.append("completed_at")

    if update_fields:
        learning_record.full_clean()
        learning_record.save(update_fields=[*update_fields, "updated_at"])

    return learning_record


def get_learning_record_lesson_progress_map(
    learning_record: LearningRecord | None,
    lessons: list[Lesson],
) -> dict[int, LessonProgress]:
    if learning_record is None or not lessons:
        return {}
    progress_entries = ensure_lesson_progress_records(learning_record)
    return {lesson.id: progress_entries[lesson.id] for lesson in lessons if lesson.id in progress_entries}


def get_next_lesson_for_learning_record(
    learning_record: LearningRecord | None,
) -> tuple[Lesson | None, LessonProgress | None]:
    if learning_record is None or learning_record.course_id is None:
        return None, None

    lessons = active_course_lessons(learning_record.course)
    progress_entries = get_learning_record_lesson_progress_map(learning_record, lessons)
    if not lessons:
        return None, None

    for lesson in lessons:
        progress = progress_entries.get(lesson.id)
        if progress is None or progress.status != LessonProgress.Status.COMPLETED:
            return lesson, progress

    last_lesson = lessons[-1]
    return last_lesson, progress_entries.get(last_lesson.id)


def student_lesson_href(course_id: int, lesson_id: int) -> str:
    return f"/student/courses/{course_id}/lessons/{lesson_id}"


def get_learning_record_resume_href(learning_record: LearningRecord | None) -> str:
    lesson, _ = get_next_lesson_for_learning_record(learning_record)
    if lesson is not None and learning_record is not None and learning_record.course_id is not None:
        lessons = active_course_lessons(learning_record.course)
        progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
        assessment_by_lesson_id, final_assessment = build_course_assessment_map(learning_record.course)
        latest_attempts = latest_course_assessment_attempts_by_assessment_id(
            student=learning_record.student,
            course=learning_record.course,
        )

        for current_lesson in lessons:
            progress = progress_map.get(current_lesson.id)
            if progress is None or progress.status != LessonProgress.Status.COMPLETED:
                return student_lesson_href(current_lesson.course_id, current_lesson.id)

            lesson_assessment = assessment_by_lesson_id.get(current_lesson.id)
            if lesson_assessment is not None:
                latest_attempt = latest_attempts.get(lesson_assessment.id)
                if latest_attempt is None or not latest_attempt.passed:
                    return student_lesson_href(current_lesson.course_id, current_lesson.id)

        if final_assessment is not None:
            latest_final_attempt = latest_attempts.get(final_assessment.id)
            if latest_final_attempt is None or not latest_final_attempt.passed:
                return student_lesson_href(lesson.course_id, lesson.id)

        return student_lesson_href(lesson.course_id, lesson.id)
    if learning_record is not None and learning_record.course_id is not None:
        return f"/student/courses/{learning_record.course_id}"
    return "/student/learning"


def serialize_current_learning_lesson(learning_record: LearningRecord | None) -> dict | None:
    lesson, progress = get_next_lesson_for_learning_record(learning_record)
    if lesson is None:
        return None

    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "course_title": lesson.course.title,
        "sequence_number": lesson.sequence_number,
        "href": student_lesson_href(lesson.course_id, lesson.id),
        "status": progress.status if progress is not None else LessonProgress.Status.NOT_STARTED,
    }


def serialize_student_lesson_detail(
    lesson: Lesson,
    *,
    progress: LessonProgress,
    total_lessons: int,
    previous_lesson: Lesson | None,
    next_lesson_href: str | None,
    lesson_exam: dict | None,
    final_exam: dict | None,
) -> dict:
    return {
        "lesson_id": lesson.id,
        "course_id": lesson.course_id,
        "course_title": lesson.course.title,
        "course_href": f"/student/courses/{lesson.course_id}",
        "title": lesson.title,
        "summary": lesson.summary,
        "content": lesson.content,
        "video_url": lesson.video_url,
        "sequence_number": lesson.sequence_number,
        "total_lessons": total_lessons,
        "progress": {
            "status": progress.status,
            "started_at": progress.started_at.isoformat() if progress.started_at else None,
            "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
        },
        "previous_lesson_href": student_lesson_href(previous_lesson.course_id, previous_lesson.id) if previous_lesson else None,
        "next_lesson_href": next_lesson_href,
        "lesson_exam": lesson_exam,
        "final_exam": final_exam,
    }


def get_admin_exam(exam_id: int) -> Exam | None:
    return Exam.objects.filter(pk=exam_id).first()


def get_admin_exam_question(question_id: int) -> ExamQuestion | None:
    return ExamQuestion.objects.filter(pk=question_id).select_related("exam").first()


def get_admin_exam_answer_option(option_id: int) -> ExamAnswerOption | None:
    return ExamAnswerOption.objects.filter(pk=option_id).select_related("question", "question__exam").first()


def active_exam_questions(exam: Exam) -> list[ExamQuestion]:
    return list(
        ExamQuestion.objects.filter(exam=exam, status=ExamQuestion.Status.ACTIVE)
        .prefetch_related("answer_options")
        .order_by("sequence_number", "id")
    )


def exam_is_ready_for_student(exam: Exam) -> bool:
    questions = active_exam_questions(exam)
    if not questions:
        return False

    for question in questions:
        active_options = [option for option in question.answer_options.all() if option.status == ExamAnswerOption.Status.ACTIVE]
        if not active_options:
            return False
        if not any(option.is_correct for option in active_options):
            return False

    return True


def visible_student_exams_queryset():
    return Exam.objects.filter(status=Exam.Status.ACTIVE).order_by("-updated_at", "-id")


def get_visible_student_exam(exam_id: int) -> Exam | None:
    return visible_student_exams_queryset().filter(pk=exam_id).first()


def sync_exam_question_count(exam: Exam) -> Exam:
    desired_count = ExamQuestion.objects.filter(exam=exam, status=ExamQuestion.Status.ACTIVE).count()
    if exam.question_count != desired_count:
        exam.question_count = desired_count
        exam.save(update_fields=["question_count", "updated_at"])
    return exam


def next_exam_attempt_number(student: User, exam: Exam) -> int:
    latest_result = (
        ExamResult.objects.filter(student=student, exam=exam)
        .order_by("-attempt_number")
        .values_list("attempt_number", flat=True)
        .first()
    )
    latest_attempt = (
        ExamAttempt.objects.filter(student=student, exam=exam)
        .order_by("-attempt_number")
        .values_list("attempt_number", flat=True)
        .first()
    )
    latest_number = max(latest_result or 0, latest_attempt or 0)
    return latest_number + 1


def next_mock_exam_attempt_number(student: User, exam: Exam) -> int:
    latest_attempt = (
        MockExamAttempt.objects.filter(student=student, exam=exam)
        .order_by("-attempt_number")
        .values_list("attempt_number", flat=True)
        .first()
    )
    return (latest_attempt or 0) + 1


def evaluate_exam_retake_eligibility(student: User, exam: Exam) -> dict:
    attempt_count = ExamResult.objects.filter(student=student, exam=exam).count()
    has_passed = ExamResult.objects.filter(student=student, exam=exam, passed=True).exists()

    if not exam_is_ready_for_student(exam):
        return {
            "can_take": False,
            "message": "This exam is not ready yet.",
            "attempt_count": attempt_count,
            "next_attempt_number": None,
        }

    if has_passed:
        return {
            "can_take": False,
            "message": "You already passed this exam.",
            "attempt_count": attempt_count,
            "next_attempt_number": None,
        }

    if attempt_count >= exam.max_attempts:
        return {
            "can_take": False,
            "message": f"Maximum attempts reached ({exam.max_attempts}).",
            "attempt_count": attempt_count,
            "next_attempt_number": None,
        }

    return {
        "can_take": True,
        "message": f"Attempt {attempt_count + 1} of {exam.max_attempts}.",
        "attempt_count": attempt_count,
        "next_attempt_number": next_exam_attempt_number(student, exam),
    }


def score_exam_submission(exam: Exam, answers_by_question_id: dict[int, int]) -> tuple[int, bool]:
    score_percent, passed, _, _ = score_exam_submission_details(exam, answers_by_question_id)
    return score_percent, passed


def score_exam_submission_details(exam: Exam, answers_by_question_id: dict[int, int]) -> tuple[int, bool, int, int]:
    questions = active_exam_questions(exam)
    total_points = sum(question.points for question in questions)
    if total_points == 0:
        return 0, False, 0, 0

    earned_points = 0
    correct_answer_count = 0
    for question in questions:
        selected_option_id = answers_by_question_id.get(question.id)
        if selected_option_id is None:
            continue
        correct_option = next(
            (
                option
                for option in question.answer_options.all()
                if option.status == ExamAnswerOption.Status.ACTIVE and option.is_correct
            ),
            None,
        )
        if correct_option is not None and correct_option.id == selected_option_id:
            earned_points += question.points
            correct_answer_count += 1

    score_percent = round((earned_points / total_points) * 100)
    return score_percent, score_percent >= exam.passing_score_percent, correct_answer_count, len(questions)


def score_course_assessment_submission_details(
    assessment: CourseAssessment,
    answers_by_question_id: dict[int, list[int]],
    *,
    generated_questions: list[dict] | None = None,
) -> tuple[int, bool, int, int]:
    if generated_questions is not None:
        questions = generated_questions
        total_points = sum(int(question.get("points", 1)) for question in questions)
    else:
        questions = active_course_assessment_questions(assessment)
        total_points = sum(question.points for question in questions)
    if total_points == 0:
        return 0, False, 0, 0

    earned_points = 0
    correct_answer_count = 0
    for question in questions:
        question_id = int(question["question_id"]) if generated_questions is not None else question.id
        selected_option_ids = set(answers_by_question_id.get(question_id, []))
        if not selected_option_ids:
            continue

        if generated_questions is not None:
            correct_option_ids = {
                int(option["option_id"])
                for option in question["options"]
                if option.get("is_correct")
            }
            question_points = int(question.get("points", 1))
        else:
            correct_option_ids = {
                option.id
                for option in question.options.all()
                if option.status == CourseAssessmentOption.Status.ACTIVE and option.is_correct
            }
            question_points = question.points
        if selected_option_ids == correct_option_ids:
            earned_points += question_points
            correct_answer_count += 1

    score_percent = round((earned_points / total_points) * 100)
    return score_percent, score_percent >= assessment.passing_score_percent, correct_answer_count, len(questions)


def preparation_categories_for_student(student: User) -> list[str]:
    categories = {
        category
        for category in Course.objects.filter(status=Course.Status.ACTIVE).values_list("category", flat=True)
        if category
    }
    categories.update(
        category
        for category in Exam.objects.filter(status=Exam.Status.ACTIVE).values_list("category", flat=True)
        if category
    )
    categories.update(
        category
        for category in LearningRecord.objects.filter(student=student).values_list("category", flat=True)
        if category
    )
    categories.update(
        category
        for category in MockExamAttempt.objects.filter(student=student).values_list("category", flat=True)
        if category
    )
    categories.update(
        category
        for category in PracticeQuestionAttempt.objects.filter(student=student).values_list("exam__category", flat=True)
        if category
    )
    return sorted(categories)


def visible_practice_questions_queryset(*, category: str | None = None, exam_id: int | None = None):
    queryset = (
        ExamQuestion.objects.filter(
            exam__status=Exam.Status.ACTIVE,
            status=ExamQuestion.Status.ACTIVE,
            answer_options__status=ExamAnswerOption.Status.ACTIVE,
            answer_options__is_correct=True,
        )
        .select_related("exam")
        .prefetch_related("answer_options")
        .distinct()
        .order_by("exam__category", "exam__title", "sequence_number", "id")
    )
    if category:
        queryset = queryset.filter(exam__category=category)
    if exam_id:
        queryset = queryset.filter(exam_id=exam_id)
    return queryset


def build_study_plan_item(category: str, *, student: User) -> dict:
    summary = serialize_preparation_category_summary(category, student=student)
    latest_mock_score = summary["latest_mock_score"]
    practice_target = max(3, min(summary["practice_question_count"], 10)) if summary["practice_question_count"] else 0
    if summary["completed_courses"] == 0 and summary["in_progress_courses"] == 0:
        status = "not_started"
        next_step = "Start a related course or practice set."
    elif latest_mock_score is not None and latest_mock_score >= 80:
        status = "ready"
        next_step = "You have strong recent mock evidence. Review weak questions and book an official exam."
    elif summary["practice_attempt_count"] >= practice_target and practice_target > 0:
        status = "in_progress"
        next_step = "Take a mock exam to measure readiness in this category."
    else:
        status = "focus"
        next_step = "Build more preparation evidence with targeted practice questions."

    return {
        "category": category,
        "label": summary["label"],
        "status": status,
        "practice_target": practice_target,
        "practice_completed": summary["practice_attempt_count"],
        "latest_mock_score": latest_mock_score,
        "next_step": next_step,
        "cta_href": "/student/preparation",
    }


def build_preparation_performance_category(category: str, *, student: User) -> dict:
    summary = serialize_preparation_category_summary(category, student=student)
    return {
        "category": category,
        "label": summary["label"],
        "practice_attempt_count": summary["practice_attempt_count"],
        "practice_accuracy": summary["practice_accuracy"],
        "mock_attempt_count": summary["mock_attempt_count"],
        "best_mock_score": summary["best_mock_score"],
        "latest_mock_score": summary["latest_mock_score"],
    }


def serialize_practice_attempt_summary(attempt: PracticeQuestionAttempt) -> dict:
    return {
        "attempt_id": attempt.id,
        "exam_id": attempt.exam_id,
        "exam_title": attempt.exam.title,
        "category": attempt.exam.category,
        "question_id": attempt.question_id,
        "question_prompt": attempt.question.prompt,
        "is_correct": attempt.is_correct,
        "created_at": attempt.created_at.isoformat(),
    }


def sync_vacancy_skill_requirements(
    vacancy: Vacancy,
    *,
    required_skills: list[Skill],
    preferred_skills: list[Skill],
) -> None:
    desired = {skill.id: VacancySkillRequirement.RequirementType.REQUIRED for skill in required_skills}
    desired.update({skill.id: VacancySkillRequirement.RequirementType.PREFERRED for skill in preferred_skills})

    existing_requirements = {
        requirement.skill_id: requirement
        for requirement in VacancySkillRequirement.objects.filter(vacancy=vacancy).select_related("skill")
    }

    for skill_id, requirement in existing_requirements.items():
        desired_requirement_type = desired.pop(skill_id, None)
        if desired_requirement_type is None:
            requirement.delete()
            continue
        if requirement.requirement_type != desired_requirement_type:
            requirement.requirement_type = desired_requirement_type
            requirement.full_clean()
            requirement.save(update_fields=["requirement_type", "updated_at"])

    for skill_id, requirement_type in desired.items():
        requirement = VacancySkillRequirement(
            vacancy=vacancy,
            skill_id=skill_id,
            requirement_type=requirement_type,
        )
        requirement.full_clean()
        requirement.save()


def sync_vacancy_language_requirements(vacancy: Vacancy, *, language_requirements: list[dict]) -> None:
    desired = {item["language"]: item for item in language_requirements}
    existing_requirements = {
        requirement.language: requirement
        for requirement in VacancyLanguageRequirement.objects.filter(vacancy=vacancy)
    }

    for language, requirement in existing_requirements.items():
        desired_requirement = desired.pop(language, None)
        if desired_requirement is None:
            requirement.delete()
            continue
        if (
            requirement.minimum_level != desired_requirement["minimum_level"]
            or requirement.requirement_type != desired_requirement["requirement_type"]
        ):
            requirement.minimum_level = desired_requirement["minimum_level"]
            requirement.requirement_type = desired_requirement["requirement_type"]
            requirement.full_clean()
            requirement.save(update_fields=["minimum_level", "requirement_type", "updated_at"])

    for language, desired_requirement in desired.items():
        requirement = VacancyLanguageRequirement(
            vacancy=vacancy,
            language=language,
            minimum_level=desired_requirement["minimum_level"],
            requirement_type=desired_requirement["requirement_type"],
        )
        requirement.full_clean()
        requirement.save()


def ensure_match_candidate_access(company: Company, student: User) -> CandidateReviewAccess:
    candidate_access, created = CandidateReviewAccess.objects.get_or_create(
        company=company,
        student=student,
        source=CandidateReviewAccess.Source.MATCH,
        defaults={"is_active": True},
    )
    if not created and not candidate_access.is_active:
        candidate_access.is_active = True
        candidate_access.save(update_fields=["is_active", "updated_at"])
    return candidate_access


def sync_company_match_candidate_accesses(company: Company) -> None:
    active_vacancies = list(
        Vacancy.objects.filter(company=company, status=Vacancy.Status.ACTIVE)
        .select_related("company", "created_by")
        .prefetch_related("skill_requirements__skill", "language_requirements")
        .order_by("-updated_at", "-id")
    )
    students = list(matchable_students_queryset())

    matched_student_ids: set[int] = set()
    for student in students:
        best_score = 0.0
        for vacancy in active_vacancies:
            match_result = aggregate_match_result(student, vacancy)
            best_score = max(best_score, match_result["score"])
        if best_score >= MATCH_RECOMMENDATION_THRESHOLD:
            ensure_match_candidate_access(company, student)
            matched_student_ids.add(student.id)

    stale_accesses = CandidateReviewAccess.objects.filter(
        company=company,
        source=CandidateReviewAccess.Source.MATCH,
    ).exclude(student_id__in=matched_student_ids)
    stale_accesses.update(is_active=False, updated_at=timezone.now())


def ensure_company_match_candidate_accesses_synced(company: Company) -> None:
    sync_company_match_candidate_accesses(company)


def ranked_matches_for_vacancy(vacancy: Vacancy) -> list[tuple[User, dict]]:
    matches: list[tuple[User, dict]] = []
    for student in matchable_students_queryset():
        match_result = cached_aggregate_match_result(student, vacancy)
        if match_result["score"] >= MATCH_RECOMMENDATION_THRESHOLD:
            matches.append((student, match_result))

    matches.sort(key=lambda item: (-item[1]["score"], item[0].full_name.lower(), item[0].id))
    return matches


def ranked_matches_for_student(student: User) -> list[tuple[Vacancy, dict]]:
    matches: list[tuple[Vacancy, dict]] = []
    for vacancy in visible_student_vacancies_queryset().order_by("-updated_at", "-id"):
        match_result = cached_aggregate_match_result(student, vacancy)
        if match_result["score"] >= MATCH_RECOMMENDATION_THRESHOLD:
            matches.append((vacancy, match_result))

    matches.sort(key=lambda item: (-item[1]["score"], item[0].title.lower(), item[0].id))
    return matches


def parse_csv_query_values(raw_value: str) -> list[str]:
    values: list[str] = []
    for item in raw_value.split(","):
        cleaned = item.strip()
        if cleaned and cleaned not in values:
            values.append(cleaned)
    return values


def validate_student_jobs_filters(request) -> dict:
    query = request.GET.get("q", "").strip()
    skill_slugs = [value.lower() for value in parse_csv_query_values(request.GET.get("skills", ""))]
    languages = [value.lower() for value in parse_csv_query_values(request.GET.get("languages", ""))]
    locations = parse_csv_query_values(request.GET.get("locations", ""))
    work_styles = [value.lower() for value in parse_csv_query_values(request.GET.get("work_styles", ""))]
    sort_by = request.GET.get("sort", "").strip().lower() or "newest"
    bookmarked_only = request.GET.get("bookmarked", "").strip().lower() in {"1", "true", "yes"}

    errors = {}
    if skill_slugs:
        known_skill_slugs = set(Skill.objects.filter(slug__in=skill_slugs).values_list("slug", flat=True))
        invalid_skill_slugs = [slug for slug in skill_slugs if slug not in known_skill_slugs]
        if invalid_skill_slugs:
            errors["skills"] = [f"Unknown skill filters: {', '.join(invalid_skill_slugs)}."]

    invalid_languages = [value for value in languages if value not in VacancyLanguageRequirement.Language.values]
    if invalid_languages:
        errors["languages"] = [
            f"Language filters must be one of: {', '.join(VacancyLanguageRequirement.Language.values)}."
        ]

    invalid_work_styles = [value for value in work_styles if value not in Vacancy.WorkStyle.values]
    if invalid_work_styles:
        errors["work_styles"] = [f"Work style filters must be one of: {', '.join(Vacancy.WorkStyle.values)}."]

    valid_sort_options = {"newest", "company_az", "title_az", "compensation"}
    if sort_by not in valid_sort_options:
        errors["sort"] = [f"Sort must be one of: {', '.join(sorted(valid_sort_options))}."]

    if errors:
        raise ValidationError(errors)

    return {
        "query": query,
        "skill_slugs": skill_slugs,
        "languages": languages,
        "locations": locations,
        "work_styles": work_styles,
        "sort_by": sort_by,
        "bookmarked_only": bookmarked_only,
    }


def build_student_jobs_response(user: User, filters: dict) -> dict:
    visible_queryset = visible_student_vacancies_base_queryset()
    filtered_queryset = visible_queryset

    if filters["query"]:
        filtered_queryset = filtered_queryset.filter(
            Q(title__icontains=filters["query"])
            | Q(description__icontains=filters["query"])
            | Q(company__name__icontains=filters["query"])
            | Q(location__icontains=filters["query"])
        )
    if filters["skill_slugs"]:
        filtered_queryset = filtered_queryset.filter(skill_requirements__skill__slug__in=filters["skill_slugs"])
    if filters["languages"]:
        filtered_queryset = filtered_queryset.filter(language_requirements__language__in=filters["languages"])
    if filters["locations"]:
        location_query = Q()
        for location in filters["locations"]:
            location_query |= Q(location__iexact=location)
        filtered_queryset = filtered_queryset.filter(location_query)
    if filters["work_styles"]:
        filtered_queryset = filtered_queryset.filter(work_style__in=filters["work_styles"])

    if filters["bookmarked_only"]:
        filtered_queryset = filtered_queryset.filter(bookmarks__student=user)

    filtered_queryset = filtered_queryset.distinct()
    if filters["sort_by"] == "company_az":
        filtered_queryset = filtered_queryset.order_by("company__name", "title", "id")
    elif filters["sort_by"] == "title_az":
        filtered_queryset = filtered_queryset.order_by("title", "company__name", "id")
    elif filters["sort_by"] == "compensation":
        filtered_queryset = filtered_queryset.order_by(F("max_salary").desc(nulls_last=True), F("min_salary").desc(nulls_last=True), "-updated_at", "-id")
    else:
        filtered_queryset = filtered_queryset.order_by("-updated_at", "-id")

    filtered_vacancies = list(
        filtered_queryset.select_related("company", "created_by").prefetch_related("skill_requirements__skill", "language_requirements")
    )
    filtered_vacancy_ids = [vacancy.id for vacancy in filtered_vacancies]
    bookmarked_vacancy_ids = set(
        JobBookmark.objects.filter(student=user, vacancy_id__in=filtered_vacancy_ids).values_list("vacancy_id", flat=True)
    )
    active_application_vacancy_ids = set(
        Application.objects.filter(student=user, vacancy_id__in=filtered_vacancy_ids)
        .exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
        .values_list("vacancy_id", flat=True)
    )

    visible_skill_ids = list(
        visible_queryset.filter(skill_requirements__isnull=False)
        .values_list("skill_requirements__skill_id", flat=True)
        .distinct()
    )
    available_skills = list(Skill.objects.filter(id__in=visible_skill_ids).order_by("name"))
    available_languages = [
        serialize_choice_option(value, label)
        for value, label in VacancyLanguageRequirement.Language.choices
        if visible_queryset.filter(language_requirements__language=value).exists()
    ]
    available_locations = sorted(
        location
        for location in visible_queryset.exclude(location="").exclude(location__isnull=True)
        .values_list("location", flat=True)
        .distinct()
    )
    available_work_styles = [
        serialize_choice_option(value, label)
        for value, label in Vacancy.WorkStyle.choices
        if visible_queryset.filter(work_style=value).exists()
    ]

    return {
        "vacancies": [
            serialize_vacancy(
                vacancy,
                bookmarked_vacancy_ids=bookmarked_vacancy_ids,
                active_application_vacancy_ids=active_application_vacancy_ids,
            )
            for vacancy in filtered_vacancies
        ],
        "query": filters["query"],
        "filters": {
            "skills": filters["skill_slugs"],
            "languages": filters["languages"],
            "locations": filters["locations"],
            "work_styles": filters["work_styles"],
        },
        "sort": filters["sort_by"],
        "bookmarked_only": filters["bookmarked_only"],
        "result_count": len(filtered_vacancies),
        "bookmark_count": JobBookmark.objects.filter(student=user).count(),
        "available_skills": [serialize_skill(skill) for skill in available_skills],
        "available_languages": available_languages,
        "available_locations": available_locations,
        "available_work_styles": available_work_styles,
    }


def serialize_student_job_detail(user: User, vacancy: Vacancy) -> dict:
    bookmarked_vacancy_ids = set(
        JobBookmark.objects.filter(student=user, vacancy_id=vacancy.id).values_list("vacancy_id", flat=True)
    )
    active_application_vacancy_ids = set(
        Application.objects.filter(student=user, vacancy_id=vacancy.id)
        .exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
        .values_list("vacancy_id", flat=True)
    )
    return serialize_vacancy(
        vacancy,
        bookmarked_vacancy_ids=bookmarked_vacancy_ids,
        active_application_vacancy_ids=active_application_vacancy_ids,
    )


def get_or_create_application_candidate_access(application: Application) -> CandidateReviewAccess:
    candidate_access, created = CandidateReviewAccess.objects.get_or_create(
        company=application.company,
        student=application.student,
        source=CandidateReviewAccess.Source.APPLICATION,
        defaults={"is_active": True},
    )
    if not created and not candidate_access.is_active:
        candidate_access.is_active = True
        candidate_access.save(update_fields=["is_active", "updated_at"])
    return candidate_access


def sync_application_candidate_access(company: Company, student: User) -> None:
    candidate_access = CandidateReviewAccess.objects.filter(
        company=company,
        student=student,
        source=CandidateReviewAccess.Source.APPLICATION,
    ).first()
    if candidate_access is None:
        return

    has_active_applications = Application.objects.filter(
        company=company,
        student=student,
        status__in=[
            Application.Status.SUBMITTED,
            Application.Status.UNDER_REVIEW,
            Application.Status.SHORTLISTED,
        ],
    ).exists()
    if candidate_access.is_active != has_active_applications:
        candidate_access.is_active = has_active_applications
        candidate_access.save(update_fields=["is_active", "updated_at"])


def create_application_history(
    application: Application,
    *,
    from_status: str,
    to_status: str,
    actor: User | None,
    note: str = "",
) -> ApplicationStatusHistory:
    history_entry = ApplicationStatusHistory(
        application=application,
        actor=actor,
        from_status=from_status,
        to_status=to_status,
        note=note,
    )
    history_entry.full_clean()
    history_entry.save()
    return history_entry


def transition_application_status(
    application: Application,
    *,
    to_status: str,
    actor: User | None,
    note: str = "",
) -> Application:
    previous_status = application.status
    application.status = to_status
    application.full_clean()
    application.save(update_fields=["status", "updated_at"])
    create_application_history(
        application,
        from_status=previous_status,
        to_status=to_status,
        actor=actor,
        note=note,
    )
    sync_application_candidate_access(application.company, application.student)
    return application


@api_endpoint(["GET"])
def health_view(request):
    return success_response({"status": "ok", "request_id": request.request_id})


@api_endpoint(["GET"])
def readiness_view(request):
    payload, status_code = readiness_checks(request)
    return success_response(payload, status=status_code)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_jobs_view(request):
    filters = validate_student_jobs_filters(request)
    return success_response(build_student_jobs_response(request.user, filters))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_job_detail_view(request, vacancy_id: int):
    vacancy = get_visible_student_vacancy(vacancy_id)
    if vacancy is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested job was not found.",
            details={"vacancy_id": [str(vacancy_id)]},
            status=404,
        )

    return success_response(serialize_student_job_detail(request.user, vacancy))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_courses_view(request):
    courses = list(visible_student_courses_queryset())
    course_ids = [course.id for course in courses]
    lesson_counts = {
        item["course_id"]: item["lesson_count"]
        for item in Lesson.objects.filter(course_id__in=course_ids, status=Lesson.Status.ACTIVE)
        .values("course_id")
        .annotate(lesson_count=Count("id"))
    }
    learning_record_counts = {
        item["course_id"]: item["learning_record_count"]
        for item in LearningRecord.objects.filter(course_id__in=course_ids)
        .values("course_id")
        .annotate(learning_record_count=Count("id"))
    }
    review_summaries = course_review_summary_map(course_ids)
    learning_records = {
        record.course_id: sync_learning_record_progress(record)
        for record in LearningRecord.objects.filter(student=request.user, course_id__in=course_ids).select_related("course")
    }
    return success_response(
        {
            "result_count": len(courses),
            "courses": [
                serialize_student_course_summary(
                    course,
                    learning_record=learning_records.get(course.id),
                    learning_record_count=learning_record_counts.get(course.id, 0),
                    average_rating=review_summaries.get(course.id, {}).get("average_rating"),
                    rating_count=review_summaries.get(course.id, {}).get("rating_count", 0),
                    lesson_count=lesson_counts.get(course.id, 0),
                    next_step_label=(
                        "Continue course"
                        if learning_records.get(course.id) is not None and learning_records[course.id].status != LearningRecord.Status.COMPLETED
                        else "Review course"
                        if learning_records.get(course.id) is not None
                        else "View details"
                    ),
                    next_step_href=(
                        get_learning_record_resume_href(learning_records.get(course.id))
                        if learning_records.get(course.id) is not None
                        else f"/student/courses/{course.id}"
                    ),
                )
                for course in courses
            ],
        }
    )


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_courses_view(request):
    if request.method == "GET":
        courses = list(Course.objects.select_related("company", "created_by").order_by("-updated_at", "-id"))
        return success_response({"courses": [serialize_admin_course(course, viewer=request.user) for course in courses]})

    payload = validate_admin_course_payload(parse_json_body(request))
    course = Course(
        title=payload["title"],
        description=payload["description"],
        category=payload["category"],
        difficulty_level=payload["difficulty_level"],
        estimated_hours=payload["estimated_hours"],
        thumbnail_image=payload["thumbnail_image"],
        thumbnail_alt_text=payload["thumbnail_alt_text"],
        status=payload["status"],
        company=request.user.company,
        created_by=request.user,
    )
    course.full_clean()
    course.save()
    course = get_admin_course(course.id)
    return success_response(serialize_admin_course(course, viewer=request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_detail_view(request, course_id: int):
    course = get_admin_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if not company_can_edit_course(request.user, course):
        return error_response(
            request,
            "FORBIDDEN",
            "You can only edit courses created by your company.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    if request.method == "DELETE":
        course.status = Course.Status.INACTIVE
        course.full_clean()
        course.save(update_fields=["status", "updated_at"])
        course = get_admin_course(course.id)
        return success_response(serialize_admin_course(course, viewer=request.user))

    payload = validate_admin_course_payload(parse_json_body(request))
    course.title = payload["title"]
    course.description = payload["description"]
    course.category = payload["category"]
    course.difficulty_level = payload["difficulty_level"]
    course.estimated_hours = payload["estimated_hours"]
    course.thumbnail_image = payload["thumbnail_image"]
    course.thumbnail_alt_text = payload["thumbnail_alt_text"]
    course.status = payload["status"]
    course.full_clean()
    course.save(
        update_fields=[
            "title",
            "description",
            "category",
            "difficulty_level",
            "estimated_hours",
            "thumbnail_image",
            "thumbnail_alt_text",
            "status",
            "updated_at",
        ]
    )
    course = get_admin_course(course.id)
    return success_response(serialize_admin_course(course, viewer=request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_lessons_view(request, course_id: int):
    course = get_admin_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if request.method == "GET":
        lessons = list(
            Lesson.objects.filter(course=course)
            .select_related("course")
            .order_by("sequence_number", "id")
        )
        return success_response(
            {
                "course": serialize_admin_course(course, viewer=request.user),
                "lessons": [serialize_admin_lesson(lesson) for lesson in lessons],
            }
        )

    if not company_can_edit_course(request.user, course):
        return error_response(
            request,
            "FORBIDDEN",
            "You can only manage lessons for courses created by your company.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    payload = validate_admin_lesson_payload(parse_json_body(request))
    lesson = Lesson(
        course=course,
        title=payload["title"],
        summary=payload["summary"],
        content=payload["content"],
        transcript=payload["transcript"],
        video_url=payload["video_url"],
        sequence_number=payload["sequence_number"],
        status=payload["status"],
    )
    lesson.full_clean()
    lesson.save()
    publish_course_if_has_active_lessons(course)
    lesson = get_admin_lesson(lesson.id)
    return success_response(serialize_admin_lesson(lesson), status=201)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_youtube_transcript_view(request):
    from services.youtube_transcript import YouTubeTranscriptService, YouTubeTranscriptServiceError

    payload = parse_json_body(request)
    video_url = str(payload.get("video_url", "")).strip()
    errors = {}

    if not video_url:
        errors["video_url"] = ["This field is required."]
    else:
        video_url_error = youtube_video_url_error(video_url)
        if video_url_error:
            errors["video_url"] = [video_url_error]

    if errors:
        raise ValidationError(errors)

    try:
        transcript_text = YouTubeTranscriptService().fetch_transcript_text(video_url)
    except YouTubeTranscriptServiceError as exc:
        return error_response(
            request,
            "TRANSCRIPT_UNAVAILABLE",
            str(exc),
            details={"video_url": [video_url]},
            status=422,
        )

    return success_response({"transcript": transcript_text})


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_lesson_detail_view(request, lesson_id: int):
    lesson = get_admin_lesson(lesson_id)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson was not found.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    if not company_can_edit_course(request.user, lesson.course):
        return error_response(
            request,
            "FORBIDDEN",
            "You can only manage lessons for courses created by your company.",
            details={"lesson_id": [str(lesson_id)]},
            status=403,
        )

    if request.method == "DELETE":
        lesson.status = Lesson.Status.INACTIVE
        lesson.full_clean()
        lesson.save(update_fields=["status", "updated_at"])
        lesson = get_admin_lesson(lesson.id)
        return success_response(serialize_admin_lesson(lesson))

    payload = validate_admin_lesson_payload(parse_json_body(request))
    lesson.title = payload["title"]
    lesson.summary = payload["summary"]
    lesson.content = payload["content"]
    lesson.transcript = payload["transcript"]
    lesson.video_url = payload["video_url"]
    lesson.sequence_number = payload["sequence_number"]
    lesson.status = payload["status"]
    lesson.full_clean()
    lesson.save(
        update_fields=[
            "title",
            "summary",
            "content",
            "transcript",
            "video_url",
            "sequence_number",
            "status",
            "updated_at",
        ]
    )
    publish_course_if_has_active_lessons(lesson.course)
    lesson = get_admin_lesson(lesson.id)
    return success_response(serialize_admin_lesson(lesson))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_preview_detail_view(request, course_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    lessons = company_preview_course_lessons(course)
    ensure_company_preview_course_assessment_map(course, lessons=lessons)
    return success_response(serialize_company_preview_course_detail(course, lessons=lessons))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_preview_lesson_detail_view(request, course_id: int, lesson_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    lessons = company_preview_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson is not available.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    assessment_by_lesson_id, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    return success_response(
        serialize_company_preview_lesson_detail(
            lesson,
            lessons=lessons,
            lesson_exam=assessment_by_lesson_id.get(lesson.id),
            final_exam=final_assessment,
        )
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_preview_lesson_assessment_detail_view(request, course_id: int, lesson_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    assessment_by_lesson_id, _ = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)

    response_payload = serialize_company_preview_assessment_detail(assessment, user=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(assessment, user=request.user),
            details={"lesson_id": [str(lesson_id)]},
            status=503,
        )
    return success_response(response_payload)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_preview_lesson_assessment_submit_view(request, course_id: int, lesson_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    assessment_by_lesson_id, _ = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)

    generated_questions = get_cached_generated_course_assessment_questions(assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=assessment,
        generated_questions=generated_questions or None,
    )
    score_percent, passed, _, _ = score_course_assessment_submission_details(
        assessment,
        payload["answers_by_question_id"],
        generated_questions=generated_questions or None,
    )
    if generated_questions:
        clear_cached_generated_course_assessment_questions(assessment, user=request.user)
    message = (
        "Lesson exam passed. The next lesson is now unlocked."
        if passed
        else f"Lesson exam submitted. Score {score_percent}%. Reach {assessment.passing_score_percent}% to unlock the next lesson."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": assessment.id,
            "attempt_id": 0,
            "attempt_number": 1,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": assessment.passing_score_percent,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_preview_final_assessment_detail_view(request, course_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    _, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)

    response_payload = serialize_company_preview_assessment_detail(final_assessment, user=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(final_assessment, user=request.user),
            details={"course_id": [str(course_id)]},
            status=503,
        )
    return success_response(response_payload)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_preview_final_assessment_submit_view(request, course_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    _, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)

    generated_questions = get_cached_generated_course_assessment_questions(final_assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=final_assessment,
        generated_questions=generated_questions or None,
    )
    score_percent, passed, _, _ = score_course_assessment_submission_details(
        final_assessment,
        payload["answers_by_question_id"],
        generated_questions=generated_questions or None,
    )
    if generated_questions:
        clear_cached_generated_course_assessment_questions(final_assessment, user=request.user)
    message = (
        "Final exam passed. Course completed."
        if passed
        else f"Final exam submitted. Score {score_percent}%. Reach {final_assessment.passing_score_percent}% to complete the course."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": final_assessment.id,
            "attempt_id": 0,
            "attempt_number": 1,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": final_assessment.passing_score_percent,
            "course_completed": passed,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_preview_detail_view(request, course_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    lessons = company_preview_course_lessons(course)
    ensure_company_preview_course_assessment_map(course, lessons=lessons)
    return success_response(serialize_company_preview_course_detail(course, lessons=lessons))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_preview_lesson_detail_view(request, course_id: int, lesson_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    lessons = company_preview_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson is not available.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    assessment_by_lesson_id, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    return success_response(
        serialize_company_preview_lesson_detail(
            lesson,
            lessons=lessons,
            lesson_exam=assessment_by_lesson_id.get(lesson.id),
            final_exam=final_assessment,
        )
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_preview_lesson_assessment_detail_view(request, course_id: int, lesson_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    assessment_by_lesson_id, _ = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)

    response_payload = serialize_company_preview_assessment_detail(assessment, user=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(assessment, user=request.user),
            details={"lesson_id": [str(lesson_id)]},
            status=503,
        )
    return success_response(response_payload)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_preview_lesson_assessment_submit_view(request, course_id: int, lesson_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    assessment_by_lesson_id, _ = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)

    generated_questions = get_cached_generated_course_assessment_questions(assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=assessment,
        generated_questions=generated_questions or None,
    )
    score_percent, passed, _, _ = score_course_assessment_submission_details(
        assessment,
        payload["answers_by_question_id"],
        generated_questions=generated_questions or None,
    )
    if generated_questions:
        clear_cached_generated_course_assessment_questions(assessment, user=request.user)
    message = (
        "Lesson exam passed. The next lesson is now unlocked."
        if passed
        else f"Lesson exam submitted. Score {score_percent}%. Reach {assessment.passing_score_percent}% to unlock the next lesson."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": assessment.id,
            "attempt_id": 0,
            "attempt_number": 1,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": assessment.passing_score_percent,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_preview_final_assessment_detail_view(request, course_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    _, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)

    response_payload = serialize_company_preview_assessment_detail(final_assessment, user=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(final_assessment, user=request.user),
            details={"course_id": [str(course_id)]},
            status=503,
        )
    return success_response(response_payload)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_preview_final_assessment_submit_view(request, course_id: int):
    course = get_company_preview_course(request.user, course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course was not found.", details={"course_id": [str(course_id)]}, status=404)

    lessons = company_preview_course_lessons(course)
    _, final_assessment = ensure_company_preview_course_assessment_map(course, lessons=lessons)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)

    generated_questions = get_cached_generated_course_assessment_questions(final_assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=final_assessment,
        generated_questions=generated_questions or None,
    )
    score_percent, passed, _, _ = score_course_assessment_submission_details(
        final_assessment,
        payload["answers_by_question_id"],
        generated_questions=generated_questions or None,
    )
    if generated_questions:
        clear_cached_generated_course_assessment_questions(final_assessment, user=request.user)
    message = (
        "Final exam passed. Course completed."
        if passed
        else f"Final exam submitted. Score {score_percent}%. Reach {final_assessment.passing_score_percent}% to complete the course."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": final_assessment.id,
            "attempt_id": 0,
            "attempt_number": 1,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": final_assessment.passing_score_percent,
            "course_completed": passed,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_detail_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is not None:
        learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    learning_record_count = course.learning_records.count()
    lesson_progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    next_step_label = "Enroll to start" if learning_record is None else "Continue learning"
    if learning_record is not None and learning_record.status == LearningRecord.Status.COMPLETED:
        next_step_label = "Review course"

    return success_response(
        serialize_student_course_detail(
            course,
            current_user=request.user,
            learning_record=learning_record,
            learning_record_count=learning_record_count,
            lessons=lessons,
            lesson_progress_map=lesson_progress_map,
            next_step_label=next_step_label,
            next_step_href=get_learning_record_resume_href(learning_record) if learning_record is not None else None,
        )
    )


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_review_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(
            request,
            "FORBIDDEN",
            "You must enroll in this course before leaving a review.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    payload = validate_student_course_review_payload(parse_json_body(request))
    review = CourseReview.objects.filter(course=course, student=request.user).first()
    created = review is None
    if review is None:
        review = CourseReview(course=course, student=request.user)

    review.rating = payload["rating"]
    review.review_text = payload["review_text"]
    review.full_clean()
    review.save()

    review_summary = course_review_summary_map([course.id]).get(course.id, {"average_rating": None, "rating_count": 0})
    return success_response(
        {
            "message": "Your course review was saved.",
            "review": serialize_course_review(review, current_user=request.user),
            "average_rating": review_summary["average_rating"],
            "rating_count": review_summary["rating_count"],
        },
        status=201 if created else 200,
    )


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_enrollment_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record, created = ensure_learning_record_for_course(request.user, course)
    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson_progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    completed_lesson_count = sum(
        1 for progress in lesson_progress_map.values() if progress.status == LessonProgress.Status.COMPLETED
    )

    return success_response(
        {
            "course_id": course.id,
            "created": created,
            "enrollment": serialize_student_course_enrollment(
                learning_record,
                lesson_count=len(lessons),
                completed_lesson_count=completed_lesson_count,
            ),
            "next_step_href": get_learning_record_resume_href(learning_record),
            "next_step_label": "Start first lesson" if learning_record.status == LearningRecord.Status.NOT_STARTED else "Continue learning",
        },
        status=201 if created else 200,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_detail_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(
            request,
            "FORBIDDEN",
            "You must enroll in this course before viewing lessons.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson is not available.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts_by_assessment_id = latest_course_assessment_attempts_by_assessment_id(
        student=request.user,
        course=course,
    )
    if not lesson_is_unlocked_for_student(
        lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the previous lesson exam with 90 percent or higher to unlock this lesson.",
            details={"lesson_id": [str(lesson_id)]},
            status=403,
        )
    progress = progress_map.get(lesson.id)
    if progress is None:
        raise ValidationError({"lesson": ["Lesson progress is not available for this lesson."]})

    lesson_index = lessons.index(lesson)
    previous_lesson = lessons[lesson_index - 1] if lesson_index > 0 else None
    next_lesson = lessons[lesson_index + 1] if lesson_index < len(lessons) - 1 else None
    next_lesson_href = None
    if next_lesson is not None and lesson_is_unlocked_for_student(
        next_lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        next_lesson_href = student_lesson_href(next_lesson.course_id, next_lesson.id)
    return success_response(
        serialize_student_lesson_detail(
            lesson,
            progress=progress,
            total_lessons=len(lessons),
            previous_lesson=previous_lesson,
            next_lesson_href=next_lesson_href,
            lesson_exam=serialize_course_assessment_summary(
                assessment_by_lesson_id.get(lesson.id),
                student=request.user,
                unlocked=lesson_assessment_unlocked(lesson, progress_map=progress_map),
            ),
            final_exam=serialize_course_assessment_summary(
                final_assessment,
                student=request.user,
                unlocked=final_course_assessment_unlocked(
                    lessons=lessons,
                    progress_map=progress_map,
                    assessment_by_lesson_id=assessment_by_lesson_id,
                    latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
                ),
            )
            if lesson_index == len(lessons) - 1
            else None,
        )
    )


@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_progress_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(
            request,
            "FORBIDDEN",
            "You must enroll in this course before updating lesson progress.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    payload = validate_student_lesson_progress_payload(parse_json_body(request))
    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson is not available.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts_by_assessment_id = latest_course_assessment_attempts_by_assessment_id(
        student=request.user,
        course=course,
    )
    if not lesson_is_unlocked_for_student(
        lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the previous lesson exam with 90 percent or higher to unlock this lesson.",
            details={"lesson_id": [str(lesson_id)]},
            status=403,
        )
    progress = progress_map.get(lesson.id)
    if progress is None:
        raise ValidationError({"lesson": ["Lesson progress is not available for this lesson."]})

    now = timezone.now()
    update_fields: list[str] = []
    if payload["status"] == LessonProgress.Status.IN_PROGRESS:
        if progress.status == LessonProgress.Status.COMPLETED:
            raise ValidationError({"status": ["Completed lessons cannot move back to in progress."]})
        if progress.status != LessonProgress.Status.IN_PROGRESS:
            progress.status = LessonProgress.Status.IN_PROGRESS
            progress.started_at = progress.started_at or now
            progress.completed_at = None
            update_fields.extend(["status", "started_at", "completed_at"])
    else:
        progress.status = LessonProgress.Status.COMPLETED
        progress.started_at = progress.started_at or now
        progress.completed_at = now
        update_fields.extend(["status", "started_at", "completed_at"])

    if update_fields:
        progress.full_clean()
        progress.save(update_fields=[*update_fields, "updated_at"])

    learning_record = sync_learning_record_progress(learning_record)
    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    progress = progress_map[lesson.id]
    latest_attempts_by_assessment_id = latest_course_assessment_attempts_by_assessment_id(
        student=request.user,
        course=course,
    )
    lesson_index = lessons.index(lesson)
    previous_lesson = lessons[lesson_index - 1] if lesson_index > 0 else None
    next_lesson = lessons[lesson_index + 1] if lesson_index < len(lessons) - 1 else None
    next_lesson_href = None
    if next_lesson is not None and lesson_is_unlocked_for_student(
        next_lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        next_lesson_href = student_lesson_href(next_lesson.course_id, next_lesson.id)

    return success_response(
        {
            "message": "Lesson marked complete."
            if payload["status"] == LessonProgress.Status.COMPLETED
            else "Lesson started.",
            "lesson": serialize_student_lesson_detail(
                lesson,
                progress=progress,
                total_lessons=len(lessons),
                previous_lesson=previous_lesson,
                next_lesson_href=next_lesson_href,
                lesson_exam=serialize_course_assessment_summary(
                    assessment_by_lesson_id.get(lesson.id),
                    student=request.user,
                    unlocked=lesson_assessment_unlocked(lesson, progress_map=progress_map),
                ),
                final_exam=serialize_course_assessment_summary(
                    final_assessment,
                    student=request.user,
                    unlocked=final_course_assessment_unlocked(
                        lessons=lessons,
                        progress_map=progress_map,
                        assessment_by_lesson_id=assessment_by_lesson_id,
                        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
                    ),
                )
                if lesson_index == len(lessons) - 1
                else None,
            ),
            "enrollment": serialize_student_course_enrollment(
                learning_record,
                lesson_count=len(lessons),
                completed_lesson_count=sum(
                    1 for item in progress_map.values() if item.status == LessonProgress.Status.COMPLETED
                ),
            ),
            "next_step_href": get_learning_record_resume_href(learning_record),
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_assessment_detail_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking lesson exams.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, _ = build_course_assessment_map(course)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)
    if not lesson_assessment_unlocked(lesson, progress_map=progress_map):
        return error_response(request, "FORBIDDEN", "Complete the lesson before taking its exam.", details={"lesson_id": [str(lesson_id)]}, status=403)

    response_payload = serialize_course_assessment_detail(assessment, student=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(assessment, user=request.user),
            details={"lesson_id": [str(lesson_id)]},
            status=503,
        )
    return success_response(response_payload)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_assessment_submit_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking lesson exams.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, _ = build_course_assessment_map(course)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)
    if not lesson_assessment_unlocked(lesson, progress_map=progress_map):
        return error_response(request, "FORBIDDEN", "Complete the lesson before taking its exam.", details={"lesson_id": [str(lesson_id)]}, status=403)

    generated_questions = get_cached_generated_course_assessment_questions(assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=assessment,
        generated_questions=generated_questions or None,
    )
    now = timezone.now()
    attempt_number = next_course_assessment_attempt_number(request.user, assessment)
    with transaction.atomic():
        attempt = CourseAssessmentAttempt(
            student=request.user,
            assessment=assessment,
            attempt_number=attempt_number,
            score_percent=0,
            passed=False,
            started_at=now,
            submitted_at=now,
            completed_at=now,
        )
        attempt.full_clean()
        attempt.save()

        if not generated_questions:
            for question_id, selected_option_ids in payload["answers_by_question_id"].items():
                for option_id in selected_option_ids:
                    selection = CourseAssessmentAttemptSelection(
                        attempt=attempt,
                        question_id=question_id,
                        option_id=option_id,
                    )
                    selection.full_clean()
                    selection.save()

        score_percent, passed, _, _ = score_course_assessment_submission_details(
            assessment,
            payload["answers_by_question_id"],
            generated_questions=generated_questions or None,
        )
        attempt.score_percent = score_percent
        attempt.passed = passed
        attempt.full_clean()
        attempt.save(update_fields=["score_percent", "passed", "updated_at"])
    if generated_questions:
        clear_cached_generated_course_assessment_questions(assessment, user=request.user)

    message = (
        "Lesson exam passed. The next lesson is now unlocked."
        if passed
        else f"Lesson exam submitted. Score {score_percent}%. Reach {assessment.passing_score_percent}% to unlock the next lesson."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": assessment.id,
            "attempt_id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": assessment.passing_score_percent,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_final_assessment_detail_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking the final exam.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts = latest_course_assessment_attempts_by_assessment_id(student=request.user, course=course)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)
    if not final_course_assessment_unlocked(
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the last lesson and pass its exam with 90 percent or higher to unlock the final exam.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    response_payload = serialize_course_assessment_detail(final_assessment, student=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(final_assessment, user=request.user),
            details={"course_id": [str(course_id)]},
            status=503,
        )
    return success_response(response_payload)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_final_assessment_submit_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking the final exam.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts = latest_course_assessment_attempts_by_assessment_id(student=request.user, course=course)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)
    if not final_course_assessment_unlocked(
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the last lesson and pass its exam with 90 percent or higher to unlock the final exam.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    generated_questions = get_cached_generated_course_assessment_questions(final_assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=final_assessment,
        generated_questions=generated_questions or None,
    )
    now = timezone.now()
    attempt_number = next_course_assessment_attempt_number(request.user, final_assessment)
    with transaction.atomic():
        attempt = CourseAssessmentAttempt(
            student=request.user,
            assessment=final_assessment,
            attempt_number=attempt_number,
            score_percent=0,
            passed=False,
            started_at=now,
            submitted_at=now,
            completed_at=now,
        )
        attempt.full_clean()
        attempt.save()

        if not generated_questions:
            for question_id, selected_option_ids in payload["answers_by_question_id"].items():
                for option_id in selected_option_ids:
                    selection = CourseAssessmentAttemptSelection(
                        attempt=attempt,
                        question_id=question_id,
                        option_id=option_id,
                    )
                    selection.full_clean()
                    selection.save()

        score_percent, passed, _, _ = score_course_assessment_submission_details(
            final_assessment,
            payload["answers_by_question_id"],
            generated_questions=generated_questions or None,
        )
        attempt.score_percent = score_percent
        attempt.passed = passed
        attempt.full_clean()
        attempt.save(update_fields=["score_percent", "passed", "updated_at"])
    if generated_questions:
        clear_cached_generated_course_assessment_questions(final_assessment, user=request.user)

    learning_record = sync_learning_record_progress(learning_record)
    message = (
        "Final exam passed. Course completed."
        if passed
        else f"Final exam submitted. Score {score_percent}%. Reach {final_assessment.passing_score_percent}% to complete the course."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": final_assessment.id,
            "attempt_id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": final_assessment.passing_score_percent,
            "course_completed": learning_record.status == LearningRecord.Status.COMPLETED,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_matches_view(request):
    from services.matching_jobs import (
        cache_student_matches_snapshot,
        get_student_matches_snapshot,
        queue_student_matches_snapshot_refresh,
    )

    cached_payload = get_student_matches_snapshot(request.user.id)
    if cached_payload is not None:
        queue_student_matches_snapshot_refresh(request.user.id)
        return success_response(cached_payload)

    matches = ranked_matches_for_student(request.user)
    bookmarked_vacancy_ids = set(
        JobBookmark.objects.filter(student=request.user).values_list("vacancy_id", flat=True)
    )
    active_application_vacancy_ids = set(
        Application.objects.filter(student=request.user)
        .exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
        .values_list("vacancy_id", flat=True)
    )

    payload = {
        "student_id": request.user.id,
        "match_count": len(matches),
        "matches": [
            serialize_student_match_record(
                request.user,
                vacancy,
                match_result,
                bookmarked_vacancy_ids=bookmarked_vacancy_ids,
                active_application_vacancy_ids=active_application_vacancy_ids,
            )
            for vacancy, match_result in matches
        ],
    }
    cache_student_matches_snapshot(request.user.id, payload)
    return success_response(payload)


@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_job_bookmark_view(request, vacancy_id: int):
    if request.method == "DELETE":
        JobBookmark.objects.filter(student=request.user, vacancy_id=vacancy_id).delete()
        return success_response(
            {
                "vacancy_id": vacancy_id,
                "is_bookmarked": False,
                "message": "Saved state removed.",
            }
        )

    vacancy = get_visible_student_vacancy(vacancy_id)
    if vacancy is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested vacancy is not available for bookmarking.",
            details={"vacancy_id": [str(vacancy_id)]},
            status=404,
        )

    bookmark, created = JobBookmark.objects.get_or_create(student=request.user, vacancy=vacancy)
    if not created:
        return success_response(
            {
                "vacancy_id": vacancy.id,
                "is_bookmarked": True,
                "message": "Saved for later.",
            }
        )
    return success_response(
        {
            "vacancy_id": vacancy.id,
            "is_bookmarked": True,
            "message": "Saved for later.",
        },
        status=201,
    )


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_applications_view(request):
    if request.method == "GET":
        applications = list(
            Application.objects.filter(student=request.user)
            .select_related("company", "vacancy")
            .prefetch_related("history__actor")
            .order_by("-updated_at", "-id")
        )
        return success_response(
            {
                "student_id": request.user.id,
                "application_count": len(applications),
                "applications": [serialize_student_application(application) for application in applications],
            }
        )

    payload = validate_application_payload(parse_json_body(request))
    vacancy = get_visible_student_vacancy(payload["vacancy_id"])
    if vacancy is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested vacancy is not available for student applications.",
            details={"vacancy_id": [str(payload["vacancy_id"])]},
            status=404,
        )

    duplicate_application = Application.objects.filter(
        student=request.user,
        vacancy=vacancy,
    ).exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
    if duplicate_application.exists():
        raise ValidationError({"vacancy_id": ["An active application already exists for this vacancy."]})

    try:
        with transaction.atomic():
            application = Application(
                company=vacancy.company,
                vacancy=vacancy,
                student=request.user,
                status=Application.Status.SUBMITTED,
            )
            application.full_clean()
            application.save()
            create_application_history(
                application,
                from_status="",
                to_status=Application.Status.SUBMITTED,
                actor=request.user,
                note="Application submitted by student.",
            )
            get_or_create_application_candidate_access(application)
    except IntegrityError as exc:
        raise ValidationError({"vacancy_id": ["An active application already exists for this vacancy."]}) from exc

    application = (
        Application.objects.filter(pk=application.pk)
        .select_related("company", "vacancy")
        .prefetch_related("history__actor")
        .first()
    )
    return success_response(serialize_student_application(application), status=201)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_application_withdraw_view(request, application_id: int):
    application = get_student_application(request.user, application_id)
    if application is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested application was not found.",
            details={"application_id": [str(application_id)]},
            status=404,
        )

    if not application_is_withdrawable(application):
        raise ValidationError({"application_id": ["This application can no longer be withdrawn."]})

    transition_application_status(
        application,
        to_status=Application.Status.WITHDRAWN,
        actor=request.user,
        note="Application withdrawn by student.",
    )
    application = get_student_application(request.user, application_id)
    return success_response(serialize_student_application(application))


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
    company.profile_image = payload["profile_image"]
    company.cover_image = payload["cover_image"]
    company.job_posting_id = payload["job_posting_id"]
    company.founder_name = payload["founder_name"]
    company.headquarters_address = payload["headquarters_address"]
    company.office_locations = payload["office_locations"]
    company.founded_at = payload["founded_at"]
    company.website_url = payload["website_url"]
    company.industry = payload["industry"]
    company.company_points = payload["company_points"]
    company.business_domains = payload["business_domains"]
    company.business_models = payload["business_models"]
    company.employee_count_label = payload["employee_count_label"]
    company.market_category = payload["market_category"]
    company.capital_label = payload["capital_label"]
    company.revenue_label = payload["revenue_label"]
    company.tagline = payload["tagline"]
    company.company_features = payload["company_features"]
    company.additional_company_info = payload["additional_company_info"]
    company.full_clean()
    company.save(
        update_fields=[
            "name",
            "description",
            "profile_image",
            "cover_image",
            "job_posting_id",
            "founder_name",
            "headquarters_address",
            "office_locations",
            "founded_at",
            "website_url",
            "industry",
            "company_points",
            "business_domains",
            "business_models",
            "employee_count_label",
            "market_category",
            "capital_label",
            "revenue_label",
            "tagline",
            "company_features",
            "additional_company_info",
            "updated_at",
        ]
    )

    return success_response(serialize_company_profile(request.user))


def serialize_company_hiring_preferences(prefs: "CompanyHiringPreferences") -> dict:
    return {
        "default_experience_level": prefs.default_experience_level,
        "preferred_skills": prefs.preferred_skills or [],
        "min_salary": prefs.min_salary,
        "max_salary": prefs.max_salary,
    }


def validate_company_hiring_preferences_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValidationError("Invalid payload format.")
    
    default_experience_level = payload.get("default_experience_level", "")
    preferred_skills = payload.get("preferred_skills", [])
    min_salary = payload.get("min_salary")
    max_salary = payload.get("max_salary")
    
    if default_experience_level and default_experience_level not in [
        "entry", "junior", "mid", "senior", "lead", "director"
    ]:
        raise ValidationError({"default_experience_level": ["Invalid experience level."]})
    
    if not isinstance(preferred_skills, list):
        raise ValidationError({"preferred_skills": ["Preferred skills must be a list."]})
    
    if min_salary is not None:
        if not isinstance(min_salary, int) or min_salary < 0:
            raise ValidationError({"min_salary": ["Minimum salary must be a non-negative integer."]})
    
    if max_salary is not None:
        if not isinstance(max_salary, int) or max_salary < 0:
            raise ValidationError({"max_salary": ["Maximum salary must be a non-negative integer."]})
    
    if min_salary is not None and max_salary is not None and min_salary > max_salary:
        raise ValidationError({"max_salary": ["Maximum salary must be greater than or equal to minimum salary."]})
    
    return {
        "default_experience_level": default_experience_level,
        "preferred_skills": preferred_skills,
        "min_salary": min_salary,
        "max_salary": max_salary,
    }


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.COMPANY])
def company_hiring_preferences_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})
    
    prefs, _created = CompanyHiringPreferences.objects.get_or_create(company=company)
    
    if request.method == "GET":
        return success_response(serialize_company_hiring_preferences(prefs))
    
    payload = validate_company_hiring_preferences_payload(parse_json_body(request))
    prefs.default_experience_level = payload["default_experience_level"]
    prefs.preferred_skills = payload["preferred_skills"]
    prefs.min_salary = payload["min_salary"]
    prefs.max_salary = payload["max_salary"]
    prefs.full_clean()
    prefs.save(update_fields=["default_experience_level", "preferred_skills", "min_salary", "max_salary", "updated_at"])
    
    return success_response(serialize_company_hiring_preferences(prefs))


def serialize_company_member(member: CompanyMember) -> dict:
    return {
        "id": member.id,
        "user_id": member.user.id,
        "email": member.user.email,
        "full_name": member.user.full_name,
        "role": member.role,
        "created_at": member.created_at.isoformat(),
    }


def validate_company_member_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValidationError("Request body must be a JSON object.")
    
    email = payload.get("email", "").strip()
    if not email:
        raise ValidationError({"email": ["Email is required."]})
    
    role = payload.get("role", "").strip()
    if role and role not in dict(CompanyMember.MemberRole.choices):
        raise ValidationError({"role": [f"Role must be one of: {', '.join(dict(CompanyMember.MemberRole.choices).keys())}"]})
    
    return {
        "email": email,
        "role": role or CompanyMember.MemberRole.MEMBER,
    }


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_members_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})
    
    if request.method == "GET":
        members = list(
            CompanyMember.objects.filter(company=company)
            .select_related("user")
            .order_by("user_id")
        )
        return success_response([serialize_company_member(member) for member in members])
    
    payload = validate_company_member_payload(parse_json_body(request))
    
    try:
        user = User.objects.get(email=payload["email"], role=User.Role.COMPANY, company=company)
    except User.DoesNotExist:
        raise ValidationError({"email": ["No company user found with this email in your organization."]})
    
    member, created = CompanyMember.objects.get_or_create(
        company=company,
        user=user,
        defaults={"role": payload["role"]},
    )
    
    if not created:
        raise ValidationError({"email": ["This user is already a member of your company."]})
    
    return success_response(serialize_company_member(member))


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_member_detail_view(request, member_id: int):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})
    
    try:
        member = CompanyMember.objects.get(id=member_id, company=company)
    except CompanyMember.DoesNotExist:
        raise ValidationError({"member": ["Member not found."]}, status_code=404)
    
    if request.method == "DELETE":
        member.delete()
        return success_response({"success": True})
    
    payload = validate_company_member_payload(parse_json_body(request))
    member.role = payload["role"]
    member.full_clean()
    member.save(update_fields=["role", "updated_at"])
    
    return success_response(serialize_company_member(member))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_vacancies_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if request.method == "GET":
        vacancies = list(
            Vacancy.objects.filter(company=company)
            .select_related("company", "created_by")
            .prefetch_related("skill_requirements__skill", "language_requirements")
            .order_by("-updated_at", "-id")
        )
        return success_response(
            {
                "vacancies": [serialize_vacancy(vacancy) for vacancy in vacancies],
                "available_skills": [serialize_skill(skill) for skill in Skill.objects.order_by("name")],
            }
        )

    payload = validate_vacancy_payload(parse_json_body(request))
    with transaction.atomic():
        vacancy = Vacancy(
            company=company,
            created_by=request.user,
            title=payload["title"],
            description=payload["description"],
            employment_type=payload["employment_type"],
            experience_level=payload["experience_level"],
            location=payload["location"],
            work_style=payload["work_style"],
            relocation_support=payload["relocation_support"],
            min_salary=payload["min_salary"],
            max_salary=payload["max_salary"],
            posting_details=payload["posting_details"],
            status=payload["status"],
        )
        vacancy.full_clean()
        vacancy.save()
        sync_vacancy_skill_requirements(
            vacancy,
            required_skills=payload["required_skills"],
            preferred_skills=payload["preferred_skills"],
        )
        sync_vacancy_language_requirements(
            vacancy,
            language_requirements=payload["language_requirements"],
        )
    return success_response(serialize_vacancy(vacancy), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_vacancy_detail_view(request, vacancy_id: int):
    from services.matching_jobs import (
        invalidate_company_vacancy_matches_snapshot,
        queue_company_vacancy_matches_snapshot_refresh,
    )

    vacancy = get_company_vacancy(request.user, vacancy_id)

    if request.method == "DELETE":
        vacancy.status = Vacancy.Status.INACTIVE
        vacancy.full_clean()
        vacancy.save(update_fields=["status", "updated_at"])
        invalidate_company_vacancy_matches_snapshot(vacancy.id)
        return success_response(serialize_vacancy(vacancy))

    payload = validate_vacancy_payload(parse_json_body(request))
    vacancy.title = payload["title"]
    vacancy.description = payload["description"]
    vacancy.employment_type = payload["employment_type"]
    vacancy.experience_level = payload["experience_level"]
    vacancy.location = payload["location"]
    vacancy.work_style = payload["work_style"]
    vacancy.relocation_support = payload["relocation_support"]
    vacancy.min_salary = payload["min_salary"]
    vacancy.max_salary = payload["max_salary"]
    vacancy.posting_details = payload["posting_details"]
    vacancy.status = payload["status"]
    with transaction.atomic():
        vacancy.full_clean()
        vacancy.save(
            update_fields=[
                "title",
                "description",
                "employment_type",
                "experience_level",
                "location",
                "work_style",
                "relocation_support",
                "min_salary",
                "max_salary",
                "posting_details",
                "status",
                "updated_at",
            ]
        )
        sync_vacancy_skill_requirements(
            vacancy,
            required_skills=payload["required_skills"],
            preferred_skills=payload["preferred_skills"],
        )
        sync_vacancy_language_requirements(
            vacancy,
            language_requirements=payload["language_requirements"],
        )
    invalidate_company_vacancy_matches_snapshot(vacancy.id)
    queue_company_vacancy_matches_snapshot_refresh(vacancy.id)
    return success_response(serialize_vacancy(vacancy))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_vacancy_matches_view(request, vacancy_id: int):
    from services.matching_jobs import (
        cache_company_vacancy_matches_snapshot,
        get_company_vacancy_matches_snapshot,
        queue_company_vacancy_matches_snapshot_refresh,
    )

    vacancy = get_company_vacancy(request.user, vacancy_id)
    cached_payload = get_company_vacancy_matches_snapshot(vacancy.id)
    if cached_payload is not None:
        queue_company_vacancy_matches_snapshot_refresh(vacancy.id)
        return success_response(cached_payload)

    ensure_company_match_candidate_accesses_synced(vacancy.company)
    matches = ranked_matches_for_vacancy(vacancy)
    payload = {
        "company_id": vacancy.company_id,
        "vacancy_id": vacancy.id,
        "vacancy_title": vacancy.title,
        "match_count": len(matches),
        "matches": [
            serialize_company_vacancy_match_record(vacancy, student, match_result)
            for student, match_result in matches
        ],
    }
    cache_company_vacancy_matches_snapshot(vacancy.id, payload)
    return success_response(payload)


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
    from services.matching_jobs import (
        invalidate_student_matches_snapshot,
        queue_student_matches_snapshot_refresh,
    )

    invalidate_student_matches_snapshot(request.user.id)
    queue_student_matches_snapshot_refresh(request.user.id)

    return success_response(serialize_student_skills(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skill_detail_view(request, student_skill_id: int):
    from services.matching_jobs import (
        invalidate_student_matches_snapshot,
        queue_student_matches_snapshot_refresh,
    )

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
        invalidate_student_matches_snapshot(request.user.id)
        queue_student_matches_snapshot_refresh(request.user.id)
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
    invalidate_student_matches_snapshot(request.user.id)
    queue_student_matches_snapshot_refresh(request.user.id)

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


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_preparation_summary_view(request):
    return success_response(serialize_preparation_summary(request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_practice_questions_view(request):
    selected_category = (request.GET.get("category") or "").strip()
    selected_exam_id = request.GET.get("exam_id")
    exam_id = int(selected_exam_id) if selected_exam_id and selected_exam_id.isdigit() else None
    practice_queryset = visible_practice_questions_queryset(category=selected_category or None, exam_id=exam_id)
    questions = list(practice_queryset[:12])
    available_exam_ids = list(
        visible_practice_questions_queryset(category=selected_category or None)
        .values_list("exam_id", flat=True)
        .distinct()
    )
    exams_queryset = visible_student_exams_queryset().filter(id__in=available_exam_ids)

    return success_response(
        {
            "selected_category": selected_category or None,
            "selected_exam_id": exam_id,
            "categories": [
                {
                    "value": category,
                    "label": category.replace("_", " ").title(),
                }
                for category in preparation_categories_for_student(request.user)
            ],
            "exams": [
                {
                    "exam_id": exam.id,
                    "title": exam.title,
                    "category": exam.category,
                }
                for exam in exams_queryset
            ],
            "question_count": len(questions),
            "questions": [serialize_practice_question(question, student=request.user) for question in questions],
        }
    )


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_practice_question_attempt_view(request, question_id: int):
    question = visible_practice_questions_queryset().filter(pk=question_id).first()
    if question is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested practice question is not available.",
            details={"question_id": [str(question_id)]},
            status=404,
        )

    payload = parse_json_body(request)
    selected_option_id = payload.get("selected_option_id")
    if not isinstance(selected_option_id, int):
        raise ValidationError({"selected_option_id": ["This field is required."]})

    selected_option = question.answer_options.filter(pk=selected_option_id, status=ExamAnswerOption.Status.ACTIVE).first()
    if selected_option is None:
        raise ValidationError({"selected_option_id": ["Select an active option for this question."]})

    correct_option = question.answer_options.filter(status=ExamAnswerOption.Status.ACTIVE, is_correct=True).order_by("sequence_number", "id").first()
    if correct_option is None:
        raise ValidationError({"question_id": ["This practice question is not ready yet."]})

    attempt = PracticeQuestionAttempt(
        student=request.user,
        exam=question.exam,
        question=question,
        selected_option=selected_option,
        is_correct=selected_option.id == correct_option.id,
    )
    attempt.full_clean()
    attempt.save()

    category_attempts = PracticeQuestionAttempt.objects.filter(student=request.user, exam__category=question.exam.category)
    category_accuracy = None
    if category_attempts.exists():
        category_accuracy = round((category_attempts.filter(is_correct=True).count() / category_attempts.count()) * 100, 1)

    return success_response(
        {
            "attempt_id": attempt.id,
            "question_id": question.id,
            "selected_option_id": selected_option.id,
            "is_correct": attempt.is_correct,
            "correct_option_id": correct_option.id,
            "correct_option_text": correct_option.option_text,
            "feedback": "Correct answer." if attempt.is_correct else "Not quite. Review the correct option and try another question.",
            "performance_snapshot": {
                "category": question.exam.category,
                "practice_attempt_count": category_attempts.count(),
                "practice_accuracy": category_accuracy,
            },
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_exam_detail_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    eligibility = evaluate_exam_retake_eligibility(request.user, exam)
    if not eligibility["can_take"]:
        return error_response(
            request,
            "FORBIDDEN",
            eligibility["message"],
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    return success_response(serialize_student_exam_detail(exam, student=request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_mock_exam_detail_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested mock exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    if not exam_is_ready_for_student(exam):
        return error_response(
            request,
            "FORBIDDEN",
            "This mock exam is not ready yet.",
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    return success_response(serialize_student_mock_exam_detail(exam, student=request.user))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_exam_submit_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    eligibility = evaluate_exam_retake_eligibility(request.user, exam)
    if not eligibility["can_take"]:
        return error_response(
            request,
            "FORBIDDEN",
            eligibility["message"],
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    payload = validate_exam_submission_payload(parse_json_body(request), exam=exam)
    now = timezone.now()
    with transaction.atomic():
        attempt = ExamAttempt(
            student=request.user,
            exam=exam,
            attempt_number=eligibility["next_attempt_number"],
            status=ExamAttempt.Status.SUBMITTED,
            started_at=now,
            submitted_at=now,
        )
        attempt.full_clean()
        attempt.save()

        for question_id, selected_option_id in payload["answers_by_question_id"].items():
            answer = ExamAttemptAnswer(
                attempt=attempt,
                question_id=question_id,
                selected_option_id=selected_option_id,
            )
            answer.full_clean()
            answer.save()

        score_percent, passed = score_exam_submission(exam, payload["answers_by_question_id"])
        attempt.status = ExamAttempt.Status.SCORED
        attempt.score_percent = score_percent
        attempt.passed = passed
        attempt.completed_at = now
        attempt.full_clean()
        attempt.save(
            update_fields=[
                "status",
                "score_percent",
                "passed",
                "completed_at",
                "updated_at",
            ]
        )

        result = ExamResult(
            student=request.user,
            exam=exam,
            attempt=attempt,
            exam_title=exam.title,
            category=exam.category,
            score_percent=score_percent,
            passed=passed,
            attempt_number=attempt.attempt_number,
            taken_at=now,
        )
        result.full_clean()
        result.save()

    return success_response(
        {
            "exam_id": exam.id,
            "attempt_id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": exam.passing_score_percent,
            "result_id": result.id,
            "history_href": "/student/exams",
        },
        status=201,
    )


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_mock_exam_submit_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested mock exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    if not exam_is_ready_for_student(exam):
        return error_response(
            request,
            "FORBIDDEN",
            "This mock exam is not ready yet.",
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    payload = validate_exam_submission_payload(parse_json_body(request), exam=exam)
    now = timezone.now()
    score_percent, _, correct_answer_count, total_questions = score_exam_submission_details(exam, payload["answers_by_question_id"])

    with transaction.atomic():
        attempt = MockExamAttempt(
            student=request.user,
            exam=exam,
            exam_title=exam.title,
            category=exam.category,
            attempt_number=next_mock_exam_attempt_number(request.user, exam),
            score_percent=score_percent,
            correct_answer_count=correct_answer_count,
            total_questions=total_questions,
            started_at=now,
            submitted_at=now,
        )
        attempt.full_clean()
        attempt.save()

        for question_id, selected_option_id in payload["answers_by_question_id"].items():
            answer = MockExamAttemptAnswer(
                attempt=attempt,
                question_id=question_id,
                selected_option_id=selected_option_id,
                is_correct=question_id in {
                    question.id
                    for question in active_exam_questions(exam)
                    if any(
                        option.id == selected_option_id and option.status == ExamAnswerOption.Status.ACTIVE and option.is_correct
                        for option in question.answer_options.all()
                    )
                },
            )
            answer.full_clean()
            answer.save()

    return success_response(
        {
            "attempt_id": attempt.id,
            "exam_id": exam.id,
            "exam_title": exam.title,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "correct_answer_count": correct_answer_count,
            "total_questions": total_questions,
            "history_href": "/student/preparation",
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_applications_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    applications = list(
        Application.objects.filter(company=company)
        .select_related("company", "vacancy", "student")
        .prefetch_related("history__actor")
        .order_by("-updated_at", "-id")
    )
    return success_response(
        {
            "company_id": company.id,
            "application_count": len(applications),
            "applications": [serialize_company_application(application) for application in applications],
        }
    )


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_application_shortlist_view(request, application_id: int):
    application = get_company_application(request.user, application_id)
    if application is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested application was not found.",
            details={"application_id": [str(application_id)]},
            status=404,
        )

    if application.status == Application.Status.SHORTLISTED:
        return success_response(serialize_company_application(application))

    if not application_is_shortlistable(application):
        raise ValidationError({"application_id": ["This application cannot be shortlisted from its current status."]})

    with transaction.atomic():
        candidate_access = get_or_create_application_candidate_access(application)
        shortlist_entry = CandidateShortlist.objects.filter(candidate_access=candidate_access).first()
        if shortlist_entry is None:
            shortlist_entry = CandidateShortlist(
                candidate_access=candidate_access,
                company=application.company,
                student=application.student,
                created_by=request.user,
            )
            shortlist_entry.full_clean()
            shortlist_entry.save()
        transition_application_status(
            application,
            to_status=Application.Status.SHORTLISTED,
            actor=request.user,
            note="Application shortlisted by company.",
        )

    application = get_company_application(request.user, application_id)
    return success_response(serialize_company_application(application))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_application_reject_view(request, application_id: int):
    application = get_company_application(request.user, application_id)
    if application is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested application was not found.",
            details={"application_id": [str(application_id)]},
            status=404,
        )

    if not application_is_rejectable(application):
        raise ValidationError({"application_id": ["This application cannot be rejected from its current status."]})

    transition_application_status(
        application,
        to_status=Application.Status.REJECTED,
        actor=request.user,
        note="Application rejected by company.",
    )
    application = get_company_application(request.user, application_id)
    return success_response(serialize_company_application(application))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidates_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    from api.matching_views import queue_company_match_refreshes

    queue_company_match_refreshes(company)
    page, page_size = parse_pagination_params(request)
    search_query = request.GET.get("q", "").strip()
    visibility_filter = (request.GET.get("visibility") or "all").strip().lower()
    sort_by = (request.GET.get("sort") or "recently_updated").strip().lower()
    profile_visible = Q(student__visibility_settings__share_profile_preview=True)
    candidates_queryset = (
        CandidateReviewAccess.objects.filter(company=company, is_active=True)
        .select_related(
            "student",
            "company",
            "student__student_profile",
            "student__visibility_settings",
            "shortlist_entry",
            "shortlist_entry__created_by",
        )
        .prefetch_related("student__student_skills__skill")
        .annotate(
            notes_count=Count("notes", distinct=True),
            skill_count=Count("student__student_skills", distinct=True),
        )
    )

    if search_query:
        candidates_queryset = candidates_queryset.filter(
            Q(source__icontains=search_query)
            | (
                profile_visible
                & (
                    Q(student__full_name__icontains=search_query)
                    | Q(student__student_profile__desired_job_type__icontains=search_query)
                    | Q(student__student_profile__desired_work_location__icontains=search_query)
                    | Q(student__student_skills__skill__name__icontains=search_query)
                )
            )
        )

    if visibility_filter == "shortlisted":
        candidates_queryset = candidates_queryset.filter(shortlist_entry__isnull=False)
    elif visibility_filter == "profile_visible":
        candidates_queryset = candidates_queryset.filter(student__visibility_settings__share_profile_preview=True)
    elif visibility_filter == "learning_visible":
        candidates_queryset = candidates_queryset.filter(student__visibility_settings__share_learning_record=True)
    elif visibility_filter == "exams_visible":
        candidates_queryset = candidates_queryset.filter(student__visibility_settings__share_exam_results=True)
    elif visibility_filter == "fully_visible":
        candidates_queryset = candidates_queryset.filter(
            student__visibility_settings__share_profile_preview=True,
            student__visibility_settings__share_learning_record=True,
            student__visibility_settings__share_exam_results=True,
        )

    if sort_by == "candidate_az":
        candidates_queryset = candidates_queryset.order_by("student__full_name", "id")
    elif sort_by == "most_skills":
        candidates_queryset = candidates_queryset.order_by("-skill_count", "-updated_at", "-id")
    elif sort_by == "most_notes":
        candidates_queryset = candidates_queryset.order_by("-notes_count", "-updated_at", "-id")
    else:
        candidates_queryset = candidates_queryset.order_by("-updated_at", "-id")

    candidates_queryset = candidates_queryset.distinct()
    summary = candidates_queryset.aggregate(
        shortlisted=Count("id", filter=Q(shortlist_entry__isnull=False), distinct=True),
        profile_visible=Count("id", filter=Q(student__visibility_settings__share_profile_preview=True), distinct=True),
        learning_visible=Count("id", filter=Q(student__visibility_settings__share_learning_record=True), distinct=True),
        exam_visible=Count("id", filter=Q(student__visibility_settings__share_exam_results=True), distinct=True),
        fully_visible=Count(
            "id",
            filter=Q(
                student__visibility_settings__share_profile_preview=True,
                student__visibility_settings__share_learning_record=True,
                student__visibility_settings__share_exam_results=True,
            ),
            distinct=True,
        ),
    )
    page_candidates, pagination = paginate_queryset(candidates_queryset, page=page, page_size=page_size)
    candidates = list(page_candidates)
    return success_response(
        {
            "company_id": company.id,
            "candidate_count": pagination["total_count"],
            "candidates": [serialize_company_candidate(candidate) for candidate in candidates],
            "pagination": pagination,
            "summary": summary,
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_shortlist_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    page, page_size = parse_pagination_params(request)
    shortlist_queryset = (
        CandidateShortlist.objects.filter(company=company)
        .select_related("candidate_access", "created_by", "student")
        .order_by("-updated_at", "-id")
    )
    page_shortlists, pagination = paginate_queryset(shortlist_queryset, page=page, page_size=page_size)
    shortlists = list(page_shortlists)
    return success_response(
        {
            "company_id": company.id,
            "shortlist_count": pagination["total_count"],
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
            "pagination": pagination,
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
        page, page_size = parse_pagination_params(request)
        notes_queryset = (
            CandidateNote.objects.filter(candidate_access=candidate_access)
            .select_related("author")
            .order_by("-created_at", "-id")
        )
        page_notes, pagination = paginate_queryset(notes_queryset, page=page, page_size=page_size)
        notes = list(page_notes)
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "notes": [serialize_candidate_note(note) for note in notes],
                "pagination": pagination,
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

    page, page_size = parse_pagination_params(request)
    notes_queryset = (
        CandidateNote.objects.filter(candidate_access=candidate_access)
        .select_related("author")
        .order_by("-created_at", "-id")
    )
    page_notes, pagination = paginate_queryset(notes_queryset, page=page, page_size=page_size)
    notes = list(page_notes)
    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "notes": [serialize_candidate_note(note) for note in notes],
            "pagination": pagination,
        },
        status=201,
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_candidate_preview_view(request, candidate_access_id: int):
    candidate_access = get_candidate_review_access(request.user, candidate_access_id)
    visibility = get_visibility_settings(candidate_access.student)
    shortlist_entry = CandidateShortlist.objects.filter(candidate_access=candidate_access).select_related("created_by").first()
    page, page_size = parse_pagination_params(request)
    notes_queryset = (
        CandidateNote.objects.filter(candidate_access=candidate_access)
        .select_related("author")
        .order_by("-created_at", "-id")
    )
    page_notes, notes_pagination = paginate_queryset(notes_queryset, page=page, page_size=page_size)
    notes = list(page_notes)

    if not visibility.share_profile_preview:
        return success_response(
            {
                "candidate_access_id": candidate_access.id,
                "source": candidate_access.source,
                "visibility": "hidden",
                "student": None,
                "shortlist": serialize_candidate_shortlist(shortlist_entry),
                "notes": [serialize_candidate_note(note) for note in notes],
                "notes_pagination": notes_pagination,
                "restrictions": hidden_restrictions("Student profile preview is hidden by privacy settings."),
            }
        )

    student_skills = list(
        StudentSkill.objects.filter(student=candidate_access.student)
        .select_related("skill")
        .order_by("skill__name")
    )
    serialized_profile = serialize_student_profile(candidate_access.student)
    return success_response(
        {
            "candidate_access_id": candidate_access.id,
            "source": candidate_access.source,
            "visibility": "visible",
            "student": {
                **serialized_profile,
                "skills": [serialize_student_skill(student_skill) for student_skill in student_skills],
            },
            "shortlist": serialize_candidate_shortlist(shortlist_entry),
            "notes": [serialize_candidate_note(note) for note in notes],
            "notes_pagination": notes_pagination,
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

    page, page_size = parse_pagination_params(request)
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "").strip().lower()
    sort_by = request.GET.get("sort", "").strip().lower() or "upcoming"

    interviews_queryset = (
        Interview.objects.filter(company=company)
        .select_related("student", "company", "candidate_access", "requested_by")
    )

    if query:
        interviews_queryset = interviews_queryset.filter(
            Q(student__full_name__icontains=query)
            | Q(purpose__icontains=query)
            | Q(role_context__icontains=query)
            | Q(status__icontains=query)
        )

    if status and status != "all":
        interviews_queryset = interviews_queryset.filter(status=status)

    if sort_by == "candidate_az":
        interviews_queryset = interviews_queryset.order_by("student__full_name", "-updated_at", "-id")
    elif sort_by == "status":
        interviews_queryset = interviews_queryset.order_by("status", "-updated_at", "-id")
    elif sort_by == "recently_updated":
        interviews_queryset = interviews_queryset.order_by("-updated_at", "-id")
    else:
        interviews_queryset = interviews_queryset.order_by(
            F("scheduled_start").asc(nulls_last=True),
            "-updated_at",
            "-id",
        )

    summary = interviews_queryset.aggregate(
        total=Count("id"),
        upcoming=Count("id", filter=Q(scheduled_start__isnull=False, completed_at__isnull=True, cancelled_at__isnull=True)),
        awaiting_decision=Count("id", filter=Q(status__in=[Interview.Status.REQUESTED, Interview.Status.RESCHEDULED])),
        completed=Count("id", filter=Q(status=Interview.Status.COMPLETED)),
        cancelled=Count("id", filter=Q(status=Interview.Status.CANCELLED)),
    )
    page_interviews, pagination = paginate_queryset(interviews_queryset, page=page, page_size=page_size)
    interviews = list(page_interviews)
    return success_response(
        {
            "interviews": [serialize_interview(interview) for interview in interviews],
            "pagination": pagination,
            "summary": summary,
        }
    )


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
    is_direct_schedule = payload.get("start_at") is not None and payload.get("end_at") is not None
    interview = Interview(
        candidate_access=candidate_access,
        company=candidate_access.company,
        student=candidate_access.student,
        requested_by=request.user,
        purpose=payload["purpose"],
        role_context=payload["role_context"],
        status=Interview.Status.CONFIRMED if is_direct_schedule else Interview.Status.REQUESTED,
        scheduled_start=payload.get("start_at"),
        scheduled_end=payload.get("end_at"),
        confirmed_at=timezone.now() if is_direct_schedule else None,
    )
    interview.full_clean()
    interview.save()
    create_interview_event(
        interview,
        request.user,
        "requested",
        "Interview requested from an approved company candidate context.",
    )
    if is_direct_schedule:
        create_interview_event(
            interview,
            request.user,
            "confirmed",
            f"Interview confirmed for {payload['start_at'].isoformat()} to {payload['end_at'].isoformat()}.",
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
        .select_related("course")
        .order_by("created_at", "id")
    )
    current_learning = (
        LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.IN_PROGRESS)
        .select_related("course")
        .order_by("-updated_at", "-id")
        .first()
    )
    if current_learning is None:
        current_learning = (
            LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.NOT_STARTED)
            .select_related("course")
            .order_by("created_at", "id")
            .first()
        )
    if current_learning is None:
        current_learning = (
            LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.COMPLETED)
            .select_related("course")
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
            "topic_title": learning_record_title(current_learning),
            "progress_percent": current_learning.progress_percent,
            "status": roadmap_state_for_learning_record(current_learning),
            "cta_label": "Continue learning" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start topic",
            "cta_href": get_learning_record_resume_href(current_learning),
        }
        next_action = {
            "action_type": "complete_topic" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "start_topic",
            "title": "Complete your current topic" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start your next topic",
            "description": f"Finish {learning_record_title(current_learning)} to stay on track in your roadmap.",
            "cta_label": "Continue learning" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start topic",
            "cta_href": get_learning_record_resume_href(current_learning),
            "requirement": None,
        }
    elif completed_courses > passed_results:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": learning_record_title(current_learning),
            "progress_percent": 100,
            "status": "completed",
            "cta_label": "Review topic",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "take_exam",
            "title": "Take the validation exam",
            "description": f"You completed {learning_record_title(current_learning)}. Pass the exam to unlock the next topic in the roadmap.",
            "cta_label": "Take exam",
            "cta_href": "/student/exams",
            "requirement": "90% required to unlock the next topic",
        }
    else:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": learning_record_title(current_learning),
            "progress_percent": 100,
            "status": "completed",
            "cta_label": "Continue roadmap",
            "cta_href": get_learning_record_resume_href(current_learning),
        }
        next_action = {
            "action_type": "continue_roadmap",
            "title": "Move to the next roadmap topic",
            "description": "Your latest topic has been validated. Keep building momentum with the next learning step.",
            "cta_label": "Continue learning",
            "cta_href": get_learning_record_resume_href(current_learning),
            "requirement": None,
        }

    return success_response(
        {
            "student_id": request.user.id,
            "student_name": request.user.full_name,
            "header_message": "Continue your roadmap and unlock your next skill.",
            "continue_learning": continue_learning,
            "current_lesson": serialize_current_learning_lesson(current_learning),
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

    from api.matching_views import queue_company_match_refreshes

    queue_company_match_refreshes(company)
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
    applications = Application.objects.filter(company=company)
    active_jobs = list(
        Vacancy.objects.filter(company=company, status=Vacancy.Status.ACTIVE)
        .select_related("company", "created_by")
        .annotate(applications_count=Count("applications"))
        .order_by("-updated_at", "-id")
    )
    recent_job_postings = list(
        Vacancy.objects.filter(company=company)
        .select_related("company", "created_by")
        .annotate(applications_count=Count("applications"))
        .order_by("-created_at", "-id")
    )
    shortlist_count = CandidateShortlist.objects.filter(company=company).count()
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
            "recent_job_postings": [serialize_company_dashboard_job(vacancy) for vacancy in recent_job_postings[:5]],
            "interviews": {
                "active_count": len(active_interviews),
                "completed_count": len(completed_interviews),
                "items": [serialize_company_dashboard_interview(interview) for interview in interviews[:3]],
            },
            "application_status": {
                "submitted": applications.filter(status=Application.Status.SUBMITTED).count(),
                "under_review": applications.filter(status=Application.Status.UNDER_REVIEW).count(),
                "shortlisted": applications.filter(status=Application.Status.SHORTLISTED).count(),
                "rejected": applications.filter(status=Application.Status.REJECTED).count(),
                "withdrawn": applications.filter(status=Application.Status.WITHDRAWN).count(),
            },
            "analytics": {
                "candidates_to_review": len(candidates),
                "shortlisted_candidates": shortlist_count,
                "active_jobs": len(active_jobs),
                "hires": len(completed_interviews),
            },
        }
    )


def teacher_courses_queryset(user: User):
    return Course.objects.filter(created_by=user, company__isnull=True)


def teacher_related_learning_records_queryset(user: User):
    return LearningRecord.objects.filter(course__created_by=user, course__company__isnull=True)


def teacher_related_students_queryset(user: User):
    return (
        User.objects.filter(
            role=User.Role.STUDENT,
            learning_records__course__created_by=user,
            learning_records__course__company__isnull=True,
        )
        .distinct()
        .order_by("-date_joined", "-id")
    )


def teacher_related_exams_queryset(user: User):
    related_students = teacher_related_students_queryset(user)
    return (
        Exam.objects.filter(
            Q(results__student__in=related_students)
            | Q(attempts__student__in=related_students)
            | Q(practice_attempts__student__in=related_students)
            | Q(mock_attempts__student__in=related_students)
            | Q(study_plans__student__user__in=related_students)
        )
        .prefetch_related("results")
        .distinct()
        .order_by("-updated_at", "-id")
    )


def get_teacher_profile_record(user: User) -> TeacherProfile:
    profile, _ = TeacherProfile.objects.get_or_create(user=user)
    return profile


def validate_teacher_profile_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValidationError("Invalid payload format.")

    full_name = str(payload.get("full_name", "")).strip()
    overview = str(payload.get("overview", "")).strip()
    errors = {}

    if not full_name:
        errors["full_name"] = ["This field is required."]
    elif len(full_name) > 255:
        errors["full_name"] = ["Ensure this field has no more than 255 characters."]

    if len(overview) > 5000:
        errors["overview"] = ["Ensure this field has no more than 5000 characters."]

    if errors:
        raise ValidationError(errors)

    return {
        "full_name": full_name,
        "overview": overview,
    }


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_dashboard_view(request):
    related_students = teacher_related_students_queryset(request.user)
    total_courses = teacher_courses_queryset(request.user).count()
    total_exams = teacher_related_exams_queryset(request.user).count()
    total_lessons = Lesson.objects.filter(course__created_by=request.user, course__company__isnull=True).count()
    active_learning_records = teacher_related_learning_records_queryset(request.user).filter(
        status=LearningRecord.Status.IN_PROGRESS
    ).count()

    return success_response(
        {
            "teacher_name": request.user.full_name,
            "header_message": "Review the courses, learners, and assessment activity connected to your teaching workspace.",
            "summary_cards": [
                {
                    "id": "related-students",
                    "label": "Related students",
                    "value": related_students.filter(is_active=True).count(),
                    "description": "Learners currently linked to at least one of your courses.",
                },
                {
                    "id": "courses",
                    "label": "Courses",
                    "value": total_courses,
                    "description": "Courses you created in the teacher workspace.",
                },
                {
                    "id": "exams",
                    "label": "Exams",
                    "value": total_exams,
                    "description": "Exam records connected to your related learners.",
                },
                {
                    "id": "lessons",
                    "label": "Lessons",
                    "value": total_lessons,
                    "description": "Lesson entries currently drafted or published in your courses.",
                },
            ],
            "focus_items": [
                {
                    "id": "learning-coverage",
                    "title": "Monitor learning coverage",
                    "description": f"{active_learning_records} learning records are currently in progress inside your course set.",
                },
                {
                    "id": "student-support",
                    "title": "Support learner momentum",
                    "description": "Keep an eye on learners attached to your courses so you can spot stalled progress early.",
                },
                {
                    "id": "assessment-readiness",
                    "title": "Keep assessments aligned",
                    "description": "Use related exam activity to see where your teaching tracks may need more preparation support.",
                },
            ],
        }
    )


def serialize_teacher_student(student: User) -> dict:
    try:
        profile = student.student_profile
    except StudentProfile.DoesNotExist:
        profile = None

    return {
        "student_id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "desired_job_type": profile.desired_job_type if profile is not None else "",
        "desired_work_location": profile.desired_work_location if profile is not None else "",
        "japanese_level": profile.japanese_level if profile is not None else "",
        "english_level": profile.english_level if profile is not None else "",
        "profile_complete": profile.profile_complete if profile is not None else False,
        "skill_count": getattr(student, "skill_count", 0),
        "resume_count": getattr(student, "resume_count", 0),
        "experience_count": getattr(student, "experience_count", 0),
        "education_count": getattr(student, "education_count", 0),
        "date_joined": student.date_joined.isoformat(),
    }


def serialize_teacher_progress_record(
    learning_record: LearningRecord,
    *,
    assessment_cache: dict[int, tuple[dict[int, CourseAssessment], CourseAssessment | None]],
) -> dict:
    course = learning_record.course
    if course is None:
        raise ValidationError({"course": ["Teacher progress records require an attached course."]})

    course_lessons = [
        lesson
        for lesson in course.lessons.all()
        if lesson.status != Lesson.Status.INACTIVE
    ]
    lesson_progress_entries = [
        progress
        for progress in learning_record.lesson_progress.all()
        if progress.lesson.status != Lesson.Status.INACTIVE
    ]
    completed_lesson_ids = {
        progress.lesson_id
        for progress in lesson_progress_entries
        if progress.status == LessonProgress.Status.COMPLETED
    }
    in_progress_entry = next(
        (
            progress
            for progress in lesson_progress_entries
            if progress.status == LessonProgress.Status.IN_PROGRESS
        ),
        None,
    )
    next_lesson = next(
        (lesson for lesson in course_lessons if lesson.id not in completed_lesson_ids),
        None,
    )
    current_lesson = in_progress_entry.lesson if in_progress_entry is not None else next_lesson

    if course.id not in assessment_cache:
        assessment_cache[course.id] = build_course_assessment_map(course)
    lesson_assessments_by_lesson_id, final_assessment = assessment_cache[course.id]

    passed_lesson_assessment_count = 0
    for lesson in course_lessons:
        assessment = lesson_assessments_by_lesson_id.get(lesson.id)
        if assessment is None:
            continue
        latest_attempt = latest_course_assessment_attempt(learning_record.student, assessment)
        if latest_attempt is not None and latest_attempt.passed:
            passed_lesson_assessment_count += 1

    final_attempt = None
    if final_assessment is not None:
        final_attempt = latest_course_assessment_attempt(learning_record.student, final_assessment)

    total_lessons = len(course_lessons)
    completed_lessons = len(completed_lesson_ids)
    in_progress_lessons = sum(
        1
        for progress in lesson_progress_entries
        if progress.status == LessonProgress.Status.IN_PROGRESS
    )

    return {
        "learning_record_id": learning_record.id,
        "student_id": learning_record.student_id,
        "student_name": learning_record.student.full_name,
        "student_email": learning_record.student.email,
        "course_id": course.id,
        "course_title": learning_record.course_title,
        "course_category": learning_record.category,
        "course_status": course.status,
        "learning_status": learning_record.status,
        "progress_percent": learning_record.progress_percent,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "in_progress_lessons": in_progress_lessons,
        "lesson_exam_passed_count": passed_lesson_assessment_count,
        "current_lesson_title": current_lesson.title if current_lesson is not None else None,
        "last_activity_at": learning_record.updated_at.isoformat(),
        "final_exam": (
            {
                "assessment_id": final_assessment.id,
                "title": final_assessment.title,
                "latest_score": final_attempt.score_percent if final_attempt is not None else None,
                "passed": final_attempt.passed if final_attempt is not None else False,
                "attempt_count": CourseAssessmentAttempt.objects.filter(
                    student=learning_record.student,
                    assessment=final_assessment,
                ).count(),
            }
            if final_assessment is not None
            else None
        ),
    }


def serialize_teacher_profile(user: User) -> dict:
    profile = get_teacher_profile_record(user)
    active_students = teacher_related_students_queryset(user).filter(is_active=True).count()
    total_courses = teacher_courses_queryset(user).count()
    total_exams = teacher_related_exams_queryset(user).count()
    total_lessons = Lesson.objects.filter(course__created_by=user, course__company__isnull=True).count()
    active_learning_records = teacher_related_learning_records_queryset(user).filter(
        status=LearningRecord.Status.IN_PROGRESS
    ).count()
    default_overview = "Keep learner progress, your course coverage, and related assessment activity visible from one workspace."

    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role_label": "Teacher",
        "joined_at": user.date_joined.isoformat(),
        "overview": profile.overview or default_overview,
        "profile_image": file_url_or_none(profile.profile_image_file) or text_value_or_none(profile.profile_image),
        "cover_image": file_url_or_none(profile.cover_image_file) or text_value_or_none(profile.cover_image),
        "stats": {
            "related_students": active_students,
            "courses": total_courses,
            "exams": total_exams,
            "lessons": total_lessons,
            "active_learning_records": active_learning_records,
        },
        "workspace_focus": [
            {
                "label": "Learner coverage",
                "value": f"{active_learning_records} active learning records",
            },
            {
                "label": "Course footprint",
                "value": f"{total_courses} teacher-owned courses",
            },
            {
                "label": "Assessment readiness",
                "value": f"{total_exams} related exams with learner activity",
            },
        ],
        "workspace_access": [
            "Your courses and lessons",
            "Related exam activity",
            "Linked student readiness",
            "Protected teaching workspace access",
        ],
    }


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_profile_view(request):
    if request.method == "PUT":
        payload = validate_teacher_profile_payload(parse_json_body(request))
        profile = get_teacher_profile_record(request.user)
        request.user.full_name = payload["full_name"]
        request.user.full_clean()
        request.user.save(update_fields=["full_name", "updated_at"])
        profile.overview = payload["overview"]
        profile.full_clean()
        profile.save(update_fields=["overview", "updated_at"])

    return success_response(serialize_teacher_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_courses_view(request):
    if request.method == "GET":
        queryset = (
            Course.objects.select_related("company", "created_by")
            .prefetch_related("lessons", "learning_records")
            .filter(created_by=request.user, company__isnull=True)
            .order_by("-updated_at", "-id")
        )
        courses = list(queryset)

        return success_response(
            {
                "courses": [serialize_admin_course(course, viewer=request.user) for course in courses],
                "summary": {
                    "total": len(courses),
                    "active": sum(1 for course in courses if course.status == Course.Status.ACTIVE),
                    "draft": sum(1 for course in courses if course.status == Course.Status.DRAFT),
                    "inactive": sum(1 for course in courses if course.status == Course.Status.INACTIVE),
                },
            }
        )

    payload = validate_admin_course_payload(parse_json_body(request))
    course = Course(
        title=payload["title"],
        description=payload["description"],
        category=payload["category"],
        difficulty_level=payload["difficulty_level"],
        estimated_hours=payload["estimated_hours"],
        thumbnail_image=payload["thumbnail_image"],
        thumbnail_alt_text=payload["thumbnail_alt_text"],
        preview_title=payload["preview_title"],
        preview_short_description=payload["preview_short_description"],
        preview_video_url=payload["preview_video_url"],
        preview_thumbnail_image=payload["preview_thumbnail_image"],
        preview_duration_minutes=payload["preview_duration"],
        preview_access_type=payload["preview_access_type"],
        preview_order=payload["preview_order"],
        preview_status=payload["preview_status"],
        status=payload["status"],
        created_by=request.user,
    )
    sync_course_media_fields(course, payload)
    course.full_clean()
    course.save()
    course = get_admin_course(course.id)
    return success_response(serialize_admin_course(course, viewer=request.user), status=201)


@api_endpoint(["GET", "PUT", "DELETE"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_detail_view(request, course_id: int):
    course = get_admin_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if not teacher_can_edit_course(request.user, course):
        return error_response(
            request,
            "FORBIDDEN",
            "You can only edit courses you created.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    if request.method == "GET":
        return success_response(serialize_admin_course(course, viewer=request.user))

    if request.method == "DELETE":
        course.status = Course.Status.INACTIVE
        course.full_clean()
        course.save(update_fields=["status", "updated_at"])
        course = get_admin_course(course.id)
        return success_response(serialize_admin_course(course, viewer=request.user))

    payload = validate_admin_course_payload(parse_json_body(request))
    course.title = payload["title"]
    course.description = payload["description"]
    course.category = payload["category"]
    course.difficulty_level = payload["difficulty_level"]
    course.estimated_hours = payload["estimated_hours"]
    course.thumbnail_image = payload["thumbnail_image"]
    course.thumbnail_alt_text = payload["thumbnail_alt_text"]
    course.preview_title = payload["preview_title"]
    course.preview_short_description = payload["preview_short_description"]
    course.preview_video_url = payload["preview_video_url"]
    course.preview_thumbnail_image = payload["preview_thumbnail_image"]
    course.preview_duration_minutes = payload["preview_duration"]
    course.preview_access_type = payload["preview_access_type"]
    course.preview_order = payload["preview_order"]
    course.preview_status = payload["preview_status"]
    course.status = payload["status"]
    sync_course_media_fields(course, payload)
    course.full_clean()
    course.save(
        update_fields=[
            "title",
            "description",
            "category",
            "difficulty_level",
            "estimated_hours",
            "thumbnail_image",
            "thumbnail_image_file",
            "thumbnail_alt_text",
            "preview_title",
            "preview_short_description",
            "preview_video_url",
            "preview_thumbnail_image",
            "preview_thumbnail_image_file",
            "preview_duration_minutes",
            "preview_access_type",
            "preview_order",
            "preview_status",
            "status",
            "updated_at",
        ]
    )
    course = get_admin_course(course.id)
    return success_response(serialize_admin_course(course, viewer=request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_course_lessons_view(request, course_id: int):
    course = get_admin_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if not teacher_can_edit_course(request.user, course):
        return error_response(
            request,
            "FORBIDDEN",
            "You can only manage lessons for courses you created.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    if request.method == "GET":
        lessons = list(
            Lesson.objects.filter(course=course)
            .select_related("course")
            .order_by("sequence_number", "id")
        )
        return success_response(
            {
                "course": serialize_admin_course(course, viewer=request.user),
                "lessons": [serialize_admin_lesson(lesson) for lesson in lessons],
            }
        )

    payload = validate_admin_lesson_payload(parse_json_body(request))
    lesson = Lesson(
        course=course,
        title=payload["title"],
        summary=payload["summary"],
        content=payload["content"],
        transcript=payload["transcript"],
        video_url=payload["video_url"],
        sequence_number=payload["sequence_number"],
        status=payload["status"],
    )
    lesson.full_clean()
    lesson.save()
    publish_course_if_has_active_lessons(course)
    lesson = get_admin_lesson(lesson.id)
    return success_response(serialize_admin_lesson(lesson), status=201)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_youtube_transcript_view(request):
    from services.youtube_transcript import YouTubeTranscriptService, YouTubeTranscriptServiceError

    payload = parse_json_body(request)
    video_url = str(payload.get("video_url", "")).strip()
    errors = {}

    if not video_url:
        errors["video_url"] = ["This field is required."]
    else:
        video_url_error = youtube_video_url_error(video_url)
        if video_url_error:
            errors["video_url"] = [video_url_error]

    if errors:
        raise ValidationError(errors)

    try:
        transcript_text = YouTubeTranscriptService().fetch_transcript_text(video_url)
    except YouTubeTranscriptServiceError as exc:
        return error_response(
            request,
            "TRANSCRIPT_UNAVAILABLE",
            str(exc),
            details={"video_url": [video_url]},
            status=422,
        )

    return success_response({"transcript": transcript_text})


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_lesson_detail_view(request, lesson_id: int):
    lesson = get_admin_lesson(lesson_id)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson was not found.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    if not teacher_can_edit_course(request.user, lesson.course):
        return error_response(
            request,
            "FORBIDDEN",
            "You can only manage lessons for courses you created.",
            details={"lesson_id": [str(lesson_id)]},
            status=403,
        )

    if request.method == "DELETE":
        lesson.status = Lesson.Status.INACTIVE
        lesson.full_clean()
        lesson.save(update_fields=["status", "updated_at"])
        lesson = get_admin_lesson(lesson.id)
        return success_response(serialize_admin_lesson(lesson))

    payload = validate_admin_lesson_payload(parse_json_body(request))
    lesson.title = payload["title"]
    lesson.summary = payload["summary"]
    lesson.content = payload["content"]
    lesson.transcript = payload["transcript"]
    lesson.video_url = payload["video_url"]
    lesson.sequence_number = payload["sequence_number"]
    lesson.status = payload["status"]
    lesson.full_clean()
    lesson.save(
        update_fields=[
            "title",
            "summary",
            "content",
            "transcript",
            "video_url",
            "sequence_number",
            "status",
            "updated_at",
        ]
    )
    publish_course_if_has_active_lessons(lesson.course)
    lesson = get_admin_lesson(lesson.id)
    return success_response(serialize_admin_lesson(lesson))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_exams_view(request):
    related_student_ids = list(teacher_related_students_queryset(request.user).values_list("id", flat=True))
    exams = list(teacher_related_exams_queryset(request.user))

    return success_response(
        {
            "exams": [
                {
                    **serialize_admin_exam(exam),
                    "result_count": exam.results.filter(student_id__in=related_student_ids).count(),
                }
                for exam in exams
            ],
            "summary": {
                "total": len(exams),
                "active": sum(1 for exam in exams if exam.status == Exam.Status.ACTIVE),
                "draft": sum(1 for exam in exams if exam.status == Exam.Status.DRAFT),
                "inactive": sum(1 for exam in exams if exam.status == Exam.Status.INACTIVE),
            },
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_students_view(request):
    students = list(
        teacher_related_students_queryset(request.user)
        .select_related("student_profile")
        .annotate(
            skill_count=Count("student_skills", distinct=True),
            resume_count=Count("resume_records", distinct=True),
            experience_count=Count("experience_records", distinct=True),
            education_count=Count("education_records", distinct=True),
        )
        .order_by("-date_joined", "-id")
    )

    serialized_students = [serialize_teacher_student(student) for student in students]

    return success_response(
        {
            "students": serialized_students,
            "summary": {
                "total": len(serialized_students),
                "profile_complete": sum(1 for student in serialized_students if student["profile_complete"]),
                "with_resumes": sum(1 for student in serialized_students if student["resume_count"] > 0),
                "with_experience": sum(1 for student in serialized_students if student["experience_count"] > 0),
            },
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.TEACHER])
def teacher_progress_view(request):
    learning_records = list(
        teacher_related_learning_records_queryset(request.user)
        .select_related("student", "course")
        .prefetch_related("course__lessons", "lesson_progress__lesson")
        .order_by("-updated_at", "-id")
    )
    assessment_cache: dict[int, tuple[dict[int, CourseAssessment], CourseAssessment | None]] = {}
    serialized_records = [
        serialize_teacher_progress_record(learning_record, assessment_cache=assessment_cache)
        for learning_record in learning_records
    ]
    related_student_ids = {record["student_id"] for record in serialized_records}
    average_progress_percent = (
        round(sum(record["progress_percent"] for record in serialized_records) / len(serialized_records))
        if serialized_records
        else 0
    )

    return success_response(
        {
            "records": serialized_records,
            "summary": {
                "students": len(related_student_ids),
                "learning_records": len(serialized_records),
                "in_progress": sum(
                    1 for record in serialized_records if record["learning_status"] == LearningRecord.Status.IN_PROGRESS
                ),
                "completed": sum(
                    1 for record in serialized_records if record["learning_status"] == LearningRecord.Status.COMPLETED
                ),
                "average_progress_percent": average_progress_percent,
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
    notifications = list(
        Notification.objects.filter(recipient=request.user)
        .select_related("actor")
        .order_by("-created_at", "-id")[:5]
    )
    total_interviews = Interview.objects.count()
    students = User.objects.filter(role=User.Role.STUDENT).count()
    company_users = User.objects.filter(role=User.Role.COMPANY).count()
    admins = User.objects.filter(role=User.Role.ADMIN).count()
    companies = Company.objects.count()
    active_vacancies = Vacancy.objects.filter(status=Vacancy.Status.ACTIVE).count()
    active_interviews = Interview.objects.filter(
        status__in=[Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED]
    ).count()
    completed_interviews = Interview.objects.filter(status=Interview.Status.COMPLETED).count()
    cancelled_interviews = Interview.objects.filter(status=Interview.Status.CANCELLED).count()
    unread_notifications = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()

    activity_items = [
        *[
            serialize_admin_activity_item(
                f"user-{user.id}",
                "user",
                f"{user.full_name} joined the platform",
                f"{user.role.title()} account created{f' for {user.company.name}' if user.company else ''}.",
                user.date_joined,
            )
            for user in users[:3]
        ],
        *[
            serialize_admin_activity_item(
                f"interview-{interview.id}",
                "interview",
                f"Interview {interview.status.replace('_', ' ')}",
                f"{interview.company.name} and {interview.student.full_name} updated the {interview.purpose.lower()} flow.",
                interview.updated_at,
            )
            for interview in interviews[:3]
        ],
        *[
            serialize_admin_activity_item(
                f"notification-{notification.id}",
                "notification",
                notification.title,
                notification.message,
                notification.created_at,
            )
            for notification in notifications[:3]
        ],
    ]
    activity_items.sort(key=lambda item: item["timestamp"], reverse=True)

    return success_response(
        {
            "header_message": "Monitor platform activity, review recent events, and keep core system operations visible from one control surface.",
            "system_stats": {
                "total_users": User.objects.count(),
                "active_students": students,
                "companies": companies,
                "revenue_label": "Unavailable",
                "revenue_description": "Billing and premium purchase tracking are not connected yet.",
            },
            "recent_activity": activity_items[:5],
            "system_status": [
                {
                    "id": "unread-updates",
                    "label": "Unread platform updates",
                    "value": str(unread_notifications),
                    "tone": "warning" if unread_notifications else "healthy",
                    "description": "Admin notifications waiting for review.",
                },
                {
                    "id": "live-vacancies",
                    "label": "Live vacancies",
                    "value": str(active_vacancies),
                    "tone": "healthy" if active_vacancies else "neutral",
                    "description": "Currently active company job postings.",
                },
                {
                    "id": "active-interviews",
                    "label": "Active interviews",
                    "value": str(active_interviews),
                    "tone": "healthy" if active_interviews else "neutral",
                    "description": "Interview workflows still in progress.",
                },
                {
                    "id": "completed-interviews",
                    "label": "Completed interviews",
                    "value": str(completed_interviews),
                    "tone": "healthy",
                    "description": f"{cancelled_interviews} cancelled across the current dataset.",
                },
                {
                    "id": "platform-admins",
                    "label": "Admin coverage",
                    "value": str(admins),
                    "tone": "healthy" if admins else "warning",
                    "description": f"{company_users} company users are currently managed on the platform.",
                },
                {
                    "id": "interview-volume",
                    "label": "Interview volume",
                    "value": str(total_interviews),
                    "tone": "neutral",
                    "description": "Total interviews recorded across all companies.",
                },
            ],
        }
    )


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_vacancies_view(request):
    if request.method == "GET":
        vacancies = list(
            Vacancy.objects.select_related("company", "created_by")
            .prefetch_related("skill_requirements__skill", "language_requirements")
            .order_by("-updated_at", "-id")
        )
        companies = list(get_admin_company_queryset().order_by("name"))
        company_users = list(
            User.objects.filter(role=User.Role.COMPANY, company__isnull=False)
            .select_related("company")
            .order_by("company__name", "full_name", "email")
        )
        return success_response(
            {
                "vacancies": [serialize_vacancy(vacancy) for vacancy in vacancies],
                "companies": [serialize_admin_company(company) for company in companies],
                "company_users": [serialize_admin_company_user(user) for user in company_users],
                "available_skills": [serialize_skill(skill) for skill in Skill.objects.order_by("name")],
            }
        )

    payload = validate_admin_vacancy_payload(parse_json_body(request))
    with transaction.atomic():
        vacancy = Vacancy(
            company=payload["company"],
            created_by=payload["created_by"],
            title=payload["title"],
            description=payload["description"],
            employment_type=payload["employment_type"],
            experience_level=payload["experience_level"],
            location=payload["location"],
            work_style=payload["work_style"],
            relocation_support=payload["relocation_support"],
            status=payload["status"],
        )
        vacancy.full_clean()
        vacancy.save()
        sync_vacancy_skill_requirements(
            vacancy,
            required_skills=payload["required_skills"],
            preferred_skills=payload["preferred_skills"],
        )
        sync_vacancy_language_requirements(
            vacancy,
            language_requirements=payload["language_requirements"],
        )
    return success_response(serialize_vacancy(vacancy), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_vacancy_detail_view(request, vacancy_id: int):
    vacancy = get_admin_vacancy(vacancy_id)
    if vacancy is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested vacancy was not found.",
            details={"vacancy_id": [str(vacancy_id)]},
            status=404,
        )

    if request.method == "DELETE":
        vacancy.status = Vacancy.Status.INACTIVE
        vacancy.full_clean()
        vacancy.save(update_fields=["status", "updated_at"])
        return success_response(serialize_vacancy(vacancy))

    payload = validate_admin_vacancy_payload(parse_json_body(request))
    vacancy.company = payload["company"]
    vacancy.created_by = payload["created_by"]
    vacancy.title = payload["title"]
    vacancy.description = payload["description"]
    vacancy.employment_type = payload["employment_type"]
    vacancy.experience_level = payload["experience_level"]
    vacancy.location = payload["location"]
    vacancy.work_style = payload["work_style"]
    vacancy.relocation_support = payload["relocation_support"]
    vacancy.status = payload["status"]
    with transaction.atomic():
        vacancy.full_clean()
        vacancy.save(
            update_fields=[
                "company",
                "created_by",
                "title",
                "description",
                "employment_type",
                "experience_level",
                "location",
                "work_style",
                "relocation_support",
                "status",
                "updated_at",
            ]
        )
        sync_vacancy_skill_requirements(
            vacancy,
            required_skills=payload["required_skills"],
            preferred_skills=payload["preferred_skills"],
        )
        sync_vacancy_language_requirements(
            vacancy,
            language_requirements=payload["language_requirements"],
        )
    return success_response(serialize_vacancy(vacancy))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_users_view(request):
    if request.method == "GET":
        users = list(User.objects.select_related("company").order_by("email"))
        companies = list(get_admin_company_queryset().order_by("name"))
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
        companies = list(get_admin_company_queryset().order_by("name"))
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


@api_endpoint(["GET", "PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_company_detail_view(request, company_id: int):
    company = get_admin_company_queryset().filter(pk=company_id).first()
    if company is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested company was not found.",
            details={"company_id": [str(company_id)]},
            status=404,
        )

    if request.method == "GET":
        return success_response(serialize_admin_company(company))

    if request.method == "DELETE":
        company.is_active = False
        company.full_clean()
        company.save(update_fields=["is_active", "updated_at"])
        return success_response(serialize_admin_company(company))

    payload = validate_admin_company_payload(parse_json_body(request))
    company.name = payload["name"]
    company.description = payload["description"]
    company.is_active = payload["is_active"]
    company.full_clean()
    company.save(update_fields=["name", "description", "is_active", "updated_at"])
    return success_response(serialize_admin_company(company))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_courses_view(request):
    if request.method == "GET":
        courses = list(Course.objects.order_by("-updated_at", "-id"))
        return success_response({"courses": [serialize_admin_course(course) for course in courses]})

    payload = validate_admin_course_payload(parse_json_body(request), require_preview=False)
    course = Course(
        title=payload["title"],
        description=payload["description"],
        category=payload["category"],
        difficulty_level=payload["difficulty_level"],
        estimated_hours=payload["estimated_hours"],
        thumbnail_image=payload["thumbnail_image"],
        thumbnail_alt_text=payload["thumbnail_alt_text"],
        preview_title=payload["preview_title"],
        preview_short_description=payload["preview_short_description"],
        preview_video_url=payload["preview_video_url"],
        preview_thumbnail_image=payload["preview_thumbnail_image"],
        preview_duration_minutes=payload["preview_duration"],
        preview_access_type=payload["preview_access_type"],
        preview_order=payload["preview_order"],
        preview_status=payload["preview_status"],
        status=payload["status"],
    )
    sync_course_media_fields(course, payload)
    course.full_clean()
    course.save()
    return success_response(serialize_admin_course(course), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_course_detail_view(request, course_id: int):
    course = get_admin_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if request.method == "DELETE":
        course.status = Course.Status.INACTIVE
        course.full_clean()
        course.save(update_fields=["status", "updated_at"])
        return success_response(serialize_admin_course(course))

    payload = validate_admin_course_payload(parse_json_body(request), require_preview=False)
    course.title = payload["title"]
    course.description = payload["description"]
    course.category = payload["category"]
    course.difficulty_level = payload["difficulty_level"]
    course.estimated_hours = payload["estimated_hours"]
    course.thumbnail_image = payload["thumbnail_image"]
    course.thumbnail_alt_text = payload["thumbnail_alt_text"]
    course.preview_title = payload["preview_title"]
    course.preview_short_description = payload["preview_short_description"]
    course.preview_video_url = payload["preview_video_url"]
    course.preview_thumbnail_image = payload["preview_thumbnail_image"]
    course.preview_duration_minutes = payload["preview_duration"]
    course.preview_access_type = payload["preview_access_type"]
    course.preview_order = payload["preview_order"]
    course.preview_status = payload["preview_status"]
    course.status = payload["status"]
    sync_course_media_fields(course, payload)
    course.full_clean()
    course.save(
        update_fields=[
            "title",
            "description",
            "category",
            "difficulty_level",
            "estimated_hours",
            "thumbnail_image",
            "thumbnail_image_file",
            "thumbnail_alt_text",
            "preview_title",
            "preview_short_description",
            "preview_video_url",
            "preview_thumbnail_image",
            "preview_thumbnail_image_file",
            "preview_duration_minutes",
            "preview_access_type",
            "preview_order",
            "preview_status",
            "status",
            "updated_at",
        ]
    )
    return success_response(serialize_admin_course(course))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_course_lessons_view(request, course_id: int):
    course = get_admin_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if request.method == "GET":
        lessons = list(
            Lesson.objects.filter(course=course)
            .select_related("course")
            .order_by("sequence_number", "id")
        )
        return success_response(
            {
                "course": serialize_admin_course(course),
                "lessons": [serialize_admin_lesson(lesson) for lesson in lessons],
            }
        )

    payload = validate_admin_lesson_payload(parse_json_body(request))
    lesson = Lesson(
        course=course,
        title=payload["title"],
        summary=payload["summary"],
        content=payload["content"],
        transcript=payload["transcript"],
        video_url=payload["video_url"],
        sequence_number=payload["sequence_number"],
        status=payload["status"],
    )
    lesson.full_clean()
    lesson.save()
    lesson = get_admin_lesson(lesson.id)
    return success_response(serialize_admin_lesson(lesson), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_lesson_detail_view(request, lesson_id: int):
    lesson = get_admin_lesson(lesson_id)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson was not found.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    if request.method == "DELETE":
        lesson.status = Lesson.Status.INACTIVE
        lesson.full_clean()
        lesson.save(update_fields=["status", "updated_at"])
        lesson = get_admin_lesson(lesson.id)
        return success_response(serialize_admin_lesson(lesson))

    payload = validate_admin_lesson_payload(parse_json_body(request))
    lesson.title = payload["title"]
    lesson.summary = payload["summary"]
    lesson.content = payload["content"]
    lesson.transcript = payload["transcript"]
    lesson.video_url = payload["video_url"]
    lesson.sequence_number = payload["sequence_number"]
    lesson.status = payload["status"]
    lesson.full_clean()
    lesson.save(
        update_fields=[
            "title",
            "summary",
            "content",
            "transcript",
            "video_url",
            "sequence_number",
            "status",
            "updated_at",
        ]
    )
    lesson = get_admin_lesson(lesson.id)
    return success_response(serialize_admin_lesson(lesson))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_exams_view(request):
    if request.method == "GET":
        exams = list(Exam.objects.order_by("-updated_at", "-id"))
        return success_response({"exams": [serialize_admin_exam(exam) for exam in exams]})

    payload = validate_admin_exam_payload(parse_json_body(request))
    exam = Exam(
        title=payload["title"],
        description=payload["description"],
        category=payload["category"],
        duration_minutes=payload["duration_minutes"],
        passing_score_percent=payload["passing_score_percent"],
        question_count=payload["question_count"],
        max_attempts=payload["max_attempts"],
        status=payload["status"],
    )
    exam.full_clean()
    exam.save()
    return success_response(serialize_admin_exam(exam), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_exam_detail_view(request, exam_id: int):
    exam = get_admin_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested exam was not found.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    if request.method == "DELETE":
        exam.status = Exam.Status.INACTIVE
        exam.full_clean()
        exam.save(update_fields=["status", "updated_at"])
        return success_response(serialize_admin_exam(exam))

    payload = validate_admin_exam_payload(parse_json_body(request))
    exam.title = payload["title"]
    exam.description = payload["description"]
    exam.category = payload["category"]
    exam.duration_minutes = payload["duration_minutes"]
    exam.passing_score_percent = payload["passing_score_percent"]
    exam.question_count = payload["question_count"]
    exam.max_attempts = payload["max_attempts"]
    exam.status = payload["status"]
    exam.full_clean()
    exam.save(
        update_fields=[
            "title",
            "description",
            "category",
            "duration_minutes",
            "passing_score_percent",
            "question_count",
            "max_attempts",
            "status",
            "updated_at",
        ]
    )
    return success_response(serialize_admin_exam(exam))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_exam_questions_view(request, exam_id: int):
    exam = get_admin_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested exam was not found.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    if request.method == "GET":
        exam = sync_exam_question_count(exam)
        questions = list(
            ExamQuestion.objects.filter(exam=exam)
            .prefetch_related("answer_options")
            .order_by("sequence_number", "id")
        )
        return success_response(
            {
                "exam": serialize_admin_exam(exam),
                "questions": [serialize_admin_exam_question(question) for question in questions],
            }
        )

    payload = validate_admin_exam_question_payload(parse_json_body(request))
    question = ExamQuestion(
        exam=exam,
        prompt=payload["prompt"],
        instructions=payload["instructions"],
        question_type=payload["question_type"],
        sequence_number=payload["sequence_number"],
        points=payload["points"],
        status=payload["status"],
    )
    question.full_clean()
    question.save()
    sync_exam_question_count(exam)
    question = get_admin_exam_question(question.id)
    return success_response(serialize_admin_exam_question(question), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_exam_question_detail_view(request, question_id: int):
    question = get_admin_exam_question(question_id)
    if question is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested question was not found.",
            details={"question_id": [str(question_id)]},
            status=404,
        )

    if request.method == "DELETE":
        question.status = ExamQuestion.Status.INACTIVE
        question.full_clean()
        question.save(update_fields=["status", "updated_at"])
        sync_exam_question_count(question.exam)
        question = get_admin_exam_question(question.id)
        return success_response(serialize_admin_exam_question(question))

    payload = validate_admin_exam_question_payload(parse_json_body(request))
    question.prompt = payload["prompt"]
    question.instructions = payload["instructions"]
    question.question_type = payload["question_type"]
    question.sequence_number = payload["sequence_number"]
    question.points = payload["points"]
    question.status = payload["status"]
    question.full_clean()
    question.save(
        update_fields=[
            "prompt",
            "instructions",
            "question_type",
            "sequence_number",
            "points",
            "status",
            "updated_at",
        ]
    )
    sync_exam_question_count(question.exam)
    question = get_admin_exam_question(question.id)
    return success_response(serialize_admin_exam_question(question))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_exam_answer_options_view(request, question_id: int):
    question = get_admin_exam_question(question_id)
    if question is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested question was not found.",
            details={"question_id": [str(question_id)]},
            status=404,
        )

    if request.method == "GET":
        options = list(
            ExamAnswerOption.objects.filter(question=question)
            .order_by("sequence_number", "id")
        )
        return success_response(
            {
                "question": serialize_admin_exam_question(question),
                "options": [serialize_admin_exam_answer_option(option) for option in options],
            }
        )

    payload = validate_admin_exam_answer_option_payload(parse_json_body(request))
    option = ExamAnswerOption(
        question=question,
        option_text=payload["option_text"],
        sequence_number=payload["sequence_number"],
        is_correct=payload["is_correct"],
        status=payload["status"],
    )
    option.full_clean()
    option.save()
    option = get_admin_exam_answer_option(option.id)
    return success_response(serialize_admin_exam_answer_option(option), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_exam_answer_option_detail_view(request, option_id: int):
    option = get_admin_exam_answer_option(option_id)
    if option is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested answer option was not found.",
            details={"option_id": [str(option_id)]},
            status=404,
        )

    if request.method == "DELETE":
        option.status = ExamAnswerOption.Status.INACTIVE
        option.full_clean()
        option.save(update_fields=["status", "updated_at"])
        option = get_admin_exam_answer_option(option.id)
        return success_response(serialize_admin_exam_answer_option(option))

    payload = validate_admin_exam_answer_option_payload(parse_json_body(request))
    option.option_text = payload["option_text"]
    option.sequence_number = payload["sequence_number"]
    option.is_correct = payload["is_correct"]
    option.status = payload["status"]
    option.full_clean()
    option.save(
        update_fields=[
            "option_text",
            "sequence_number",
            "is_correct",
            "status",
            "updated_at",
        ]
    )
    option = get_admin_exam_answer_option(option.id)
    return success_response(serialize_admin_exam_answer_option(option))


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


def serialize_workspace_summary(user: User) -> dict:
    notification_unread_count = Notification.objects.filter(recipient=user, read_at__isnull=True).count()
    summary = {
        "notification_unread_count": notification_unread_count,
        "unread_message_count": 0,
        "profile_avatar": None,
    }

    if user.role == User.Role.STUDENT:
        unread_message_count = (
            MessageThread.objects.filter(student=user, last_message_at__isnull=False)
            .exclude(last_message_sender=user)
            .filter(Q(last_read_at__isnull=True) | Q(last_read_at__lt=F("last_message_at")))
            .count()
        )
        match_count = len(ranked_matches_for_student(user))
        summary.update(
            {
                "unread_message_count": unread_message_count,
                "profile_avatar": message_profile_image_for_user(user),
                "match_count": match_count,
            }
        )
    elif user.role == User.Role.COMPANY:
        unread_message_count = (
            company_message_threads_queryset(user)
            .filter(last_message_at__isnull=False)
            .exclude(last_message_sender=user)
            .filter(Q(company_last_read_at__isnull=True) | Q(company_last_read_at__lt=F("last_message_at")))
            .count()
        )
        summary.update(
            {
                "unread_message_count": unread_message_count,
                "profile_avatar": user.company.profile_image if user.company is not None else None,
            }
        )

    return summary


@api_endpoint(["GET"], authentication_required=True)
def workspace_summary_view(request):
    return success_response(serialize_workspace_summary(request.user))


@api_endpoint(["GET"], authentication_required=True)
def notification_preferences_view(request):
    """Get user's notification preferences."""
    from users.models import NotificationPreference
    
    prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
    return success_response({
        "email_on_application": prefs.email_on_application,
        "email_on_interview": prefs.email_on_interview,
        "email_on_exam_result": prefs.email_on_exam_result,
        "email_on_study_plan": prefs.email_on_study_plan,
        "email_on_course_completion": prefs.email_on_course_completion,
        "email_on_skill_endorsed": prefs.email_on_skill_endorsed,
        "app_notifications_enabled": prefs.app_notifications_enabled,
        "daily_digest": prefs.daily_digest,
        "digest_time": prefs.digest_time.isoformat() if prefs.digest_time else None,
        "unsubscribed": prefs.unsubscribed,
    })


@api_endpoint(["PUT", "POST"], authentication_required=True)
def notification_preferences_update_view(request):
    """Update user's notification preferences."""
    from users.models import NotificationPreference
    
    payload = parse_json_body(request)
    
    prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
    
    # Update preferences
    if "email_on_application" in payload:
        prefs.email_on_application = bool(payload.get("email_on_application"))
    if "email_on_interview" in payload:
        prefs.email_on_interview = bool(payload.get("email_on_interview"))
    if "email_on_exam_result" in payload:
        prefs.email_on_exam_result = bool(payload.get("email_on_exam_result"))
    if "email_on_study_plan" in payload:
        prefs.email_on_study_plan = bool(payload.get("email_on_study_plan"))
    if "email_on_course_completion" in payload:
        prefs.email_on_course_completion = bool(payload.get("email_on_course_completion"))
    if "email_on_skill_endorsed" in payload:
        prefs.email_on_skill_endorsed = bool(payload.get("email_on_skill_endorsed"))
    if "app_notifications_enabled" in payload:
        prefs.app_notifications_enabled = bool(payload.get("app_notifications_enabled"))
    if "daily_digest" in payload:
        prefs.daily_digest = bool(payload.get("daily_digest"))
    if "digest_time" in payload and payload.get("digest_time"):
        try:
            from datetime import time
            time_str = payload.get("digest_time")
            time_obj = time.fromisoformat(time_str)
            prefs.digest_time = time_obj
        except (ValueError, TypeError):
            pass
    if "unsubscribed" in payload:
        prefs.unsubscribed = bool(payload.get("unsubscribed"))
    
    prefs.save()
    
    return success_response({
        "email_on_application": prefs.email_on_application,
        "email_on_interview": prefs.email_on_interview,
        "email_on_exam_result": prefs.email_on_exam_result,
        "email_on_study_plan": prefs.email_on_study_plan,
        "email_on_course_completion": prefs.email_on_course_completion,
        "email_on_skill_endorsed": prefs.email_on_skill_endorsed,
        "app_notifications_enabled": prefs.app_notifications_enabled,
        "daily_digest": prefs.daily_digest,
        "digest_time": prefs.digest_time.isoformat() if prefs.digest_time else None,
        "unsubscribed": prefs.unsubscribed,
    })


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


# Phase 18: Admin Features Polish

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_export_users_view(request):
    """Export users to CSV."""
    from services.bulk_operations import CSVExporter
    import csv
    
    # Get filter parameters
    role = request.GET.get('role')
    status = request.GET.get('status')
    
    users = User.objects.all()
    if role:
        users = users.filter(role=role)
    if status == 'active':
        users = users.filter(is_active=True)
    elif status == 'inactive':
        users = users.filter(is_active=False)
    
    csv_content = CSVExporter.export_users(users)
    
    response = success_response({"csv": csv_content})
    response['Content-Type'] = 'text/csv'
    response['Content-Disposition'] = f'attachment; filename="users-{timezone.now().strftime("%Y%m%d")}.csv"'
    return response


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_export_companies_view(request):
    """Export companies to CSV."""
    from services.bulk_operations import CSVExporter
    
    companies = Company.objects.all()
    csv_content = CSVExporter.export_companies(companies)
    
    response = success_response({"csv": csv_content})
    response['Content-Type'] = 'text/csv'
    response['Content-Disposition'] = f'attachment; filename="companies-{timezone.now().strftime("%Y%m%d")}.csv"'
    return response


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_export_courses_view(request):
    """Export courses to CSV."""
    from services.bulk_operations import CSVExporter
    
    courses = Course.objects.all()
    csv_content = CSVExporter.export_courses(courses)
    
    response = success_response({"csv": csv_content})
    response['Content-Type'] = 'text/csv'
    response['Content-Disposition'] = f'attachment; filename="courses-{timezone.now().strftime("%Y%m%d")}.csv"'
    return response


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_import_users_view(request):
    """Bulk import users from CSV."""
    from services.bulk_operations import CSVImporter
    
    if 'file' not in request.FILES:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "CSV file is required",
            details={"file": ["This field is required."]},
            status=400,
        )
    
    csv_file = request.FILES['file']
    try:
        result = CSVImporter.import_users(csv_file.file)
        return success_response(result)
    except Exception as e:
        return error_response(
            request,
            "IMPORT_ERROR",
            f"Error importing CSV: {str(e)}",
            status=400,
        )


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_import_courses_view(request):
    """Bulk import courses from CSV."""
    from services.bulk_operations import CSVImporter
    
    if 'file' not in request.FILES:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "CSV file is required",
            details={"file": ["This field is required."]},
            status=400,
        )
    
    csv_file = request.FILES['file']
    try:
        result = CSVImporter.import_courses(csv_file.file)
        return success_response(result)
    except Exception as e:
        return error_response(
            request,
            "IMPORT_ERROR",
            f"Error importing CSV: {str(e)}",
            status=400,
        )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_import_user_template_view(request):
    """Get CSV template for user import."""
    from services.bulk_operations import CSVImporter
    
    template = CSVImporter.get_user_import_template()
    response = success_response({"template": template})
    response['Content-Type'] = 'text/csv'
    response['Content-Disposition'] = 'attachment; filename="user-import-template.csv"'
    return response


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_import_course_template_view(request):
    """Get CSV template for course import."""
    from services.bulk_operations import CSVImporter
    
    template = CSVImporter.get_course_import_template()
    response = success_response({"template": template})
    response['Content-Type'] = 'text/csv'
    response['Content-Disposition'] = 'attachment; filename="course-import-template.csv"'
    return response


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_scheduled_tasks_view(request):
    """List all scheduled tasks."""
    from users.models import ScheduledTask
    
    tasks = ScheduledTask.objects.all().order_by('task_type')
    
    return success_response({
        "tasks": [
            {
                "id": task.id,
                "task_type": task.task_type,
                "task_label": task.get_task_type_display(),
                "schedule": task.schedule,
                "is_active": task.is_active,
                "last_run": task.last_run.isoformat() if task.last_run else None,
                "next_run": task.next_run.isoformat() if task.next_run else None,
                "last_result": task.last_result,
            }
            for task in tasks
        ]
    })


@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_scheduled_task_detail_view(request, task_id: int):
    """Update a scheduled task."""
    from users.models import ScheduledTask
    
    try:
        task = ScheduledTask.objects.get(id=task_id)
    except ScheduledTask.DoesNotExist:
        return error_response(
            request,
            "NOT_FOUND",
            "Scheduled task not found",
            status=404,
        )
    
    payload = parse_json_body(request)
    
    if 'is_active' in payload:
        task.is_active = bool(payload.get('is_active'))
    if 'schedule' in payload:
        if payload.get('schedule') in ScheduledTask.Schedule.values:
            task.schedule = payload.get('schedule')
    
    task.save()
    
    return success_response({
        "id": task.id,
        "task_type": task.task_type,
        "schedule": task.schedule,
        "is_active": task.is_active,
        "last_run": task.last_run.isoformat() if task.last_run else None,
        "next_run": task.next_run.isoformat() if task.next_run else None,
    })


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_scheduled_task_run_now_view(request, task_id: int):
    """Manually execute a scheduled task immediately."""
    from users.models import ScheduledTask
    from services.scheduled_tasks import execute_scheduled_task
    
    try:
        task = ScheduledTask.objects.get(id=task_id)
    except ScheduledTask.DoesNotExist:
        return error_response(
            request,
            "NOT_FOUND",
            "Scheduled task not found",
            status=404,
        )
    
    success = execute_scheduled_task(task.task_type)
    if success:
        task.refresh_from_db()
        return success_response({
            "message": "Task executed successfully",
            "task_id": task.id,
            "last_run": task.last_run.isoformat() if task.last_run else None,
            "last_result": task.last_result,
        })
    else:
        return error_response(
            request,
            "EXECUTION_ERROR",
            "Failed to execute scheduled task",
            status=400,
        )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_report_user_activity_view(request):
    """Generate user activity report."""
    from services.reports import ReportGenerator
    from django.utils.dateparse import parse_date
    
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    admin_user_id = request.GET.get('admin_user_id')
    action_type = request.GET.get('action_type')
    
    # Parse dates if provided
    parsed_from = None
    parsed_to = None
    if date_from:
        try:
            parsed_from = timezone.make_aware(
                datetime.combine(parse_date(date_from), datetime.min.time())
            )
        except:
            pass
    if date_to:
        try:
            parsed_to = timezone.make_aware(
                datetime.combine(parse_date(date_to), datetime.max.time())
            )
        except:
            pass
    
    report = ReportGenerator.generate_user_activity_report(
        date_from=parsed_from,
        date_to=parsed_to,
        admin_user_id=int(admin_user_id) if admin_user_id else None,
        action_type=action_type,
    )
    
    return success_response(report)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_report_data_access_view(request):
    """Generate data access report."""
    from services.reports import ReportGenerator
    from django.utils.dateparse import parse_date
    
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    student_id = request.GET.get('student_id')
    
    # Parse dates if provided
    parsed_from = None
    parsed_to = None
    if date_from:
        try:
            parsed_from = timezone.make_aware(
                datetime.combine(parse_date(date_from), datetime.min.time())
            )
        except:
            pass
    if date_to:
        try:
            parsed_to = timezone.make_aware(
                datetime.combine(parse_date(date_to), datetime.max.time())
            )
        except:
            pass
    
    report = ReportGenerator.generate_data_access_report(
        student_id=int(student_id) if student_id else None,
        date_from=parsed_from,
        date_to=parsed_to,
    )
    
    return success_response(report)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_report_content_modification_view(request):
    """Generate content modification report."""
    from services.reports import ReportGenerator
    from django.utils.dateparse import parse_date
    
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Parse dates if provided
    parsed_from = None
    parsed_to = None
    if date_from:
        try:
            parsed_from = timezone.make_aware(
                datetime.combine(parse_date(date_from), datetime.min.time())
            )
        except:
            pass
    if date_to:
        try:
            parsed_to = timezone.make_aware(
                datetime.combine(parse_date(date_to), datetime.max.time())
            )
        except:
            pass
    
    report = ReportGenerator.generate_content_modification_report(
        date_from=parsed_from,
        date_to=parsed_to,
    )
    
    return success_response(report)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_report_compliance_view(request):
    """Generate compliance report."""
    from services.reports import ReportGenerator
    
    report = ReportGenerator.generate_compliance_report()
    return success_response(report)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_access_view(request):
    return success_response({"message": "Admin access granted.", "role": request.user.role})


# Phase 19: Operations Infrastructure

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_logs_view(request):
    """Get application logs with filtering options."""
    from common.models import ApplicationLogEntry
    from datetime import timedelta

    level = request.GET.get('level')
    service = request.GET.get('service')
    user_id = request.GET.get('user_id')
    request_id = request.GET.get('request_id')
    days = int(request.GET.get('days', 7))

    storage_enabled = getattr(settings, "PERSIST_REQUEST_LOGS", False) or getattr(
        settings, "PERSIST_APP_DIAGNOSTIC_LOGS", False
    )
    if not storage_enabled:
        return success_response({
            "logs": [],
            "filters": {
                "level": level,
                "service": service,
                "user_id": user_id,
                "request_id": request_id,
                "days": days,
            },
            "storage_enabled": False,
            "message": "Database log persistence is disabled. Use runtime log aggregation instead of the primary app database.",
        })

    logs = ApplicationLogEntry.objects.all()
    
    # Apply filters
    if level:
        logs = logs.filter(level=level)
    if service:
        logs = logs.filter(service=service)
    if user_id:
        logs = logs.filter(user_id=user_id)
    if request_id:
        logs = logs.filter(request_id=request_id)
    
    # Filter by date range
    since = timezone.now() - timedelta(days=days)
    logs = logs.filter(created_at__gte=since)
    
    # Order and paginate
    logs = logs.order_by('-created_at')[:1000]
    
    return success_response({
        "logs": [
            {
                "id": log.id,
                "level": log.level,
                "service": log.service,
                "message": log.message,
                "request_id": log.request_id,
                "user_id": log.user_id,
                "user_email": log.user.email if log.user else None,
                "request_method": log.request_method,
                "request_path": log.request_path,
                "response_status": log.response_status,
                "duration_ms": log.duration_ms,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
        "filters": {
            "level": level,
            "service": service,
            "user_id": user_id,
            "request_id": request_id,
            "days": days,
        }
    })


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_errors_view(request):
    """Get error reports with filtering and statistics."""
    from common.models import ErrorReport
    from datetime import timedelta

    error_type = request.GET.get('error_type')
    is_resolved = request.GET.get('is_resolved')
    days = int(request.GET.get('days', 30))

    if not getattr(settings, "PERSIST_ERROR_REPORTS", False):
        return success_response({
            "errors": [],
            "statistics": {
                "storage_enabled": False,
                "total_errors": 0,
                "unresolved_errors": 0,
                "errors_last_24h": 0,
            },
            "filters": {
                "error_type": error_type,
                "is_resolved": is_resolved,
                "days": days,
            },
            "message": "Database error persistence is disabled. Use Sentry or your external error pipeline for production observability.",
        })

    errors = ErrorReport.objects.all()
    
    # Apply filters
    if error_type:
        errors = errors.filter(error_type__icontains=error_type)
    if is_resolved:
        errors = errors.filter(is_resolved=is_resolved.lower() == 'true')
    
    # Filter by date range
    since = timezone.now() - timedelta(days=days)
    errors = errors.filter(last_occurrence__gte=since)
    
    # Order and paginate
    errors = errors.order_by('-last_occurrence')[:100]
    
    # Get statistics
    from django.db.models import Count, Q
    total_errors = ErrorReport.objects.count()
    unresolved_errors = ErrorReport.objects.filter(is_resolved=False).count()
    errors_last_24h = ErrorReport.objects.filter(
        last_occurrence__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    return success_response({
        "errors": [
            {
                "id": error.id,
                "error_type": error.error_type,
                "error_message": error.error_message[:200],
                "occurrence_count": error.occurrence_count,
                "user_id": error.user_id,
                "user_email": error.user.email if error.user else None,
                "is_resolved": error.is_resolved,
                "first_occurrence": error.first_occurrence.isoformat(),
                "last_occurrence": error.last_occurrence.isoformat(),
            }
            for error in errors
        ],
        "statistics": {
            "total_errors": total_errors,
            "unresolved_errors": unresolved_errors,
            "errors_last_24h": errors_last_24h,
        },
        "filters": {
            "error_type": error_type,
            "is_resolved": is_resolved,
            "days": days,
        }
    })


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_cache_view(request):
    """Manage cache - view stats or clear cache."""
    from services.caching import CacheManager
    
    if request.method == "POST":
        try:
            payload = parse_json_body(request)
        except (ValueError, ValidationError):
            payload = {}
        
        if payload.get('action') == 'clear':
            CacheManager.clear()
            return success_response({"message": "Cache cleared successfully"})
        elif payload.get('action') == 'invalidate' and payload.get('key'):
            CacheManager.delete(payload.get('key'))
            return success_response({"message": f"Cache key '{payload.get('key')}' invalidated"})
        else:
            return error_response(
                request,
                "INVALID_ACTION",
                "Valid actions are: clear, invalidate",
                status=400,
            )
    
    # GET request - return cache statistics
    stats = CacheManager.get_stats()
    
    return success_response({
        "cache_stats": stats,
        "cache_backends": {
            "user_profile_ttl": f"{CacheManager.USER_PROFILE_TTL // 60} minutes",
            "course_list_ttl": f"{CacheManager.COURSE_LIST_TTL // 60} minutes",
            "company_jobs_ttl": f"{CacheManager.COMPANY_JOBS_TTL // 60} minutes",
            "matching_results_ttl": f"{CacheManager.MATCHING_RESULTS_TTL // 60} minutes",
            "dashboard_metrics_ttl": f"{CacheManager.DASHBOARD_METRICS_TTL // 60} minutes",
        }
    })


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_security_view(request):
    """Get security metrics and configuration."""
    from services.security import SecurityManager
    
    metrics = SecurityManager.get_security_metrics()
    
    return success_response({
        "security_metrics": metrics,
        "configuration": {
            "login_attempts_limit": SecurityManager.LOGIN_ACCOUNT_LIMIT,
            "login_attempts_window": f"{SecurityManager.LOGIN_WINDOW_SECONDS // 60} minutes per IP/email pair",
            "login_ip_attempts_limit": SecurityManager.LOGIN_IP_LIMIT,
            "api_requests_limit": SecurityManager.API_LIMIT,
            "api_requests_window": "1 minute",
            "signup_limit": SecurityManager.SIGNUP_LIMIT,
            "signup_window": "1 minute per IP",
        }
    })


@api_endpoint(["POST"], authentication_required=False)
def web_vitals_view(request):
    """Accept frontend web vitals beacons without requiring auth."""
    from services.logging import LogAggregationService

    try:
        payload = parse_json_body(request)
    except (ValueError, ValidationError):
        payload = {}

    if payload:
        LogAggregationService.info(
            service="frontend",
            message="Web vitals received",
            request_id=getattr(request, "request_id", None),
            user_id=request.user.id if request.user.is_authenticated else None,
            metadata={
                "name": payload.get("name"),
                "value": payload.get("value"),
                "rating": payload.get("rating"),
                "lcp": payload.get("lcp"),
                "fid": payload.get("fid"),
                "cls": payload.get("cls"),
                "ttfb": payload.get("ttfb"),
            },
            persist_db=False,
        )

    return success_response({"received": True}, status=202)


@api_endpoint(["POST"], authentication_required=False)
def frontend_logs_view(request):
    """Accept frontend error logs from client."""
    from services.logging import LogAggregationService
    
    try:
        payload = parse_json_body(request)
    except (ValueError, ValidationError):
        return error_response(
            request,
            "INVALID_JSON",
            "Invalid JSON in request body",
            status=400,
        )
    
    error_type = payload.get('error_type', 'UnknownError')
    error_message = payload.get('error_message', '')
    
    LogAggregationService.error(
        service='frontend',
        message=f"{error_type}: {error_message}",
        request_id=getattr(request, 'request_id', None),
        user_id=request.user.id if request.user.is_authenticated else None,
        metadata={
            'error_type': error_type,
            'stack_trace': payload.get('stack_trace'),
            'component_stack': payload.get('component_stack'),
            'timestamp': payload.get('timestamp'),
            'user_agent': request.META.get('HTTP_USER_AGENT'),
        },
        persist_db=False,
    )
    
    return success_response({"message": "Error logged successfully"})




# Phase 14: Learning Enhancements

# Serializers

def serialize_exam_category(category: ExamCategory) -> dict:
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "icon": category.icon,
        "order": category.order,
        "active": category.active,
        "created_at": category.created_at.isoformat(),
    }

def serialize_practice_question(question: PracticeQuestion) -> dict:
    return {
        "id": question.id,
        "exam_id": question.exam_id,
        "question_text": question.question_text,
        "explanation": question.explanation,
        "difficulty": question.difficulty,
        "topic": question.topic,
        "options": [serialize_practice_question_option(opt) for opt in question.options.all()],
        "created_at": question.created_at.isoformat(),
    }

def serialize_practice_question_option(option: PracticeQuestionOption) -> dict:
    return {
        "id": option.id,
        "question_id": option.question_id,
        "option_text": option.option_text,
        "is_correct": option.is_correct,
        "explanation": option.explanation,
    }

def serialize_mock_exam(exam: MockExam) -> dict:
    return {
        "id": exam.id,
        "exam_id": exam.exam_id,
        "title": exam.title,
        "description": exam.description,
        "duration_minutes": exam.duration_minutes,
        "created_at": exam.created_at.isoformat(),
    }

def serialize_study_plan(plan: StudyPlan) -> dict:
    return {
        "id": plan.id,
        "student_id": plan.student_id,
        "exam_id": plan.exam_id,
        "exam_title": plan.exam.title,
        "created_at": plan.created_at.isoformat(),
        "completed_at": plan.completed_at.isoformat() if plan.completed_at else None,
    }

def serialize_study_plan_item(item: StudyPlanItem) -> dict:
    return {
        "id": item.id,
        "study_plan_id": item.study_plan_id,
        "item_type": item.item_type,
        "lesson_id": item.lesson_id,
        "practice_question_id": item.practice_question_id,
        "mock_exam_id": item.mock_exam_id,
        "completed": item.completed,
        "completion_date": item.completion_date.isoformat() if item.completion_date else None,
        "order": item.order,
    }

def serialize_performance_metric(metric: StudentPerformanceMetric) -> dict:
    return {
        "id": metric.id,
        "student_id": metric.student_id,
        "exam_id": metric.exam_id,
        "metric_type": metric.metric_type,
        "value": metric.value,
        "trend": metric.trend,
        "calculated_at": metric.calculated_at.isoformat(),
    }

# Endpoints

@api_endpoint(["GET", "POST"], authentication_required=False)
def exam_categories_view(request):
    if request.method == "POST":
        if not hasattr(request.user, 'is_staff') or not request.user.is_staff:
            return error_response(
                request,
                "forbidden",
                "Only admin users can create exam categories.",
                status=403,
            )
        
        try:
            payload = parse_json_body(request)
        except (ValueError, ValidationError) as e:
            return error_response(
                request,
                "invalid_request",
                str(e),
                status=400,
            )
        
        try:
            category = ExamCategory.objects.create(
                name=payload.get("name"),
                description=payload.get("description", ""),
                icon=payload.get("icon", "book"),
                order=payload.get("order", 0),
                active=payload.get("active", True),
            )
            return success_response(serialize_exam_category(category), status=201)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_data", str(e), status=400)
    
    categories = ExamCategory.objects.filter(active=True).order_by("order", "name")
    return success_response({
        "categories": [serialize_exam_category(cat) for cat in categories]
    })

@api_endpoint(["GET", "PUT", "DELETE"], authentication_required=False)
def exam_category_detail_view(request, category_id):
    try:
        category = ExamCategory.objects.get(id=category_id)
    except ExamCategory.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Exam category not found.",
            status=404,
        )
    
    if request.method == "GET":
        exams = category.exams.filter(status=Exam.Status.ACTIVE)
        return success_response({
            "category": serialize_exam_category(category),
            "exams": [{"id": e.id, "title": e.title} for e in exams],
        })
    
    if not hasattr(request.user, 'is_staff') or not request.user.is_staff:
        return error_response(
            request,
            "forbidden",
            "Only admin users can modify exam categories.",
            status=403,
        )
    
    if request.method == "PUT":
        try:
            payload = parse_json_body(request)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_request", str(e), status=400)
        
        category.name = payload.get("name", category.name)
        category.description = payload.get("description", category.description)
        category.icon = payload.get("icon", category.icon)
        category.order = payload.get("order", category.order)
        category.active = payload.get("active", category.active)
        category.save()
        return success_response(serialize_exam_category(category))
    
    if request.method == "DELETE":
        if category.exams.exists():
            return error_response(
                request,
                "conflict",
                "Cannot delete category with associated exams.",
                status=400,
            )
        category.delete()
        return success_response({"message": "Category deleted successfully."})

@api_endpoint(["GET", "POST"], authentication_required=False)
def practice_questions_list_view(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return error_response(request, "not_found", "Exam not found.", status=404)
    
    if request.method == "POST":
        if not hasattr(request.user, 'is_staff') or not request.user.is_staff:
            return error_response(
                request,
                "forbidden",
                "Only admin users can create practice questions.",
                status=403,
            )
        
        try:
            payload = parse_json_body(request)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_request", str(e), status=400)
        
        try:
            question = PracticeQuestion.objects.create(
                exam=exam,
                question_text=payload.get("question_text"),
                explanation=payload.get("explanation", ""),
                difficulty=payload.get("difficulty", "medium"),
                topic=payload.get("topic", ""),
            )
            
            for opt in payload.get("options", []):
                PracticeQuestionOption.objects.create(
                    question=question,
                    option_text=opt.get("option_text"),
                    is_correct=opt.get("is_correct", False),
                    explanation=opt.get("explanation", ""),
                )
            
            return success_response(serialize_practice_question(question), status=201)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_data", str(e), status=400)
    
    questions = PracticeQuestion.objects.filter(exam=exam).order_by("-created_at")
    return success_response({
        "questions": [serialize_practice_question(q) for q in questions]
    })

@api_endpoint(["GET", "POST"], authentication_required=False)
def practice_question_detail_view(request, question_id):
    try:
        question = PracticeQuestion.objects.get(id=question_id)
    except PracticeQuestion.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Practice question not found.",
            status=404,
        )
    
    if request.method == "GET":
        return success_response(serialize_practice_question(question))
    
    if request.method == "POST":
        if not request.user.is_authenticated or request.user.role != User.Role.STUDENT:
            return error_response(
                request,
                "unauthorized",
                "Only authenticated students can submit answers.",
                status=403,
            )
        
        try:
            payload = parse_json_body(request)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_request", str(e), status=400)
        
        try:
            option_id = payload.get("selected_option_id")
            selected_option = PracticeQuestionOption.objects.get(
                id=option_id,
                question=question
            )
            
            is_correct = selected_option.is_correct
            
            return success_response({
                "is_correct": is_correct,
                "explanation": selected_option.explanation,
                "correct_option_id": PracticeQuestionOption.objects.filter(
                    question=question,
                    is_correct=True
                ).first().id,
            })
        except PracticeQuestionOption.DoesNotExist:
            return error_response(request, "not_found", "Option not found.", status=404)

@api_endpoint(["GET", "POST"], authentication_required=False)
def mock_exams_list_view(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return error_response(request, "not_found", "Exam not found.", status=404)
    
    if request.method == "POST":
        if not hasattr(request.user, 'is_staff') or not request.user.is_staff:
            return error_response(
                request,
                "forbidden",
                "Only admin users can create mock exams.",
                status=403,
            )
        
        try:
            payload = parse_json_body(request)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_request", str(e), status=400)
        
        try:
            mock_exam = MockExam.objects.create(
                exam=exam,
                title=payload.get("title"),
                description=payload.get("description", ""),
                duration_minutes=payload.get("duration_minutes", exam.duration_minutes),
            )
            return success_response(serialize_mock_exam(mock_exam), status=201)
        except (ValueError, ValidationError) as e:
            return error_response(request, "invalid_data", str(e), status=400)
    
    mock_exams = MockExam.objects.filter(exam=exam).order_by("-created_at")
    return success_response({
        "mock_exams": [serialize_mock_exam(m) for m in mock_exams]
    })

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def study_plan_view(request):
    try:
        profile = StudentProfile.objects.get(user=request.user)
        plan = StudyPlan.objects.get(student=profile)
    except (StudentProfile.DoesNotExist, StudyPlan.DoesNotExist):
        return error_response(request, "not_found", "No study plan found.", status=404)
    
    items = plan.items.all()
    return success_response({
        "plan": serialize_study_plan(plan),
        "items": [serialize_study_plan_item(item) for item in items],
    })

@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def study_plan_item_complete_view(request, item_id):
    item = (
        StudyPlanItem.objects.select_related("study_plan__student__user")
        .filter(id=item_id, study_plan__student__user=request.user)
        .first()
    )
    if item is None:
        return error_response(request, "not_found", "Study plan item not found.", status=404)

    if not item.completed:
        item.completed = True
        item.completion_date = timezone.localdate()
        item.save(update_fields=["completed", "completion_date"])

    return success_response(serialize_study_plan_item(item))

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_performance_view(request):
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    metrics = StudentPerformanceMetric.objects.filter(student=profile).order_by("-calculated_at")
    return success_response({
        "metrics": [serialize_performance_metric(m) for m in metrics]
    })

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_performance_exam_view(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        profile = StudentProfile.objects.get(user=request.user)
    except (Exam.DoesNotExist, StudentProfile.DoesNotExist):
        return error_response(request, "not_found", "Not found.", status=404)
    
    metrics = StudentPerformanceMetric.objects.filter(
        student=profile,
        exam=exam
    ).order_by("-calculated_at")
    
    return success_response({
        "metrics": [serialize_performance_metric(m) for m in metrics]
    })


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_data_view(request):
    """Analytics dashboard data for student - all metrics and charts"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_student_dashboard_data(profile)
    return success_response(data)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_learning_view(request):
    """Analytics data for student learning progress"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_student_dashboard_data(profile)
    return success_response({
        'metrics': data['metrics'],
        'score_history': data['score_history'],
        'learning_status': data['learning_status'],
    })


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_applications_view(request):
    """Analytics data for student applications"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_student_dashboard_data(profile)
    return success_response({
        'metrics': {
            'applications_submitted': data['metrics']['applications_submitted'],
            'applications_accepted': data['metrics']['applications_accepted'],
            'applications_rejected': data['metrics']['applications_rejected'],
        },
        'application_status': data['application_status'],
        'upcoming_interviews': data['upcoming_interviews'],
    })


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_dashboard_data_view(request):
    """Analytics dashboard data for company - all metrics and charts"""
    try:
        company = Company.objects.get(id=request.user.company_id)
    except Company.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Company not found.",
            status=404,
        )
    
    # Check if user is authorized to view company data
    if request.user.company_id != company.id:
        return error_response(
            request,
            "forbidden",
            "You do not have permission to view this company's data.",
            status=403,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_company_dashboard_data(company)
    return success_response(data)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_dashboard_pipeline_view(request):
    """Analytics data for company hiring pipeline"""
    try:
        company = Company.objects.get(id=request.user.company_id)
    except Company.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Company not found.",
            status=404,
        )
    
    # Check if user is authorized to view company data
    if request.user.company_id != company.id:
        return error_response(
            request,
            "forbidden",
            "You do not have permission to view this company's data.",
            status=403,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_company_dashboard_data(company)
    return success_response({
        'metrics': {
            'total_applications': data['metrics']['total_applications'],
            'interviews_scheduled': data['metrics']['interviews_scheduled'],
            'interview_conversion_rate': data['metrics']['interview_conversion_rate'],
            'shortlist_ratio': data['metrics']['shortlist_ratio'],
            'average_time_to_hire_days': data['metrics']['average_time_to_hire_days'],
        },
        'funnel_data': data['funnel_data'],
        'vacancy_performance': data['vacancy_performance'],
    })


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_dashboard_data_view(request):
    """Platform-wide analytics data for admin"""
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_admin_dashboard_data()
    return success_response(data)


# Privacy & Consent APIs
from api.privacy_utils import (
    check_student_data_access,
    log_student_data_access,
    get_client_ip,
    get_user_consent_for_company,
)
from users.models import DataConsent, StudentDataAccessLog, DataExportRequest, DataDeletionRequest
from datetime import timedelta


def serialize_consent(consent: DataConsent) -> dict:
    return {
        "id": consent.id,
        "consent_type": consent.consent_type,
        "given": consent.given,
        "given_at": consent.given_at.isoformat() if consent.given_at else None,
        "company_id": consent.company_id,
        "company_name": consent.company.name if consent.company else None,
        "created_at": consent.created_at.isoformat(),
        "updated_at": consent.updated_at.isoformat(),
    }


def serialize_access_log(log: StudentDataAccessLog) -> dict:
    return {
        "id": log.id,
        "access_type": log.access_type,
        "accessed_by_email": log.accessed_by.email,
        "accessed_by_name": log.accessed_by.full_name,
        "company_name": log.accessed_by_company.name if log.accessed_by_company else None,
        "reason": log.reason,
        "ip_address": log.ip_address,
        "created_at": log.created_at.isoformat(),
    }


def serialize_export_request(export: DataExportRequest) -> dict:
    return {
        "id": export.id,
        "status": export.status,
        "file_url": export.file_url,
        "requested_at": export.requested_at.isoformat(),
        "expires_at": export.expires_at.isoformat(),
        "is_expired": export.is_expired,
        "created_at": export.created_at.isoformat(),
        "updated_at": export.updated_at.isoformat(),
    }


def serialize_deletion_request(deletion: DataDeletionRequest) -> dict:
    return {
        "id": deletion.id,
        "status": deletion.status,
        "reason": deletion.reason,
        "requested_at": deletion.requested_at.isoformat(),
        "completed_at": deletion.completed_at.isoformat() if deletion.completed_at else None,
        "created_at": deletion.created_at.isoformat(),
        "updated_at": deletion.updated_at.isoformat(),
    }


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_consent_view(request):
    """Get or update student data consent preferences."""
    if request.method == "GET":
        # Get all consents for the student
        consents = DataConsent.objects.filter(student=request.user)
        
        # Include all consent types even if not yet created
        all_consent_types = dict(DataConsent.CONSENT_TYPES)
        consent_data = {}
        
        for consent_type, description in DataConsent.CONSENT_TYPES:
            type_consents = consents.filter(consent_type=consent_type)
            if type_consents.exists():
                consent_data[consent_type] = [serialize_consent(c) for c in type_consents]
            else:
                consent_data[consent_type] = []
        
        return success_response({"consents": consent_data})
    
    elif request.method == "PUT":
        try:
            payload = parse_json_body(request)
        except Exception as e:
            return error_response(request, "invalid_request", str(e), status=400)
        
        consent_type = payload.get("consent_type")
        given = payload.get("given", False)
        company_id = payload.get("company_id")
        
        if not consent_type or consent_type not in dict(DataConsent.CONSENT_TYPES):
            return error_response(request, "invalid_request", "Invalid consent_type.", status=400)
        
        company = None
        if company_id:
            try:
                company = Company.objects.get(id=company_id)
            except Company.DoesNotExist:
                return error_response(request, "not_found", "Company not found.", status=404)
        
        try:
            consent, created = DataConsent.objects.update_or_create(
                student=request.user,
                consent_type=consent_type,
                company=company,
                defaults={
                    "given": given,
                    "given_at": timezone.now() if given else None,
                    "ip_address": get_client_ip(request),
                    "user_agent": request.META.get("HTTP_USER_AGENT", "")[:500],
                }
            )
            consent.full_clean()
            consent.save()
            
            return success_response(
                {"consent": serialize_consent(consent)},
                status=201 if created else 200
            )
        except ValidationError as e:
            return error_response(request, "validation_error", str(e.messages), status=400)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_data_access_log_view(request):
    """Get audit log of who accessed my data."""
    logs = StudentDataAccessLog.objects.filter(student=request.user).order_by("-created_at")
    
    # Optional filtering by company
    company_id = request.GET.get("company_id")
    if company_id:
        logs = logs.filter(accessed_by_company_id=company_id)
    
    # Optional filtering by access type
    access_type = request.GET.get("access_type")
    if access_type:
        logs = logs.filter(access_type=access_type)
    
    return success_response({
        "logs": [serialize_access_log(log) for log in logs[:100]]  # Limit to 100 most recent
    })


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_data_export_request_view(request):
    """Request to export all personal data."""
    try:
        # Create a new export request
        expires_at = timezone.now() + timedelta(days=30)
        export_request = DataExportRequest.objects.create(
            student=request.user,
            status="pending",
            expires_at=expires_at,
        )
        export_request.full_clean()
        export_request.save()
        
        return success_response(
            {"export_request": serialize_export_request(export_request)},
            status=201
        )
    except ValidationError as e:
        return error_response(request, "validation_error", str(e.messages), status=400)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_data_export_detail_view(request, export_id):
    """Get export request status or download link."""
    try:
        export_request = DataExportRequest.objects.get(id=export_id, student=request.user)
    except DataExportRequest.DoesNotExist:
        return error_response(request, "not_found", "Export request not found.", status=404)
    
    return success_response({"export_request": serialize_export_request(export_request)})


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_deletion_request_view(request):
    """Request account deletion."""
    try:
        payload = parse_json_body(request)
        reason = payload.get("reason", "")
        
        # Check if there's already a pending deletion request
        existing = DataDeletionRequest.objects.filter(
            student=request.user,
            status__in=["pending", "processing"]
        ).exists()
        
        if existing:
            return error_response(
                request,
                "validation_error",
                "You already have a pending deletion request.",
                status=400
            )
        
        deletion_request = DataDeletionRequest.objects.create(
            student=request.user,
            status="pending",
            reason=reason,
        )
        deletion_request.full_clean()
        deletion_request.save()
        
        return success_response(
            {"deletion_request": serialize_deletion_request(deletion_request)},
            status=201
        )
    except ValidationError as e:
        return error_response(request, "validation_error", str(e.messages), status=400)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_deletion_status_view(request):
    """Check deletion request status."""
    deletion_request = DataDeletionRequest.objects.filter(
        student=request.user
    ).order_by("-created_at").first()
    
    if not deletion_request:
        return success_response({"deletion_request": None})
    
    return success_response({"deletion_request": serialize_deletion_request(deletion_request)})
