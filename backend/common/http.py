import json
from json import JSONDecodeError

from django.core.exceptions import ValidationError
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token


def get_request_id(request: HttpRequest) -> str:
    return getattr(request, "request_id", "req_unknown")


def success_response(data: dict | list, *, status: int = 200, meta: dict | None = None) -> JsonResponse:
    payload: dict = {"data": data}
    if meta is not None:
        payload["meta"] = meta
    return JsonResponse(payload, status=status)


def error_response(
    request: HttpRequest,
    code: str,
    message: str,
    *,
    details: dict | None = None,
    status: int = 400,
) -> JsonResponse:
    return JsonResponse(
        {
            "error": {
                "code": code,
                "message": message,
                "details": details or {},
                "request_id": get_request_id(request),
            }
        },
        status=status,
    )


def parse_json_body(request: HttpRequest) -> dict:
    if not request.body:
        return {}

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except JSONDecodeError as exc:
        raise ValidationError({"body": ["Request body must be valid JSON."]}) from exc

    if not isinstance(payload, dict):
        raise ValidationError({"body": ["JSON request body must be an object."]})

    return payload


def validation_error_details(exc: ValidationError) -> dict:
    if hasattr(exc, "message_dict"):
        return exc.message_dict
    if hasattr(exc, "messages"):
        return {"non_field_errors": list(exc.messages)}
    return {"non_field_errors": [str(exc)]}


def csrf_response_payload(request: HttpRequest) -> dict:
    return {"csrf_token": get_token(request)}
