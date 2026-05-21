# This module is extracted from api.views to keep route handlers grouped by domain.
from api.views import *  # noqa: F401,F403


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

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_dashboard_data_view(request):
    """Platform-wide analytics data for admin"""
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_admin_dashboard_data()
    return success_response(data)
