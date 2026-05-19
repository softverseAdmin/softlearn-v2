from celery import shared_task
from django.contrib.auth import get_user_model

from services.matching_jobs import (
    cache_company_vacancy_matches_snapshot,
    cache_student_matches_snapshot,
)
from users.models import Vacancy

User = get_user_model()


@shared_task(ignore_result=True)
def refresh_student_matches_snapshot(student_id: int) -> None:
    try:
        student = User.objects.get(pk=student_id, role=User.Role.STUDENT, is_active=True)
    except User.DoesNotExist:
        return

    from api.matching_views import ranked_matches_for_student
    from api.views import Application, JobBookmark, serialize_student_match_record

    matches = ranked_matches_for_student(student)
    bookmarked_vacancy_ids = set(
        JobBookmark.objects.filter(student=student).values_list("vacancy_id", flat=True)
    )
    active_application_vacancy_ids = set(
        Application.objects.filter(student=student)
        .exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
        .values_list("vacancy_id", flat=True)
    )
    payload = {
        "student_id": student.id,
        "match_count": len(matches),
        "matches": [
            serialize_student_match_record(
                student,
                vacancy,
                match_result,
                bookmarked_vacancy_ids=bookmarked_vacancy_ids,
                active_application_vacancy_ids=active_application_vacancy_ids,
            )
            for vacancy, match_result in matches
        ],
    }
    cache_student_matches_snapshot(student.id, payload)


@shared_task(ignore_result=True)
def refresh_company_vacancy_matches_snapshot(vacancy_id: int) -> None:
    try:
        vacancy = Vacancy.objects.select_related("company").get(pk=vacancy_id)
    except Vacancy.DoesNotExist:
        return

    from api.matching_views import ensure_company_match_candidate_accesses_synced, ranked_matches_for_vacancy
    from api.views import serialize_company_vacancy_match_record

    ensure_company_match_candidate_accesses_synced(vacancy.company)
    matches = ranked_matches_for_vacancy(vacancy)
    payload = {
        "company_id": vacancy.company_id,
        "vacancy_id": vacancy.id,
        "vacancy_title": vacancy.title,
        "match_count": len(matches),
        "matches": [
            serialize_company_vacancy_match_record(vacancy, student, match_result)
            for student, match_result in matches
        ],
    }
    cache_company_vacancy_matches_snapshot(vacancy.id, payload)
