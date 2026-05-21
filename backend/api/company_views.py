# This module is extracted from api.views to keep route handlers grouped by domain.
from api.views import *  # noqa: F401,F403


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
