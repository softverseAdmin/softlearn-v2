from __future__ import annotations

from django.core.exceptions import PermissionDenied, ValidationError

from common.decorators import api_endpoint
from common.http import error_response, success_response
from users.media import compress_uploaded_image
from users.models import Course, StudentProfile, User


def _validate_uploaded_image(request):
    uploaded_file = request.FILES.get("file")
    if uploaded_file is None:
        raise ValidationError({"file": ["An image file is required."]})
    if not uploaded_file.content_type or not uploaded_file.content_type.startswith("image/"):
        raise ValidationError({"file": ["Only image uploads are supported."]})
    if uploaded_file.size > 5 * 1024 * 1024:
        raise ValidationError({"file": ["Images must be 5 MB or smaller."]})
    return uploaded_file


def _replace_field_file(instance, *, field_name: str, uploaded_file, clear_text_field: str | None = None) -> None:
    field = getattr(instance, field_name)
    if field and getattr(field, "name", ""):
        field.delete(save=False)
    field.save(uploaded_file.name, uploaded_file, save=False)
    if clear_text_field is not None:
        setattr(instance, clear_text_field, "")


def _clear_field_file(instance, *, field_name: str, clear_text_field: str | None = None) -> None:
    field = getattr(instance, field_name)
    if field and getattr(field, "name", ""):
        field.delete(save=False)
    setattr(instance, field_name, "")
    if clear_text_field is not None:
        setattr(instance, clear_text_field, "")


@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_profile_image_upload_view(request, image_kind: str):
    from api.student_profile_views import invalidate_student_profile_cache, serialize_student_profile

    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    field_map = {
        "profile": ("profile_image_file", "profile_image", "student_profile"),
        "cover": ("cover_image_file", "cover_image", "student_cover"),
    }
    field_names = field_map.get(image_kind)
    if field_names is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested image target was not found.",
            details={"image_kind": [image_kind]},
            status=404,
        )

    file_field_name, text_field_name, image_variant = field_names
    if request.method == "DELETE":
        _clear_field_file(profile, field_name=file_field_name, clear_text_field=text_field_name)
        profile.save(update_fields=[file_field_name, text_field_name, "updated_at"])
        invalidate_student_profile_cache(request.user)
        return success_response(serialize_student_profile(request.user))

    uploaded_file = _validate_uploaded_image(request)
    processed_file = compress_uploaded_image(uploaded_file, variant=image_variant)
    _replace_field_file(profile, field_name=file_field_name, uploaded_file=processed_file, clear_text_field=text_field_name)
    profile.save(update_fields=[file_field_name, text_field_name, "updated_at"])
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user))


@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_profile_image_upload_view(request, image_kind: str):
    from api.views import serialize_company_profile

    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    field_map = {
        "profile": ("profile_image_file", "profile_image", "company_profile"),
        "cover": ("cover_image_file", "cover_image", "company_cover"),
    }
    field_names = field_map.get(image_kind)
    if field_names is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested image target was not found.",
            details={"image_kind": [image_kind]},
            status=404,
        )

    file_field_name, text_field_name, image_variant = field_names
    if request.method == "DELETE":
        _clear_field_file(company, field_name=file_field_name, clear_text_field=text_field_name)
        company.save(update_fields=[file_field_name, text_field_name, "updated_at"])
        return success_response(serialize_company_profile(request.user))

    uploaded_file = _validate_uploaded_image(request)
    processed_file = compress_uploaded_image(uploaded_file, variant=image_variant)
    _replace_field_file(company, field_name=file_field_name, uploaded_file=processed_file, clear_text_field=text_field_name)
    company.save(update_fields=[file_field_name, text_field_name, "updated_at"])
    return success_response(serialize_company_profile(request.user))


@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_course_thumbnail_upload_view(request, course_id: int):
    from api.views import company_can_edit_course
    from api.jobs_views import serialize_company_course_record

    course = Course.objects.select_related("company", "created_by").filter(pk=course_id).first()
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course was not found.",
            details={"course_id": [str(course_id)]},
            status=404,
        )
    if not company_can_edit_course(request.user, course):
        raise PermissionDenied("You can only edit courses created by your company.")

    if request.method == "DELETE":
        _clear_field_file(course, field_name="thumbnail_image_file", clear_text_field="thumbnail_image")
        course.save(update_fields=["thumbnail_image_file", "thumbnail_image", "updated_at"])
        return success_response(serialize_company_course_record(course, viewer=request.user))

    uploaded_file = _validate_uploaded_image(request)
    processed_file = compress_uploaded_image(uploaded_file, variant="course_thumbnail")
    _replace_field_file(course, field_name="thumbnail_image_file", uploaded_file=processed_file, clear_text_field="thumbnail_image")
    course.save(update_fields=["thumbnail_image_file", "thumbnail_image", "updated_at"])
    return success_response(serialize_company_course_record(course, viewer=request.user))
