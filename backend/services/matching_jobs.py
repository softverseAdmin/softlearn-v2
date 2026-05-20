import logging

from kombu.exceptions import OperationalError as KombuOperationalError
from redis.exceptions import RedisError
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


def student_matches_snapshot_cache_key(student_id: int) -> str:
    return f"match-snapshot:student:{student_id}"


def company_vacancy_matches_snapshot_cache_key(vacancy_id: int) -> str:
    return f"match-snapshot:vacancy:{vacancy_id}"


def get_student_matches_snapshot(student_id: int):
    return cache.get(student_matches_snapshot_cache_key(student_id))


def cache_student_matches_snapshot(student_id: int, payload: dict) -> None:
    cache.set(
        student_matches_snapshot_cache_key(student_id),
        payload,
        getattr(settings, "MATCHES_SNAPSHOT_TTL_SECONDS", 300),
    )


def invalidate_student_matches_snapshot(student_id: int) -> None:
    cache.delete(student_matches_snapshot_cache_key(student_id))


def get_company_vacancy_matches_snapshot(vacancy_id: int):
    return cache.get(company_vacancy_matches_snapshot_cache_key(vacancy_id))


def cache_company_vacancy_matches_snapshot(vacancy_id: int, payload: dict) -> None:
    cache.set(
        company_vacancy_matches_snapshot_cache_key(vacancy_id),
        payload,
        getattr(settings, "MATCHES_SNAPSHOT_TTL_SECONDS", 300),
    )


def invalidate_company_vacancy_matches_snapshot(vacancy_id: int) -> None:
    cache.delete(company_vacancy_matches_snapshot_cache_key(vacancy_id))


def _queue_snapshot_refresh(task, object_id: int, *, refresh_kind: str) -> None:
    try:
        task.delay(object_id)
    except (KombuOperationalError, RedisError, OSError) as exc:
        logger.warning(
            "Skipping %s snapshot refresh because the async broker is unavailable.",
            refresh_kind,
            extra={
                "refresh_kind": refresh_kind,
                "object_id": object_id,
                "error": str(exc),
            },
        )


def queue_student_matches_snapshot_refresh(student_id: int) -> None:
    from api.tasks import refresh_student_matches_snapshot

    if getattr(settings, "MATCHING_ASYNC_REFRESH_ENABLED", False):
        _queue_snapshot_refresh(
            refresh_student_matches_snapshot,
            student_id,
            refresh_kind="student-match",
        )


def queue_company_vacancy_matches_snapshot_refresh(vacancy_id: int) -> None:
    from api.tasks import refresh_company_vacancy_matches_snapshot

    if getattr(settings, "MATCHING_ASYNC_REFRESH_ENABLED", False):
        _queue_snapshot_refresh(
            refresh_company_vacancy_matches_snapshot,
            vacancy_id,
            refresh_kind="company-vacancy-match",
        )
