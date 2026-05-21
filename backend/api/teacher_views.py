# This module is extracted from api.views to keep route handlers grouped by domain.
from api.views import *  # noqa: F401,F403


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
