from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import FileResponse
from django.utils import timezone
from django.utils.dateparse import parse_date

from common.decorators import api_endpoint
from common.http import error_response, parse_json_body, success_response
from users.models import (
    Skill,
    StudentAvailabilityProfile,
    StudentCertificate,
    StudentEducation,
    StudentExperience,
    StudentProfile,
    StudentResume,
    User,
)
from users.media import file_url_or_none, text_value_or_none


def serialize_record_skill_ids(record) -> list[int]:
    return sorted(skill.id for skill in record.skills.all())


def get_student_profile(user: User) -> StudentProfile:
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    return profile


def get_student_availability_profile(user: User) -> StudentAvailabilityProfile:
    profile, _ = StudentAvailabilityProfile.objects.get_or_create(student=user)
    return profile


def serialize_student_education(record: StudentEducation) -> dict:
    return {
        "id": record.id,
        "institution": record.institution,
        "field_of_study": record.field_of_study,
        "start_date": record.start_date.isoformat(),
        "end_date": record.end_date.isoformat() if record.end_date else None,
        "completion_status": record.completion_status,
        "grade": record.grade,
        "activities": record.activities,
        "description": record.description,
        "skill_ids": serialize_record_skill_ids(record),
    }


def serialize_student_experience(record: StudentExperience) -> dict:
    return {
        "id": record.id,
        "organization": record.organization,
        "role_title": record.role_title,
        "experience_type": record.experience_type,
        "start_date": record.start_date.isoformat(),
        "end_date": record.end_date.isoformat() if record.end_date else None,
        "is_current": record.is_current,
        "summary": record.summary,
        "skill_ids": serialize_record_skill_ids(record),
    }


def serialize_student_certificate(record: StudentCertificate) -> dict:
    return {
        "id": record.id,
        "name": record.name,
        "issuer": record.issuer,
        "issue_date": record.issue_date.isoformat(),
        "expiry_date": record.expiry_date.isoformat() if record.expiry_date else None,
        "credential_id": record.credential_id,
        "credential_url": record.credential_url,
        "description": record.description,
        "skill_ids": serialize_record_skill_ids(record),
    }


def serialize_student_resume(record: StudentResume) -> dict:
    return {
        "id": record.id,
        "display_name": record.display_name,
        "file_name": record.file_name,
        "source_type": record.source_type,
        "download_url": f"/api/v1/student/profile/resumes/{record.id}/download",
        "file_size_bytes": record.file_size_bytes,
        "content_type": record.content_type or None,
        "is_active": record.is_active,
        "created_at": record.created_at.isoformat(),
        "updated_at": record.updated_at.isoformat(),
    }


def serialize_student_availability_profile(profile: StudentAvailabilityProfile) -> dict:
    return {
        "job_search_status": profile.job_search_status,
        "earliest_start_date": profile.earliest_start_date.isoformat() if profile.earliest_start_date else None,
        "interview_availability": profile.interview_availability,
        "scheduling_notes": profile.scheduling_notes,
        "availability_set": profile.availability_set,
        "updated_at": profile.updated_at.isoformat(),
    }


def serialize_student_profile(user: User) -> dict:
    profile = get_student_profile(user)
    availability_profile = get_student_availability_profile(user)
    education_records = list(StudentEducation.objects.filter(student=user).prefetch_related("skills"))
    experience_records = list(StudentExperience.objects.filter(student=user).prefetch_related("skills"))
    certificates = list(StudentCertificate.objects.filter(student=user).prefetch_related("skills"))
    resumes = list(StudentResume.objects.filter(student=user))
    return {
        "student_id": user.id,
        "name": user.full_name,
        "desired_job_type": profile.desired_job_type,
        "desired_work_location": profile.desired_work_location,
        "japanese_level": profile.japanese_level,
        "english_level": profile.english_level,
        "about_me": profile.about_me,
        "profile_image": file_url_or_none(profile.profile_image_file) or text_value_or_none(profile.profile_image),
        "cover_image": file_url_or_none(profile.cover_image_file) or text_value_or_none(profile.cover_image),
        "linkedin_url": profile.linkedin_url or None,
        "github_url": profile.github_url or None,
        "portfolio_url": profile.portfolio_url or None,
        "profile_complete": profile.profile_complete,
        "education_records": [serialize_student_education(record) for record in education_records],
        "experience_records": [serialize_student_experience(record) for record in experience_records],
        "certificates": [serialize_student_certificate(record) for record in certificates],
        "resumes": [serialize_student_resume(record) for record in resumes],
        "availability": serialize_student_availability_profile(availability_profile),
        "profile_extension_summary": {
            "education_count": len(education_records),
            "experience_count": len(experience_records),
            "resume_count": len(resumes),
            "has_active_resume": any(record.is_active for record in resumes),
            "availability_set": availability_profile.availability_set,
        },
    }


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
        "linkedin_url": str(payload.get("linkedin_url", "")).strip(),
        "github_url": str(payload.get("github_url", "")).strip(),
        "portfolio_url": str(payload.get("portfolio_url", "")).strip(),
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


def parse_required_date(value, field_name: str, errors: dict):
    cleaned_value = str(value or "").strip()
    if not cleaned_value:
        errors[field_name] = ["This field is required."]
        return None
    parsed = parse_date(cleaned_value)
    if parsed is None:
        errors[field_name] = ["Use ISO date format YYYY-MM-DD."]
        return None
    return parsed


def parse_optional_date(value, field_name: str, errors: dict):
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


def validate_student_resume_upload(request) -> tuple[dict, object]:
    uploaded_file = request.FILES.get("file")
    if uploaded_file is None:
        raise ValidationError({"file": ["A resume file is required."]})
    payload = validate_student_resume_payload(
        {
            "display_name": request.POST.get("display_name") or uploaded_file.name,
            "file_name": request.POST.get("file_name") or uploaded_file.name,
            "source_type": request.POST.get("source_type") or StudentResume.SourceType.UPLOADED,
            "is_active": str(request.POST.get("is_active", "true")).strip().lower() in {"1", "true", "yes"},
        }
    )
    return payload, uploaded_file


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


def invalidate_student_profile_cache(user: User) -> None:
    cache.delete(f"workspace-summary:{user.id}")


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
    profile.about_me = payload["about_me"]
    profile.profile_image = payload["profile_image"]
    profile.cover_image = payload["cover_image"]
    profile.linkedin_url = payload["linkedin_url"]
    profile.github_url = payload["github_url"]
    profile.portfolio_url = payload["portfolio_url"]
    profile.save(
        update_fields=[
            "desired_job_type",
            "desired_work_location",
            "japanese_level",
            "english_level",
            "about_me",
            "profile_image",
            "cover_image",
            "linkedin_url",
            "github_url",
            "portfolio_url",
            "updated_at",
        ]
    )
    invalidate_student_profile_cache(request.user)
    from services.matching_jobs import (
        invalidate_student_matches_snapshot,
        queue_student_matches_snapshot_refresh,
    )

    invalidate_student_matches_snapshot(request.user.id)
    queue_student_matches_snapshot_refresh(request.user.id)
    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_education_view(request):
    if request.method == "GET":
        return success_response(
            {
                "education_records": [
                    serialize_student_education(record) for record in StudentEducation.objects.filter(student=request.user)
                ],
            }
        )

    payload = validate_student_education_payload(parse_json_body(request))
    skill_ids = payload.pop("skill_ids")
    with transaction.atomic():
        record = StudentEducation(student=request.user, **payload)
        record.full_clean()
        record.save()
        record.skills.set(skill_ids)
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_education_detail_view(request, education_id: int):
    record = StudentEducation.objects.filter(student=request.user, pk=education_id).first()
    if record is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested education record was not found.",
            details={"education_id": [str(education_id)]},
            status=404,
        )

    if request.method == "DELETE":
        record.delete()
        invalidate_student_profile_cache(request.user)
        return success_response(serialize_student_profile(request.user))

    payload = validate_student_education_payload(parse_json_body(request))
    skill_ids = payload.pop("skill_ids")
    for field, value in payload.items():
        setattr(record, field, value)
    with transaction.atomic():
        record.full_clean()
        record.save(
            update_fields=[
                "institution",
                "field_of_study",
                "start_date",
                "end_date",
                "completion_status",
                "grade",
                "activities",
                "description",
                "updated_at",
            ]
        )
        record.skills.set(skill_ids)
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_experience_view(request):
    if request.method == "GET":
        return success_response(
            {
                "experience_records": [
                    serialize_student_experience(record)
                    for record in StudentExperience.objects.filter(student=request.user)
                ],
            }
        )

    payload = validate_student_experience_payload(parse_json_body(request))
    skill_ids = payload.pop("skill_ids")
    with transaction.atomic():
        record = StudentExperience(student=request.user, **payload)
        record.full_clean()
        record.save()
        record.skills.set(skill_ids)
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_experience_detail_view(request, experience_id: int):
    record = StudentExperience.objects.filter(student=request.user, pk=experience_id).first()
    if record is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested experience record was not found.",
            details={"experience_id": [str(experience_id)]},
            status=404,
        )

    if request.method == "DELETE":
        record.delete()
        invalidate_student_profile_cache(request.user)
        return success_response(serialize_student_profile(request.user))

    payload = validate_student_experience_payload(parse_json_body(request))
    skill_ids = payload.pop("skill_ids")
    for field, value in payload.items():
        setattr(record, field, value)
    with transaction.atomic():
        record.full_clean()
        record.save(
            update_fields=[
                "organization",
                "role_title",
                "experience_type",
                "start_date",
                "end_date",
                "is_current",
                "summary",
                "updated_at",
            ]
        )
        record.skills.set(skill_ids)
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_certificates_view(request):
    if request.method == "GET":
        return success_response(
            {
                "certificates": [
                    serialize_student_certificate(record)
                    for record in StudentCertificate.objects.filter(student=request.user).prefetch_related("skills")
                ],
            }
        )

    payload = validate_student_certificate_payload(parse_json_body(request))
    skill_ids = payload.pop("skill_ids")
    with transaction.atomic():
        record = StudentCertificate(student=request.user, **payload)
        record.full_clean()
        record.save()
        record.skills.set(skill_ids)
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_certificate_detail_view(request, certificate_id: int):
    record = StudentCertificate.objects.filter(student=request.user, pk=certificate_id).first()
    if record is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested certificate record was not found.",
            details={"certificate_id": [str(certificate_id)]},
            status=404,
        )

    if request.method == "DELETE":
        record.delete()
        invalidate_student_profile_cache(request.user)
        return success_response(serialize_student_profile(request.user))

    payload = validate_student_certificate_payload(parse_json_body(request))
    skill_ids = payload.pop("skill_ids")
    for field, value in payload.items():
        setattr(record, field, value)
    with transaction.atomic():
        record.full_clean()
        record.save(
            update_fields=[
                "name",
                "issuer",
                "issue_date",
                "expiry_date",
                "credential_id",
                "credential_url",
                "description",
                "updated_at",
            ]
        )
        record.skills.set(skill_ids)
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_resumes_view(request):
    if request.method == "GET":
        return success_response(
            {"resumes": [serialize_student_resume(record) for record in StudentResume.objects.filter(student=request.user)]}
        )

    if request.content_type and request.content_type.startswith("multipart/form-data"):
        payload, uploaded_file = validate_student_resume_upload(request)
    else:
        payload = validate_student_resume_payload(parse_json_body(request))
        uploaded_file = None
    with transaction.atomic():
        if payload["is_active"]:
            StudentResume.objects.filter(student=request.user, is_active=True).update(
                is_active=False,
                updated_at=timezone.now(),
            )
        record = StudentResume(student=request.user, **payload)
        if uploaded_file is not None:
            record.stored_file.save(uploaded_file.name, uploaded_file, save=False)
            record.content_type = uploaded_file.content_type or ""
            record.file_size_bytes = uploaded_file.size
        record.full_clean()
        record.save()
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_resume_detail_view(request, resume_id: int):
    record = StudentResume.objects.filter(student=request.user, pk=resume_id).first()
    if record is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested resume record was not found.",
            details={"resume_id": [str(resume_id)]},
            status=404,
        )

    if request.method == "DELETE":
        if record.stored_file:
            record.stored_file.delete(save=False)
        record.delete()
        invalidate_student_profile_cache(request.user)
        return success_response(serialize_student_profile(request.user))

    payload = validate_student_resume_payload(parse_json_body(request))
    with transaction.atomic():
        if payload["is_active"]:
            StudentResume.objects.filter(student=request.user, is_active=True).exclude(pk=record.pk).update(
                is_active=False,
                updated_at=timezone.now(),
            )
        record.display_name = payload["display_name"]
        record.file_name = payload["file_name"]
        record.source_type = payload["source_type"]
        record.is_active = payload["is_active"]
        record.full_clean()
        record.save(
            update_fields=[
                "display_name",
                "file_name",
                "source_type",
                "is_active",
                "updated_at",
            ]
        )
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_resume_download_view(request, resume_id: int):
    record = StudentResume.objects.filter(student=request.user, pk=resume_id).first()
    if record is None or not record.stored_file:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested resume file was not found.",
            details={"resume_id": [str(resume_id)]},
            status=404,
        )

    response = FileResponse(record.stored_file.open("rb"), as_attachment=True, filename=record.file_name)
    if record.content_type:
        response["Content-Type"] = record.content_type
    return response


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_availability_view(request):
    profile = get_student_availability_profile(request.user)
    if request.method == "GET":
        return success_response({"availability": serialize_student_availability_profile(profile)})

    payload = validate_student_availability_payload(parse_json_body(request))
    profile.job_search_status = payload["job_search_status"]
    profile.earliest_start_date = payload["earliest_start_date"]
    profile.interview_availability = payload["interview_availability"]
    profile.scheduling_notes = payload["scheduling_notes"]
    profile.full_clean()
    profile.save(
        update_fields=[
            "job_search_status",
            "earliest_start_date",
            "interview_availability",
            "scheduling_notes",
            "updated_at",
        ]
    )
    invalidate_student_profile_cache(request.user)
    return success_response(serialize_student_profile(request.user))
