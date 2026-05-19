import uuid

from django.contrib.auth import get_user
from django.middleware.csrf import CsrfViewMiddleware
from django.utils.functional import SimpleLazyObject

from common.auth_tokens import bearer_token_from_request, user_from_token

class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        response = self.get_response(request)
        response["X-Request-ID"] = request.request_id
        return response


class BearerTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = bearer_token_from_request(request)
        request.bearer_token = token
        request.bearer_user = user_from_token(token) if token else None
        if token:
            request._dont_enforce_csrf_checks = True
        return self.get_response(request)


class ApiCsrfViewMiddleware(CsrfViewMiddleware):
    def process_view(self, request, callback, callback_args, callback_kwargs):
        if getattr(request, "bearer_token", None):
            return None
        return super().process_view(request, callback, callback_args, callback_kwargs)


def _resolve_request_user(request):
    bearer_user = getattr(request, "bearer_user", None)
    if bearer_user is not None:
        return bearer_user
    return get_user(request)


class APIAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user = SimpleLazyObject(lambda: _resolve_request_user(request))
        return self.get_response(request)
