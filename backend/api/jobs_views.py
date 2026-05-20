from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count, Q

from api.pagination import paginate_list, paginate_queryset, parse_pagination_params
from common.decorators import api_endpoint
from common.http import error_response, parse_json_body, success_response
from users.models import CompanyCourseBookmark, Course, LearningRecord, Lesson, User


def serialize_company_course_record(course: Course, *, viewer: User) -> dict:
    from api.views import serialize_admin_course

    return {
        **serialize_admin_course(course, viewer=viewer),
        "is_bookmarked": CompanyCourseBookmark.objects.filter(user=viewer, course=course).exists(),
        "detail_href": f"/company/courses/{course.id}",
        "bookmark_href": f"/company/courses/{course.id}/bookmark",
    }


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_jobs_view(request):
    from api.views import build_student_jobs_response, validate_student_jobs_filters

    filters = validate_student_jobs_filters(request)
    payload = build_student_jobs_response(request.user, filters)
    page, page_size = parse_pagination_params(request)
    paged_vacancies, pagination = paginate_list(payload["vacancies"], page=page, page_size=page_size)
    return success_response(
        {
            **payload,
            "vacancies": paged_vacancies,
            "pagination": pagination,
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_job_detail_view(request, vacancy_id: int):
    from api.views import get_visible_student_vacancy, serialize_student_job_detail

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
    from api.views import (
        course_review_summary_map,
        get_learning_record_resume_href,
        serialize_student_course_summary,
        sync_learning_record_progress,
        visible_student_courses_queryset,
    )

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
    serialized_courses = [
        serialize_student_course_summary(
            course,
            learning_record=learning_records.get(course.id),
            learning_record_count=learning_record_counts.get(course.id, 0),
            average_rating=review_summaries.get(course.id, {}).get("average_rating"),
            rating_count=review_summaries.get(course.id, {}).get("rating_count", 0),
            lesson_count=lesson_counts.get(course.id, 0),
            next_step_label=(
                "Continue course"
                if learning_records.get(course.id) is not None
                and learning_records[course.id].status != LearningRecord.Status.COMPLETED
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
    ]
    page, page_size = parse_pagination_params(request)
    paged_courses, pagination = paginate_list(serialized_courses, page=page, page_size=page_size)
    return success_response(
        {
            "result_count": len(serialized_courses),
            "courses": paged_courses,
            "pagination": pagination,
        }
    )


def _company_courses_queryset(request):
    queryset = Course.objects.select_related("company", "created_by").order_by("-updated_at", "-id")
    query = request.GET.get("q", "").strip()
    category = request.GET.get("category", "").strip()
    difficulty_level = request.GET.get("difficulty_level", "").strip()
    status = request.GET.get("status", "").strip().lower()
    bookmarked_only = request.GET.get("bookmarked", "").strip().lower() in {"1", "true", "yes"}

    if query:
        queryset = queryset.filter(
            Q(title__icontains=query)
            | Q(description__icontains=query)
            | Q(category__icontains=query)
            | Q(company__name__icontains=query)
        )
    if category:
        queryset = queryset.filter(category__iexact=category)
    if difficulty_level:
        queryset = queryset.filter(difficulty_level__iexact=difficulty_level)
    if status:
        queryset = queryset.filter(status=status)
    if bookmarked_only:
        queryset = queryset.filter(company_bookmarks__user=request.user)
    return queryset.distinct()


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_courses_view(request):
    from api.views import get_admin_course, sync_course_media_fields, validate_admin_course_payload

    if request.method == "GET":
        page, page_size = parse_pagination_params(request)
        queryset = _company_courses_queryset(request)
        page_courses, pagination = paginate_queryset(queryset, page=page, page_size=page_size)
        serialized_courses = [serialize_company_course_record(course, viewer=request.user) for course in page_courses]
        categories = sorted(
            item
            for item in queryset.exclude(category="").exclude(category__isnull=True).values_list("category", flat=True).distinct()
        )
        difficulties = sorted(
            item
            for item in queryset.exclude(difficulty_level="").exclude(difficulty_level__isnull=True)
            .values_list("difficulty_level", flat=True)
            .distinct()
        )
        return success_response(
            {
                "courses": serialized_courses,
                "pagination": pagination,
                "available_categories": categories,
                "available_difficulty_levels": difficulties,
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
        company=request.user.company,
        created_by=request.user,
    )
    sync_course_media_fields(course, payload)
    course.full_clean()
    course.save()
    course = get_admin_course(course.id)
    return success_response(serialize_company_course_record(course, viewer=request.user), status=201)


@api_endpoint(["GET", "PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_detail_view(request, course_id: int):
    from api.views import company_can_edit_course, get_admin_course, sync_course_media_fields, validate_admin_course_payload

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
        return success_response(serialize_company_course_record(course, viewer=request.user))

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
        return success_response(serialize_company_course_record(course, viewer=request.user))

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
    return success_response(serialize_company_course_record(course, viewer=request.user))


@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_bookmark_view(request, course_id: int):
    course = Course.objects.select_related("company", "created_by").filter(pk=course_id).first()
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    if request.method == "DELETE":
        CompanyCourseBookmark.objects.filter(user=request.user, course=course).delete()
        return success_response(
            {
                "course_id": course.id,
                "is_bookmarked": False,
                "message": "Saved course removed.",
            }
        )

    bookmark, created = CompanyCourseBookmark.objects.get_or_create(user=request.user, course=course)
    if not created:
        return success_response(
            {
                "course_id": course.id,
                "is_bookmarked": True,
                "message": "Course saved.",
            }
        )
    return success_response(
        {
            "course_id": course.id,
            "is_bookmarked": True,
            "message": "Course saved.",
        },
        status=201,
    )
