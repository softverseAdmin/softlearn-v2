from __future__ import annotations

from math import ceil

from django.core.exceptions import ValidationError


DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def _parse_positive_int(raw_value: str | None, *, field_name: str, default: int) -> int:
    if raw_value in (None, ""):
        return default
    try:
        value = int(raw_value)
    except (TypeError, ValueError) as exc:
        raise ValidationError({field_name: [f"{field_name} must be a valid integer."]}) from exc
    if value <= 0:
        raise ValidationError({field_name: [f"{field_name} must be greater than zero."]})
    return value


def parse_pagination_params(
    request,
    *,
    default_page_size: int = DEFAULT_PAGE_SIZE,
    maximum_page_size: int = MAX_PAGE_SIZE,
) -> tuple[int, int]:
    page = _parse_positive_int(request.GET.get("page"), field_name="page", default=1)
    page_size = _parse_positive_int(
        request.GET.get("page_size"),
        field_name="page_size",
        default=default_page_size,
    )
    if page_size > maximum_page_size:
        raise ValidationError({"page_size": [f"page_size must be less than or equal to {maximum_page_size}."]})
    return page, page_size


def build_pagination_payload(*, page: int, page_size: int, total_count: int) -> dict:
    total_pages = max(1, ceil(total_count / page_size)) if total_count else 1
    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": total_pages,
        "has_previous": page > 1,
        "has_next": page < total_pages,
    }


def paginate_queryset(queryset, *, page: int, page_size: int):
    total_count = queryset.count()
    offset = (page - 1) * page_size
    return queryset[offset : offset + page_size], build_pagination_payload(
        page=page,
        page_size=page_size,
        total_count=total_count,
    )


def paginate_list(items: list, *, page: int, page_size: int):
    total_count = len(items)
    offset = (page - 1) * page_size
    return items[offset : offset + page_size], build_pagination_payload(
        page=page,
        page_size=page_size,
        total_count=total_count,
    )
