from __future__ import annotations

from django.core.exceptions import ValidationError
from django.utils import timezone

from api.pagination import paginate_list, parse_pagination_params
from common.decorators import api_endpoint
from common.http import success_response
from users.models import CandidateReviewAccess, Company, User, Vacancy


def ensure_match_candidate_access(company: Company, student: User) -> CandidateReviewAccess:
    candidate_access, created = CandidateReviewAccess.objects.get_or_create(
        company=company,
        student=student,
        source=CandidateReviewAccess.Source.MATCH,
        defaults={"is_active": True},
    )
    if not created and not candidate_access.is_active:
        candidate_access.is_active = True
        candidate_access.save(update_fields=["is_active", "updated_at"])
    return candidate_access


def ranked_matches_for_vacancy(vacancy: Vacancy) -> list[tuple[User, dict]]:
    from api.views import MATCH_RECOMMENDATION_THRESHOLD, cached_aggregate_match_result, matchable_students_queryset

    matches: list[tuple[User, dict]] = []
    for student in matchable_students_queryset():
        match_result = cached_aggregate_match_result(student, vacancy)
        if match_result["score"] >= MATCH_RECOMMENDATION_THRESHOLD:
            matches.append((student, match_result))

    matches.sort(key=lambda item: (-item[1]["score"], item[0].full_name.lower(), item[0].id))
    return matches


def ranked_matches_for_student(student: User) -> list[tuple[Vacancy, dict]]:
    from api.views import MATCH_RECOMMENDATION_THRESHOLD, cached_aggregate_match_result, visible_student_vacancies_queryset

    matches: list[tuple[Vacancy, dict]] = []
    for vacancy in visible_student_vacancies_queryset().order_by("-updated_at", "-id"):
        match_result = cached_aggregate_match_result(student, vacancy)
        if match_result["score"] >= MATCH_RECOMMENDATION_THRESHOLD:
            matches.append((vacancy, match_result))

    matches.sort(key=lambda item: (-item[1]["score"], item[0].title.lower(), item[0].id))
    return matches


def sync_company_match_candidate_accesses(company: Company) -> None:
    from api.views import MATCH_RECOMMENDATION_THRESHOLD, aggregate_match_result, matchable_students_queryset

    active_vacancies = list(
        Vacancy.objects.filter(company=company, status=Vacancy.Status.ACTIVE)
        .select_related("company", "created_by")
        .prefetch_related("skill_requirements__skill", "language_requirements")
        .order_by("-updated_at", "-id")
    )
    students = list(matchable_students_queryset())

    matched_student_ids: set[int] = set()
    for student in students:
        best_score = 0.0
        for vacancy in active_vacancies:
            match_result = aggregate_match_result(student, vacancy)
            best_score = max(best_score, match_result["score"])
        if best_score >= MATCH_RECOMMENDATION_THRESHOLD:
            ensure_match_candidate_access(company, student)
            matched_student_ids.add(student.id)

    CandidateReviewAccess.objects.filter(
        company=company,
        source=CandidateReviewAccess.Source.MATCH,
    ).exclude(student_id__in=matched_student_ids).update(is_active=False, updated_at=timezone.now())


def ensure_company_match_candidate_accesses_synced(company: Company) -> None:
    sync_company_match_candidate_accesses(company)


def queue_company_match_refreshes(company: Company) -> None:
    from services.matching_jobs import queue_company_vacancy_matches_snapshot_refresh

    vacancy_ids = list(
        Vacancy.objects.filter(company=company, status=Vacancy.Status.ACTIVE).values_list("id", flat=True)
    )
    for vacancy_id in vacancy_ids:
        queue_company_vacancy_matches_snapshot_refresh(vacancy_id)


def get_cached_student_match_count(user: User) -> int:
    from services.matching_jobs import get_student_matches_snapshot, queue_student_matches_snapshot_refresh

    cached_payload = get_student_matches_snapshot(user.id)
    if cached_payload is not None:
        queue_student_matches_snapshot_refresh(user.id)
        return int(cached_payload.get("match_count", 0))

    queue_student_matches_snapshot_refresh(user.id)
    refreshed_payload = get_student_matches_snapshot(user.id)
    if refreshed_payload is None:
        return 0
    return int(refreshed_payload.get("match_count", 0))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_matches_view(request):
    from api.views import Application, JobBookmark, serialize_student_match_record
    from services.matching_jobs import get_student_matches_snapshot, queue_student_matches_snapshot_refresh

    cached_payload = get_student_matches_snapshot(request.user.id)
    if cached_payload is not None:
        queue_student_matches_snapshot_refresh(request.user.id)
        page, page_size = parse_pagination_params(request)
        paged_matches, pagination = paginate_list(cached_payload.get("matches", []), page=page, page_size=page_size)
        return success_response(
            {
                **cached_payload,
                "matches": paged_matches,
                "pagination": pagination,
            }
        )

    queue_student_matches_snapshot_refresh(request.user.id)
    refreshed_payload = get_student_matches_snapshot(request.user.id)
    if refreshed_payload is not None:
        page, page_size = parse_pagination_params(request)
        paged_matches, pagination = paginate_list(refreshed_payload.get("matches", []), page=page, page_size=page_size)
        return success_response(
            {
                **refreshed_payload,
                "matches": paged_matches,
                "pagination": pagination,
            }
        )

    bookmarked_vacancy_ids = set(
        JobBookmark.objects.filter(student=request.user).values_list("vacancy_id", flat=True)
    )
    active_application_vacancy_ids = set(
        Application.objects.filter(student=request.user)
        .exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
        .values_list("vacancy_id", flat=True)
    )
    matches = [
        serialize_student_match_record(
            request.user,
            vacancy,
            match_result,
            bookmarked_vacancy_ids=bookmarked_vacancy_ids,
            active_application_vacancy_ids=active_application_vacancy_ids,
        )
        for vacancy, match_result in ranked_matches_for_student(request.user)
    ]
    page, page_size = parse_pagination_params(request)
    paged_matches, pagination = paginate_list(matches, page=page, page_size=page_size)
    return success_response(
        {
            "student_id": request.user.id,
            "match_count": len(matches),
            "matches": paged_matches,
            "pagination": pagination,
            "refresh_pending": True,
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_vacancy_matches_view(request, vacancy_id: int):
    from api.views import get_company_vacancy, serialize_company_vacancy_match_record
    from services.matching_jobs import get_company_vacancy_matches_snapshot, queue_company_vacancy_matches_snapshot_refresh

    vacancy = get_company_vacancy(request.user, vacancy_id)
    cached_payload = get_company_vacancy_matches_snapshot(vacancy.id)
    if cached_payload is not None:
        queue_company_vacancy_matches_snapshot_refresh(vacancy.id)
        page, page_size = parse_pagination_params(request)
        paged_matches, pagination = paginate_list(cached_payload.get("matches", []), page=page, page_size=page_size)
        return success_response(
            {
                **cached_payload,
                "matches": paged_matches,
                "pagination": pagination,
            }
        )

    queue_company_vacancy_matches_snapshot_refresh(vacancy.id)
    refreshed_payload = get_company_vacancy_matches_snapshot(vacancy.id)
    if refreshed_payload is not None:
        page, page_size = parse_pagination_params(request)
        paged_matches, pagination = paginate_list(refreshed_payload.get("matches", []), page=page, page_size=page_size)
        return success_response(
            {
                **refreshed_payload,
                "matches": paged_matches,
                "pagination": pagination,
            }
        )

    matches = []
    for student, match_result in ranked_matches_for_vacancy(vacancy):
        ensure_match_candidate_access(vacancy.company, student)
        matches.append(serialize_company_vacancy_match_record(vacancy, student, match_result))
    page, page_size = parse_pagination_params(request)
    paged_matches, pagination = paginate_list(matches, page=page, page_size=page_size)
    return success_response(
        {
            "company_id": vacancy.company_id,
            "vacancy_id": vacancy.id,
            "vacancy_title": vacancy.title,
            "match_count": len(matches),
            "matches": paged_matches,
            "pagination": pagination,
            "refresh_pending": True,
        }
    )
