import logging
from collections.abc import Callable, Iterable
from functools import wraps

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import HttpRequest, HttpResponse

from common.http import error_response, validation_error_details

logger = logging.getLogger(__name__)


def api_endpoint(
    methods: Iterable[str],
    *,
    authentication_required: bool = False,
    roles: Iterable[str] | None = None,
) -> Callable:
    allowed_methods = {method.upper() for method in methods}
    allowed_roles = set(roles or [])

    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        def wrapped(request: HttpRequest, *args, **kwargs) -> HttpResponse:
            if request.method.upper() not in allowed_methods:
                return error_response(
                    request,
                    "METHOD_NOT_ALLOWED",
                    f"Method {request.method} is not allowed for this endpoint.",
                    details={"allowed_methods": sorted(allowed_methods)},
                    status=405,
                )

            if authentication_required and not request.user.is_authenticated:
                return error_response(
                    request,
                    "AUTHENTICATION_REQUIRED",
                    "Authentication is required for this endpoint.",
                    status=401,
                )

            if allowed_roles:
                user_role = getattr(request.user, "role", None)
                if user_role not in allowed_roles:
                    return error_response(
                        request,
                        "PERMISSION_DENIED",
                        "You do not have permission to access this endpoint.",
                        details={"allowed_roles": sorted(allowed_roles)},
                        status=403,
                    )

            try:
                return view_func(request, *args, **kwargs)
            except ValidationError as exc:
                return error_response(
                    request,
                    "VALIDATION_ERROR",
                    "The request data is invalid.",
                    details=validation_error_details(exc),
                    status=400,
                )
            except PermissionDenied as exc:
                return error_response(
                    request,
                    "PERMISSION_DENIED",
                    str(exc) or "You do not have permission to perform this action.",
                    status=403,
                )
            except Exception as exc:
                try:
                    from services.error_tracking import ErrorTracker

                    user_id = request.user.id if request.user.is_authenticated else None
                    ErrorTracker.capture_exception(
                        exc,
                        request_id=getattr(request, "request_id", None),
                        user_id=user_id,
                        request_method=request.method,
                        request_path=request.path,
                    )
                except Exception:
                    logger.exception(
                        "Failed to capture unexpected API exception.",
                        extra={
                            "request_id": getattr(request, "request_id", None),
                            "request_method": request.method,
                            "request_path": request.path,
                        },
                    )

                return error_response(
                    request,
                    "INTERNAL_SERVER_ERROR",
                    "Unable to complete this request right now.",
                    status=500,
                )

        return wrapped

    return decorator
