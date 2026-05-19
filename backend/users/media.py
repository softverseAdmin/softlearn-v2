from __future__ import annotations

from pathlib import Path
from uuid import uuid4


def build_media_upload_path(prefix: str, filename: str) -> str:
    extension = Path(filename).suffix.lower()
    if not extension:
        extension = ".bin"
    return f"{prefix}/{uuid4().hex}{extension}"


def company_profile_image_upload_to(instance, filename: str) -> str:
    company_id = getattr(instance, "pk", None) or "pending"
    return build_media_upload_path(f"companies/{company_id}/profile-images", filename)


def company_cover_image_upload_to(instance, filename: str) -> str:
    company_id = getattr(instance, "pk", None) or "pending"
    return build_media_upload_path(f"companies/{company_id}/cover-images", filename)


def student_profile_image_upload_to(instance, filename: str) -> str:
    student_id = getattr(instance, "user_id", None) or "pending"
    return build_media_upload_path(f"students/{student_id}/profile-images", filename)


def student_cover_image_upload_to(instance, filename: str) -> str:
    student_id = getattr(instance, "user_id", None) or "pending"
    return build_media_upload_path(f"students/{student_id}/cover-images", filename)


def course_thumbnail_upload_to(instance, filename: str) -> str:
    course_id = getattr(instance, "pk", None) or "pending"
    return build_media_upload_path(f"courses/{course_id}/thumbnails", filename)


def student_resume_upload_to(instance, filename: str) -> str:
    student_id = getattr(instance, "student_id", None) or "pending"
    return build_media_upload_path(f"students/{student_id}/resumes", filename)


def file_url_or_none(field_file) -> str | None:
    if not field_file:
        return None
    try:
        url = field_file.url
    except (AttributeError, ValueError):
        return None
    return url or None


def text_value_or_none(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None

