from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.middleware.csrf import get_token
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie

from api.forms import (
    LoginRequestForm,
    PasswordChangeRequestForm,
    PasswordResetConfirmRequestForm,
    PasswordResetRequestForm,
    SignupRequestForm,
)
from common.decorators import api_endpoint
from common.http import csrf_response_payload, error_response, parse_json_form, success_response
from services.email import get_email_service
from services.security import SecurityManager, client_ip_from_request
from users.models import Company, StudentProfile, TeacherProfile, User


def serialize_user(user: User) -> dict:
    return {
        "user_id": user.id,
        "role": user.role,
        "email": user.email,
        "name": user.full_name,
        "authenticated": True,
        "company_id": user.company_id,
    }


def validate_signup_payload(payload: dict) -> None:
    form = SignupRequestForm(payload)
    if not form.is_valid():
        raise ValidationError(form.errors)


def build_password_reset_url(user: User) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"


@ensure_csrf_cookie
@api_endpoint(["GET"])
def csrf_view(request):
    return success_response(csrf_response_payload(request))


@ensure_csrf_cookie
@api_endpoint(["GET"])
def session_view(request):
    if not request.user.is_authenticated:
        return success_response(
            {
                "authenticated": False,
                "user": None,
                "csrf_token": get_token(request),
            }
        )

    return success_response(
        {
            "authenticated": True,
            "user": serialize_user(request.user),
            "csrf_token": get_token(request),
        }
    )


@api_endpoint(["POST"])
def signup_view(request):
    form = parse_json_form(request, SignupRequestForm)
    payload = form.cleaned_data
    validate_password(payload["password"])

    email = payload["email"].strip().lower()
    if User.objects.filter(email__iexact=email).exists():
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={"email": ["A user with this email already exists."]},
            status=400,
        )

    with transaction.atomic():
        company = None
        if payload["role"] == User.Role.COMPANY:
            company = Company.objects.create(name=payload["company_name"])

        user = User.objects.create_user(
            email=email,
            password=payload["password"],
            full_name=payload["name"],
            role=payload["role"],
            company=company,
        )
        if payload["role"] == User.Role.STUDENT:
            StudentProfile.objects.create(user=user)
        if payload["role"] == User.Role.TEACHER:
            TeacherProfile.objects.create(user=user)

    login(request, user)
    return success_response({**serialize_user(user), "csrf_token": get_token(request)}, status=201)


@api_endpoint(["POST"])
def login_view(request):
    form = parse_json_form(request, LoginRequestForm)
    email = form.cleaned_data["email"]
    password = form.cleaned_data["password"]
    role = form.cleaned_data.get("role") or None
    remember_me = form.cleaned_data["remember_me"]
    client_ip = client_ip_from_request(request)

    if SecurityManager.login_is_rate_limited(client_ip, email):
        return error_response(
            request,
            "RATE_LIMITED",
            "Too many failed login attempts. Please try again later.",
            details={
                "scope": "login",
                "retry_after_seconds": SecurityManager.LOGIN_WINDOW_SECONDS,
                "remaining_attempts": 0,
            },
            status=429,
        )

    user = authenticate(request, email=email, password=password)
    if user is None:
        SecurityManager.record_login_failure(client_ip, email)
        return error_response(
            request,
            "INVALID_CREDENTIALS",
            "Email or password is incorrect.",
            details={
                "remaining_attempts": SecurityManager.get_login_rate_limit_remaining(client_ip, email),
            },
            status=401,
        )

    if role is None and user.role != User.Role.ADMIN:
        return error_response(
            request,
            "ROLE_REQUIRED",
            "Select your account type and try again.",
            details={"role": ["Select your account type and try again."]},
            status=400,
        )

    if user.role != role:
        if role is not None:
            SecurityManager.record_login_failure(client_ip, email)
            return error_response(
                request,
                "ROLE_MISMATCH",
                f"This account belongs to the {user.role} workspace. Select the correct account type and try again.",
                details={"role": [f"This account belongs to the {user.role} workspace."]},
                status=403,
            )

    SecurityManager.reset_login_rate_limit(client_ip, email)
    login(request, user)
    request.session.set_expiry(settings.SESSION_COOKIE_AGE if remember_me else 0)
    return success_response({**serialize_user(user), "csrf_token": get_token(request)})


@api_endpoint(["POST"], authentication_required=True)
def logout_view(request):
    logout(request)
    return success_response({"message": "Logged out successfully."})


@api_endpoint(["POST"], authentication_required=True)
def password_change_view(request):
    form = parse_json_form(request, PasswordChangeRequestForm)
    current_password = form.cleaned_data["current_password"]
    new_password = form.cleaned_data["new_password"]

    if not request.user.check_password(current_password):
        return error_response(
            request,
            "INVALID_CREDENTIALS",
            "Current password is incorrect.",
            details={"current_password": ["Current password is incorrect."]},
            status=400,
        )

    validate_password(new_password, request.user)
    request.user.set_password(new_password)
    request.user.save(update_fields=["password"])
    update_session_auth_hash(request, request.user)

    return success_response({"message": "Password updated successfully."})


@api_endpoint(["POST"])
def password_reset_request_view(request):
    form = parse_json_form(request, PasswordResetRequestForm)
    email = form.cleaned_data["email"]
    client_ip = client_ip_from_request(request)

    if not SecurityManager.check_password_reset_rate_limit(client_ip):
        return error_response(
            request,
            "RATE_LIMITED",
            "Too many password reset attempts. Please try again later.",
            details={
                "scope": "password_reset",
                "retry_after_seconds": SecurityManager.PASSWORD_RESET_WINDOW_SECONDS,
            },
            status=429,
        )

    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if user is not None:
        get_email_service().send_password_reset(
            user_email=user.email,
            user_name=user.full_name.strip() or "there",
            reset_url=build_password_reset_url(user),
        )

    return success_response(
        {
            "message": "If an account exists for that email, we have sent a password reset link.",
        }
    )


@api_endpoint(["POST"])
def password_reset_confirm_view(request):
    form = parse_json_form(request, PasswordResetConfirmRequestForm)
    uid = form.cleaned_data["uid"].strip()
    token = form.cleaned_data["token"].strip()
    new_password = form.cleaned_data["new_password"]

    try:
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return error_response(
            request,
            "INVALID_TOKEN",
            "This password reset link is invalid or has expired.",
            details={"token": ["This password reset link is invalid or has expired."]},
            status=400,
        )

    if not default_token_generator.check_token(user, token):
        return error_response(
            request,
            "INVALID_TOKEN",
            "This password reset link is invalid or has expired.",
            details={"token": ["This password reset link is invalid or has expired."]},
            status=400,
        )

    validate_password(new_password, user)
    user.set_password(new_password)
    user.save(update_fields=["password"])

    return success_response({"message": "Password reset successfully. You can now log in with your new password."})
