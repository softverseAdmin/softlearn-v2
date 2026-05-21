# This module is extracted from api.views to keep route handlers grouped by domain.
from api.views import *  # noqa: F401,F403


@api_endpoint(["GET"])
def health_view(request):
    return success_response({"status": "ok", "request_id": request.request_id})

@api_endpoint(["GET"])
def readiness_view(request):
    payload, status_code = readiness_checks(request)
    return success_response(payload, status=status_code)

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
