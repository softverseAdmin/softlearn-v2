from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone

from api.pagination import paginate_list, parse_pagination_params
from common.decorators import api_endpoint
from common.http import error_response, parse_json_body, success_response
from users.models import (
    Application,
    CandidateReviewAccess,
    CompanyMember,
    Interview,
    Message,
    MessageThread,
    StudentProfile,
    User,
)
from users.media import file_url_or_none, text_value_or_none

MESSAGE_CONTACTS_DEFAULT_LIMIT = 25
MESSAGE_CONTACTS_MAX_LIMIT = 100


def parse_bounded_positive_int(raw_value: str | None, *, default: int, maximum: int) -> int:
    if raw_value in (None, ""):
        return default

    try:
        value = int(raw_value)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"limit": ["Limit must be a positive integer."]}) from exc

    if value <= 0:
        raise ValidationError({"limit": ["Limit must be a positive integer."]})
    return min(value, maximum)


def message_sender_display_name(message: Message, viewer: User) -> str:
    if message.sender_id == viewer.id:
        return "You"
    if message.sender is not None and message.sender.full_name.strip():
        return message.sender.full_name
    return message.sender_name


def message_thread_company_name(thread: MessageThread) -> str:
    if thread.company_name.strip():
        return thread.company_name
    if thread.participant_user is not None and thread.participant_user.company is not None:
        return thread.participant_user.company.name
    return "External conversation"


def message_thread_role_label(thread: MessageThread) -> str:
    if thread.role_label.strip():
        return thread.role_label
    if thread.participant_user is not None:
        return thread.participant_user.role.replace("_", " ").title()
    return "Contact"


def message_thread_participant_name(thread: MessageThread, viewer: User) -> str:
    if viewer.role == User.Role.COMPANY:
        if thread.student.full_name.strip():
            return thread.student.full_name
        return thread.student.email
    return thread.participant_name


def message_thread_secondary_label(thread: MessageThread, viewer: User) -> tuple[str, str]:
    if viewer.role == User.Role.COMPANY:
        return (thread.category.replace("_", " ").title(), "Student")
    return (message_thread_company_name(thread), message_thread_role_label(thread))


def message_profile_image_for_user(user: User | None) -> str | None:
    if user is None:
        return None
    if user.role == User.Role.STUDENT:
        try:
            return file_url_or_none(user.student_profile.profile_image_file) or text_value_or_none(
                user.student_profile.profile_image
            )
        except StudentProfile.DoesNotExist:
            return None
    if user.role == User.Role.COMPANY and user.company is not None:
        return file_url_or_none(user.company.profile_image_file) or text_value_or_none(user.company.profile_image)
    return None


def message_thread_participant_image(thread: MessageThread, viewer: User) -> str | None:
    if viewer.role == User.Role.COMPANY:
        return message_profile_image_for_user(thread.student)
    return message_profile_image_for_user(thread.participant_user)


def message_thread_is_unread(thread: MessageThread, viewer: User) -> bool:
    if thread.last_message_at is None:
        return False

    if viewer.role == User.Role.COMPANY:
        if thread.last_message_sender_id == viewer.id:
            return False
        return thread.company_last_read_at is None or thread.company_last_read_at < thread.last_message_at

    if thread.last_message_sender_id == thread.student_id:
        return False
    return thread.last_read_at is None or thread.last_read_at < thread.last_message_at


def serialize_message_record(message: Message, viewer: User) -> dict:
    is_self = message.sender_id == viewer.id
    return {
        "id": message.id,
        "author": "self" if is_self else "other",
        "sender": message_sender_display_name(message, viewer),
        "sender_image": message_profile_image_for_user(message.sender),
        "body": message.body,
        "sent_at": message.created_at.isoformat(),
        "status": message.get_delivery_status_display() if is_self else None,
    }


def serialize_message_thread(thread: MessageThread, *, viewer: User, include_messages: bool = True) -> dict:
    secondary_label, role_label = message_thread_secondary_label(thread, viewer)
    data = {
        "id": thread.id,
        "participant_name": message_thread_participant_name(thread, viewer),
        "company_name": secondary_label,
        "role_label": role_label,
        "category": thread.category,
        "is_unread": message_thread_is_unread(thread, viewer),
        "is_pinned": thread.is_pinned,
        "is_starred": thread.is_starred,
        "last_activity": thread.last_message_at.isoformat() if thread.last_message_at else thread.updated_at.isoformat(),
        "preview": thread.last_message_preview,
        "participant_image": message_thread_participant_image(thread, viewer),
    }
    if include_messages:
        data["messages"] = [serialize_message_record(message, viewer) for message in thread.messages.all()]
    return data


def with_message_thread_related(queryset, *, include_messages: bool):
    queryset = queryset.select_related(
        "student",
        "student__student_profile",
        "participant_user",
        "participant_user__company",
        "last_message_sender",
    )
    if include_messages:
        queryset = queryset.prefetch_related("messages__sender", "messages__sender__company", "messages__sender__student_profile")
    return queryset.order_by("-is_pinned", "-last_message_at", "-updated_at", "-id")


def student_message_threads_queryset(user: User, *, include_messages: bool = False):
    return with_message_thread_related(MessageThread.objects.filter(student=user), include_messages=include_messages)


def company_message_threads_queryset(user: User, *, include_messages: bool = False):
    company = user.company
    if company is None:
        return MessageThread.objects.none()

    accessible_student_ids = CandidateReviewAccess.objects.filter(
        company=company,
        is_active=True,
        student__role=User.Role.STUDENT,
        student__is_active=True,
    ).values("student_id")
    return with_message_thread_related(
        MessageThread.objects.filter(participant_user=user, student_id__in=accessible_student_ids).distinct(),
        include_messages=include_messages,
    )


def serialize_student_messages(user: User) -> dict:
    threads = list(student_message_threads_queryset(user))
    return {
        "student_id": user.id,
        "thread_count": len(threads),
        "unread_count": sum(1 for thread in threads if thread.is_unread),
        "starred_count": sum(1 for thread in threads if thread.is_starred),
        "threads": [serialize_message_thread(thread, viewer=user, include_messages=False) for thread in threads],
    }


def serialize_company_messages(user: User) -> dict:
    threads = list(company_message_threads_queryset(user))
    return {
        "company_id": user.company_id,
        "thread_count": len(threads),
        "unread_count": sum(1 for thread in threads if message_thread_is_unread(thread, user)),
        "starred_count": sum(1 for thread in threads if thread.is_starred),
        "threads": [serialize_message_thread(thread, viewer=user, include_messages=False) for thread in threads],
    }


def compose_contact_role_label_for_user(user: User, member_roles: dict[int, str]) -> str:
    member_role = member_roles.get(user.id)
    if member_role:
        return member_role.replace("_", " ").title()
    return "Company contact"


def serialize_message_compose_contact(
    *,
    participant_name: str,
    company_name: str,
    role_label: str,
    participant_user_id: int | None = None,
    source: str,
) -> dict:
    return {
        "participant_name": participant_name,
        "company_name": company_name,
        "role_label": role_label,
        "participant_user_id": participant_user_id,
        "source": source,
    }


def serialize_student_message_compose_contacts(user: User) -> dict:
    contacts_by_key: dict[str, dict] = {}
    threads = list(
        MessageThread.objects.filter(student=user)
        .select_related("participant_user", "participant_user__company")
        .order_by("-updated_at", "-id")
    )

    for thread in threads:
        participant_user_id = thread.participant_user_id
        key = (
            f"user:{participant_user_id}"
            if participant_user_id
            else f"thread:{thread.participant_name}:{thread.company_name}:{thread.role_label}"
        )
        contacts_by_key[key] = serialize_message_compose_contact(
            participant_name=thread.participant_name,
            company_name=message_thread_company_name(thread),
            role_label=message_thread_role_label(thread),
            participant_user_id=participant_user_id,
            source="thread",
        )

    application_company_ids = set(Application.objects.filter(student=user).values_list("company_id", flat=True))
    interview_company_ids = set(Interview.objects.filter(student=user).values_list("company_id", flat=True))
    company_ids = application_company_ids | interview_company_ids

    if company_ids:
        member_roles = {
            member.user_id: member.role
            for member in CompanyMember.objects.filter(company_id__in=company_ids).only("user_id", "role")
        }
        company_users = list(
            User.objects.filter(role=User.Role.COMPANY, company_id__in=company_ids, is_active=True)
            .select_related("company")
            .order_by("full_name", "id")
        )

        for company_user in company_users:
            if company_user.company is None:
                continue
            key = f"user:{company_user.id}"
            contacts_by_key[key] = serialize_message_compose_contact(
                participant_name=company_user.full_name,
                company_name=company_user.company.name,
                role_label=compose_contact_role_label_for_user(company_user, member_roles),
                participant_user_id=company_user.id,
                source="company_directory",
            )

    contacts = sorted(
        contacts_by_key.values(),
        key=lambda item: (item["participant_name"].lower(), item["company_name"].lower(), item["role_label"].lower()),
    )
    return {
        "student_id": user.id,
        "contact_count": len(contacts),
        "contacts": contacts,
    }


def serialize_company_message_compose_contacts(
    user: User,
    *,
    query: str = "",
    limit: int = MESSAGE_CONTACTS_DEFAULT_LIMIT,
) -> dict:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    contacts_by_key: dict[str, dict] = {}
    candidate_accesses = CandidateReviewAccess.objects.filter(
        company=company,
        is_active=True,
        student__role=User.Role.STUDENT,
        student__is_active=True,
    ).select_related("student")
    if query:
        candidate_accesses = candidate_accesses.filter(student__full_name__icontains=query)
    candidate_accesses = candidate_accesses.order_by("-updated_at", "-id")[:limit]
    for access in candidate_accesses:
        key = f"student:{access.student_id}"
        contacts_by_key[key] = serialize_message_compose_contact(
            participant_name=access.student.full_name or access.student.email,
            company_name=access.source.replace("_", " ").title(),
            role_label="Student",
            participant_user_id=access.student_id,
            source=access.source,
        )

    contacts = sorted(
        contacts_by_key.values(),
        key=lambda item: (item["participant_name"].lower(), item["source"], item["participant_user_id"] or 0),
    )
    return {
        "company_id": company.id,
        "contact_count": len(contacts),
        "contacts": contacts,
    }


def _serialize_paginated_message_threads(*, request, user: User) -> dict:
    page, page_size = parse_pagination_params(request)
    threads = list(
        company_message_threads_queryset(user)
        if user.role == User.Role.COMPANY
        else student_message_threads_queryset(user)
    )
    paged_threads, pagination = paginate_list(threads, page=page, page_size=page_size)
    base_payload = serialize_company_messages(user) if user.role == User.Role.COMPANY else serialize_student_messages(user)
    return {
        **base_payload,
        "threads": [serialize_message_thread(thread, viewer=user, include_messages=False) for thread in paged_threads],
        "pagination": pagination,
    }


def _serialize_paginated_compose_contacts(*, request, payload: dict) -> dict:
    page, page_size = parse_pagination_params(request)
    contacts, pagination = paginate_list(payload["contacts"], page=page, page_size=page_size)
    return {
        **payload,
        "contacts": contacts,
        "pagination": pagination,
    }


def _find_student_compose_contact(user: User, participant_user_id: int) -> dict | None:
    contacts_payload = serialize_student_message_compose_contacts(user)
    return next(
        (contact for contact in contacts_payload["contacts"] if contact["participant_user_id"] == participant_user_id),
        None,
    )


def _find_company_compose_contact(user: User, participant_user_id: int) -> dict | None:
    contacts_payload = serialize_company_message_compose_contacts(user, query="", limit=MESSAGE_CONTACTS_MAX_LIMIT)
    return next(
        (contact for contact in contacts_payload["contacts"] if contact["participant_user_id"] == participant_user_id),
        None,
    )


def refresh_message_thread_activity(thread: MessageThread, message: Message) -> None:
    thread.last_message_preview = message.body[:255]
    thread.last_message_at = message.created_at
    thread.last_message_sender = message.sender

    update_fields = [
        "last_message_preview",
        "last_message_at",
        "last_message_sender",
        "updated_at",
    ]
    if message.sender_id == thread.student_id:
        thread.last_read_at = message.created_at
        update_fields.append("last_read_at")
    if message.sender_id == thread.participant_user_id:
        thread.company_last_read_at = message.created_at
        update_fields.append("company_last_read_at")

    thread.full_clean()
    thread.save(update_fields=update_fields)


def validate_student_message_thread_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    participant_name = payload.get("participant_name")
    if not isinstance(participant_name, str) or not participant_name.strip():
        errors["participant_name"] = ["This field is required."]
    else:
        cleaned["participant_name"] = participant_name.strip()

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        errors["message"] = ["This field is required."]
    else:
        cleaned["message"] = message.strip()

    company_name = payload.get("company_name", "")
    if company_name is None:
        company_name = ""
    if not isinstance(company_name, str):
        errors["company_name"] = ["Company name must be a string."]
    else:
        cleaned["company_name"] = company_name.strip()

    role_label = payload.get("role_label", "")
    if role_label is None:
        role_label = ""
    if not isinstance(role_label, str):
        errors["role_label"] = ["Role label must be a string."]
    else:
        cleaned["role_label"] = role_label.strip()

    participant_user = None
    raw_participant_user_id = payload.get("participant_user_id")
    if raw_participant_user_id not in (None, ""):
        try:
            participant_user = User.objects.select_related("company").get(
                pk=int(raw_participant_user_id),
                role=User.Role.COMPANY,
            )
        except (TypeError, ValueError):
            errors["participant_user_id"] = ["A valid participant_user_id is required."]
        except User.DoesNotExist:
            errors["participant_user_id"] = ["Selected participant user does not exist."]

    category = payload.get("category", MessageThread.Category.APPLICATIONS)
    valid_categories = {choice for choice, _ in MessageThread.Category.choices}
    if category not in valid_categories:
        errors["category"] = ["Category must be one of: applications, interviews, support."]
    else:
        cleaned["category"] = category

    if errors:
        raise ValidationError(errors)

    cleaned["participant_user"] = participant_user
    return cleaned


def validate_student_message_compose_contact_access(user: User, participant_user: User | None) -> None:
    if participant_user is None or participant_user.company_id is None:
        return

    related_company_ids = set(Application.objects.filter(student=user).values_list("company_id", flat=True)) | set(
        Interview.objects.filter(student=user).values_list("company_id", flat=True)
    )
    if participant_user.company_id not in related_company_ids:
        raise ValidationError({"participant_user_id": ["Selected contact is not available for this student."]})


def find_existing_message_thread(user: User, payload: dict) -> MessageThread | None:
    participant_user = payload["participant_user"]
    if participant_user is not None:
        return (
            MessageThread.objects.filter(student=user, participant_user=participant_user)
            .order_by("-updated_at", "-id")
            .first()
        )

    return (
        MessageThread.objects.filter(
            student=user,
            participant_user__isnull=True,
            participant_name=payload["participant_name"],
            company_name=payload["company_name"],
            role_label=payload["role_label"],
        )
        .order_by("-updated_at", "-id")
        .first()
    )


def validate_student_message_payload(payload: dict) -> dict:
    body = payload.get("body")
    if not isinstance(body, str) or not body.strip():
        raise ValidationError({"body": ["This field is required."]})
    return {"body": body.strip()}


def validate_student_message_thread_update_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    if "is_starred" in payload:
        if not isinstance(payload.get("is_starred"), bool):
            errors["is_starred"] = ["This field must be a boolean."]
        else:
            cleaned["is_starred"] = payload["is_starred"]

    if "mark_as_read" in payload:
        if not isinstance(payload.get("mark_as_read"), bool):
            errors["mark_as_read"] = ["This field must be a boolean."]
        else:
            cleaned["mark_as_read"] = payload["mark_as_read"]

    if not cleaned and not errors:
        errors["non_field_errors"] = ["At least one updatable field is required."]

    if errors:
        raise ValidationError(errors)

    return cleaned


def validate_company_message_thread_payload(payload: dict) -> dict:
    cleaned = {}
    errors = {}

    student_user = None
    raw_student_user_id = payload.get("participant_user_id")
    if raw_student_user_id in (None, ""):
        errors["participant_user_id"] = ["This field is required."]
    else:
        try:
            student_user = User.objects.get(pk=int(raw_student_user_id), role=User.Role.STUDENT)
        except (TypeError, ValueError):
            errors["participant_user_id"] = ["A valid participant_user_id is required."]
        except User.DoesNotExist:
            errors["participant_user_id"] = ["Selected student does not exist."]

    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        errors["message"] = ["This field is required."]
    else:
        cleaned["message"] = message.strip()

    category = payload.get("category", MessageThread.Category.APPLICATIONS)
    valid_categories = {choice for choice, _ in MessageThread.Category.choices}
    if category not in valid_categories:
        errors["category"] = ["Category must be one of: applications, interviews, support."]
    else:
        cleaned["category"] = category

    if errors:
        raise ValidationError(errors)

    cleaned["student_user"] = student_user
    return cleaned


def validate_company_message_compose_contact_access(user: User, student_user: User) -> None:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if student_user.role != User.Role.STUDENT or not student_user.is_active:
        raise PermissionDenied("Selected student is not available for company messaging.")

    has_active_candidate_access = CandidateReviewAccess.objects.filter(
        company=company,
        student=student_user,
        is_active=True,
        student__role=User.Role.STUDENT,
        student__is_active=True,
    ).exists()
    if not has_active_candidate_access:
        raise PermissionDenied("Company messaging is limited to students with an approved candidate access context.")


def company_message_thread_role_label(user: User) -> str:
    membership = CompanyMember.objects.filter(company_id=user.company_id, user=user).only("role").first()
    if membership is not None:
        return membership.role.replace("_", " ").title()
    return "Company contact"


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_messages_view(request):
    return success_response(_serialize_paginated_message_threads(request=request, user=request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_messages_view(request):
    return success_response(_serialize_paginated_message_threads(request=request, user=request.user))


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_message_compose_contacts_view(request):
    return success_response(
        _serialize_paginated_compose_contacts(
            request=request,
            payload=serialize_student_message_compose_contacts(request.user),
        )
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_message_compose_contacts_view(request):
    query = request.GET.get("q", "").strip()
    limit = parse_bounded_positive_int(
        request.GET.get("limit"),
        default=MESSAGE_CONTACTS_DEFAULT_LIMIT,
        maximum=MESSAGE_CONTACTS_MAX_LIMIT,
    )
    return success_response(
        _serialize_paginated_compose_contacts(
            request=request,
            payload=serialize_company_message_compose_contacts(request.user, query=query, limit=limit),
        )
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_message_compose_contact_detail_view(request, participant_user_id: int):
    contact = _find_student_compose_contact(request.user, participant_user_id)
    if contact is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested contact was not found.",
            details={"participant_user_id": [str(participant_user_id)]},
            status=404,
        )
    return success_response(contact)


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_message_compose_contact_detail_view(request, participant_user_id: int):
    contact = _find_company_compose_contact(request.user, participant_user_id)
    if contact is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested contact was not found.",
            details={"participant_user_id": [str(participant_user_id)]},
            status=404,
        )
    return success_response(contact)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_message_threads_view(request):
    payload = validate_student_message_thread_payload(parse_json_body(request))
    validate_student_message_compose_contact_access(request.user, payload["participant_user"])

    with transaction.atomic():
        thread = find_existing_message_thread(request.user, payload)
        created = thread is None
        if created:
            thread = MessageThread(
                student=request.user,
                participant_user=payload["participant_user"],
                participant_name=payload["participant_name"],
                company_name=payload["company_name"],
                role_label=payload["role_label"],
                category=payload["category"],
            )
            thread.full_clean()
            thread.save()

        message = Message(
            thread=thread,
            sender=request.user,
            sender_name=request.user.full_name,
            body=payload["message"],
            delivery_status=Message.DeliveryStatus.SENT,
        )
        message.full_clean()
        message.save()
        refresh_message_thread_activity(thread, message)

    serialized_thread = student_message_threads_queryset(request.user, include_messages=True).filter(pk=thread.id).first()
    return success_response(serialize_message_thread(serialized_thread, viewer=request.user), status=201 if created else 200)


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_message_threads_view(request):
    payload = validate_company_message_thread_payload(parse_json_body(request))
    validate_company_message_compose_contact_access(request.user, payload["student_user"])

    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    with transaction.atomic():
        thread = (
            MessageThread.objects.filter(student=payload["student_user"], participant_user=request.user)
            .order_by("-updated_at", "-id")
            .first()
        )
        created = thread is None
        if created:
            thread = MessageThread(
                student=payload["student_user"],
                participant_user=request.user,
                participant_name=request.user.full_name,
                company_name=company.name,
                role_label=company_message_thread_role_label(request.user),
                category=payload["category"],
            )
            thread.full_clean()
            thread.save()

        message = Message(
            thread=thread,
            sender=request.user,
            sender_name=request.user.full_name,
            body=payload["message"],
            delivery_status=Message.DeliveryStatus.SENT,
        )
        message.full_clean()
        message.save()
        refresh_message_thread_activity(thread, message)

    serialized_thread = company_message_threads_queryset(request.user, include_messages=True).filter(pk=thread.id).first()
    return success_response(serialize_message_thread(serialized_thread, viewer=request.user), status=201 if created else 200)


@api_endpoint(["GET", "PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_message_thread_detail_view(request, thread_id: int):
    thread = student_message_threads_queryset(request.user, include_messages=request.method == "GET").filter(pk=thread_id).first()
    if thread is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested message thread was not found.",
            details={"thread_id": [str(thread_id)]},
            status=404,
        )

    if request.method == "GET":
        return success_response(serialize_message_thread(thread, viewer=request.user))

    if request.method == "DELETE":
        thread.delete()
        return success_response({"thread_id": thread_id, "deleted": True})

    payload = validate_student_message_thread_update_payload(parse_json_body(request))
    update_fields = []

    if "is_starred" in payload:
        thread.is_starred = payload["is_starred"]
        update_fields.append("is_starred")

    if payload.get("mark_as_read"):
        thread.last_read_at = timezone.now()
        update_fields.append("last_read_at")

    if update_fields:
        thread.full_clean()
        thread.save(update_fields=[*update_fields, "updated_at"])

    serialized_thread = student_message_threads_queryset(request.user, include_messages=True).filter(pk=thread.id).first()
    return success_response(serialize_message_thread(serialized_thread, viewer=request.user))


@api_endpoint(["GET", "PUT", "DELETE"], authentication_required=True, roles=[User.Role.COMPANY])
def company_message_thread_detail_view(request, thread_id: int):
    thread = company_message_threads_queryset(request.user, include_messages=request.method == "GET").filter(pk=thread_id).first()
    if thread is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested message thread was not found.",
            details={"thread_id": [str(thread_id)]},
            status=404,
        )

    if request.method == "GET":
        return success_response(serialize_message_thread(thread, viewer=request.user))

    if request.method == "DELETE":
        thread.delete()
        return success_response({"thread_id": thread_id, "deleted": True})

    payload = validate_student_message_thread_update_payload(parse_json_body(request))
    update_fields = []

    if "is_starred" in payload:
        thread.is_starred = payload["is_starred"]
        update_fields.append("is_starred")

    if payload.get("mark_as_read"):
        thread.company_last_read_at = timezone.now()
        update_fields.append("company_last_read_at")

    if update_fields:
        thread.full_clean()
        thread.save(update_fields=[*update_fields, "updated_at"])

    serialized_thread = company_message_threads_queryset(request.user, include_messages=True).filter(pk=thread.id).first()
    return success_response(serialize_message_thread(serialized_thread, viewer=request.user))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_message_thread_messages_view(request, thread_id: int):
    thread = MessageThread.objects.filter(student=request.user, pk=thread_id).first()
    if thread is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested message thread was not found.",
            details={"thread_id": [str(thread_id)]},
            status=404,
        )

    payload = validate_student_message_payload(parse_json_body(request))

    with transaction.atomic():
        message = Message(
            thread=thread,
            sender=request.user,
            sender_name=request.user.full_name,
            body=payload["body"],
            delivery_status=Message.DeliveryStatus.SENT,
        )
        message.full_clean()
        message.save()
        refresh_message_thread_activity(thread, message)

    serialized_thread = student_message_threads_queryset(request.user, include_messages=True).filter(pk=thread.id).first()
    return success_response(serialize_message_thread(serialized_thread, viewer=request.user))


@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.COMPANY])
def company_message_thread_messages_view(request, thread_id: int):
    thread = company_message_threads_queryset(request.user).filter(pk=thread_id).first()
    if thread is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested message thread was not found.",
            details={"thread_id": [str(thread_id)]},
            status=404,
        )

    payload = validate_student_message_payload(parse_json_body(request))

    with transaction.atomic():
        message = Message(
            thread=thread,
            sender=request.user,
            sender_name=request.user.full_name,
            body=payload["body"],
            delivery_status=Message.DeliveryStatus.SENT,
        )
        message.full_clean()
        message.save()
        refresh_message_thread_activity(thread, message)

    serialized_thread = company_message_threads_queryset(request.user, include_messages=True).filter(pk=thread.id).first()
    return success_response(serialize_message_thread(serialized_thread, viewer=request.user))
