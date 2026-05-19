from django.conf import settings
from django.core.cache import cache


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


def queue_student_matches_snapshot_refresh(student_id: int) -> None:
    from api.tasks import refresh_student_matches_snapshot

    if getattr(settings, "MATCHING_ASYNC_REFRESH_ENABLED", False):
        refresh_student_matches_snapshot.delay(student_id)


def queue_company_vacancy_matches_snapshot_refresh(vacancy_id: int) -> None:
    from api.tasks import refresh_company_vacancy_matches_snapshot

    if getattr(settings, "MATCHING_ASYNC_REFRESH_ENABLED", False):
        refresh_company_vacancy_matches_snapshot.delay(vacancy_id)

