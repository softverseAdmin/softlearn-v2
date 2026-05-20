from __future__ import annotations

from io import BytesIO
from pathlib import Path
from uuid import uuid4
import warnings

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError


IMAGE_UPLOAD_VARIANTS = {
    "company_profile": {"max_width": 512, "max_height": 512, "quality": 82},
    "company_cover": {"max_width": 1600, "max_height": 900, "quality": 80},
    "student_profile": {"max_width": 512, "max_height": 512, "quality": 82},
    "student_cover": {"max_width": 1600, "max_height": 900, "quality": 80},
    "teacher_profile": {"max_width": 512, "max_height": 512, "quality": 82},
    "teacher_cover": {"max_width": 1600, "max_height": 900, "quality": 80},
    "course_thumbnail": {"max_width": 1280, "max_height": 720, "quality": 80},
}


def build_media_upload_path(prefix: str, filename: str) -> str:
    extension = Path(filename).suffix.lower()
    if not extension:
        extension = ".bin"
    return f"{prefix}/{uuid4().hex}{extension}"


def compress_uploaded_image(uploaded_file, *, variant: str) -> ContentFile:
    config = IMAGE_UPLOAD_VARIANTS.get(variant)
    if config is None:
        raise ValueError(f"Unknown image upload variant: {variant}")

    try:
        uploaded_file.seek(0)
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(uploaded_file) as opened_image:
                image = ImageOps.exif_transpose(opened_image)
                image.load()
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise ValidationError({"file": ["Upload a valid image file."]}) from exc

    has_alpha = image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info)
    output_image = image.convert("RGBA" if has_alpha else "RGB")
    output_image.thumbnail((config["max_width"], config["max_height"]), Image.Resampling.LANCZOS)

    buffer = BytesIO()
    output_image.save(
        buffer,
        format="WEBP",
        quality=config["quality"],
        method=6,
    )
    buffer.seek(0)

    base_name = Path(uploaded_file.name).stem or "upload"
    return ContentFile(buffer.getvalue(), name=f"{base_name}.webp")


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


def teacher_profile_image_upload_to(instance, filename: str) -> str:
    teacher_id = getattr(instance, "user_id", None) or "pending"
    return build_media_upload_path(f"teachers/{teacher_id}/profile-images", filename)


def teacher_cover_image_upload_to(instance, filename: str) -> str:
    teacher_id = getattr(instance, "user_id", None) or "pending"
    return build_media_upload_path(f"teachers/{teacher_id}/cover-images", filename)


def course_thumbnail_upload_to(instance, filename: str) -> str:
    course_id = getattr(instance, "pk", None) or "pending"
    return build_media_upload_path(f"courses/{course_id}/thumbnails", filename)


def course_preview_thumbnail_upload_to(instance, filename: str) -> str:
    course_id = getattr(instance, "pk", None) or "pending"
    return build_media_upload_path(f"courses/{course_id}/preview-thumbnails", filename)


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
