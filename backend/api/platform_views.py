from __future__ import annotations

from django.db.models import F, Q
from django.utils import timezone

from api.message_views import (
    company_message_threads_queryset,
    message_profile_image_for_user,
    serialize_company_messages,
    serialize_student_messages,
)
from api.matching_views import get_cached_student_match_count, ranked_matches_for_student
from api.pagination import paginate_queryset, parse_pagination_params
from common.decorators import api_endpoint
from common.http import error_response, success_response
from users.models import MessageThread, Notification, User


def serialize_workspace_summary(user: User) -> dict:
    notification_unread_count = Notification.objects.filter(recipient=user, read_at__isnull=True).count()
    summary = {
        "notification_unread_count": notification_unread_count,
        "unread_message_count": 0,
        "profile_avatar": None,
    }

    if user.role == User.Role.STUDENT:
        unread_message_count = (
            MessageThread.objects.filter(student=user, last_message_at__isnull=False)
            .exclude(last_message_sender=user)
            .filter(Q(last_read_at__isnull=True) | Q(last_read_at__lt=F("last_message_at")))
            .count()
        )
        summary.update(
            {
                "unread_message_count": unread_message_count,
                "profile_avatar": message_profile_image_for_user(user),
                "match_count": get_cached_student_match_count(user),
            }
        )
    elif user.role == User.Role.COMPANY:
        unread_message_count = (
            company_message_threads_queryset(user)
            .filter(last_message_at__isnull=False)
            .exclude(last_message_sender=user)
            .filter(Q(company_last_read_at__isnull=True) | Q(company_last_read_at__lt=F("last_message_at")))
            .count()
        )
        summary.update(
            {
                "unread_message_count": unread_message_count,
                "profile_avatar": message_profile_image_for_user(user),
            }
        )
    elif user.role == User.Role.TEACHER:
        summary.update(
            {
                "profile_avatar": message_profile_image_for_user(user),
            }
        )

    return summary


def serialize_notification_feed(user: User) -> dict:
    from api.views import Application, JobBookmark, serialize_notification, serialize_student_match_record
    from services.matching_jobs import get_student_matches_snapshot, queue_student_matches_snapshot_refresh

    notifications = list(
        Notification.objects.filter(recipient=user)
        .select_related("actor")
        .order_by("-created_at", "-id")
    )
    data = {
        "role": user.role,
        "notifications": {
            "unread_count": sum(1 for notification in notifications if notification.read_at is None),
            "notifications": [serialize_notification(notification) for notification in notifications],
        },
        "messages": None,
        "matches": None,
    }

    if user.role == User.Role.STUDENT:
        data["messages"] = serialize_student_messages(user)
        cached_payload = get_student_matches_snapshot(user.id)
        if cached_payload is not None:
            queue_student_matches_snapshot_refresh(user.id)
            data["matches"] = {
                "student_id": cached_payload.get("student_id", user.id),
                "match_count": int(cached_payload.get("match_count", 0)),
                "matches": cached_payload.get("matches", []),
            }
            return data

        queue_student_matches_snapshot_refresh(user.id)
        refreshed_payload = get_student_matches_snapshot(user.id)
        if refreshed_payload is not None:
            data["matches"] = {
                "student_id": refreshed_payload.get("student_id", user.id),
                "match_count": int(refreshed_payload.get("match_count", 0)),
                "matches": refreshed_payload.get("matches", []),
            }
            return data

        bookmarked_vacancy_ids = set(
            JobBookmark.objects.filter(student=user).values_list("vacancy_id", flat=True)
        )
        active_application_vacancy_ids = set(
            Application.objects.filter(student=user)
            .exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
            .values_list("vacancy_id", flat=True)
        )
        matches = [
            serialize_student_match_record(
                user,
                vacancy,
                match_result,
                bookmarked_vacancy_ids=bookmarked_vacancy_ids,
                active_application_vacancy_ids=active_application_vacancy_ids,
            )
            for vacancy, match_result in ranked_matches_for_student(user)
        ]
        data["matches"] = {
            "student_id": user.id,
            "match_count": len(matches),
            "matches": matches,
        }
        return data

    if user.role == User.Role.COMPANY:
        data["messages"] = serialize_company_messages(user)

    return data


@api_endpoint(["GET"], authentication_required=True)
def notifications_view(request):
    from api.views import serialize_notification

    page, page_size = parse_pagination_params(request)
    queryset = Notification.objects.filter(recipient=request.user).select_related("actor").order_by("-created_at", "-id")
    page_notifications, pagination = paginate_queryset(queryset, page=page, page_size=page_size)
    unread_count = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()
    return success_response(
        {
            "unread_count": unread_count,
            "notifications": [serialize_notification(notification) for notification in page_notifications],
            "pagination": pagination,
        }
    )


@api_endpoint(["GET"], authentication_required=True)
def notification_feed_view(request):
    return success_response(serialize_notification_feed(request.user))


@api_endpoint(["GET"], authentication_required=True)
def notification_detail_view(request, notification_id: int):
    from api.views import serialize_notification

    notification = Notification.objects.filter(recipient=request.user, pk=notification_id).select_related("actor").first()
    if notification is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested notification was not found.",
            details={"notification_id": [str(notification_id)]},
            status=404,
        )
    return success_response(serialize_notification(notification))


@api_endpoint(["POST"], authentication_required=True)
def notification_read_all_view(request):
    from api.views import serialize_notification

    now = timezone.now()
    Notification.objects.filter(recipient=request.user, read_at__isnull=True).update(read_at=now, updated_at=now)
    page, page_size = parse_pagination_params(request)
    queryset = Notification.objects.filter(recipient=request.user).select_related("actor").order_by("-created_at", "-id")
    page_notifications, pagination = paginate_queryset(queryset, page=page, page_size=page_size)
    return success_response(
        {
            "unread_count": 0,
            "notifications": [serialize_notification(notification) for notification in page_notifications],
            "pagination": pagination,
        }
    )


@api_endpoint(["POST"], authentication_required=True)
def notification_read_view(request, notification_id: int):
    from api.views import serialize_notification

    notification = Notification.objects.filter(recipient=request.user, pk=notification_id).select_related("actor").first()
    if notification is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested notification was not found.",
            details={"notification_id": [str(notification_id)]},
            status=404,
        )

    notification.mark_read()
    return success_response(serialize_notification(notification))


@api_endpoint(["GET"], authentication_required=True)
def workspace_summary_view(request):
    return success_response(serialize_workspace_summary(request.user))
