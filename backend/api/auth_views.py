from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from common.auth_tokens import issue_auth_tokens, user_from_token
from common.decorators import api_endpoint
from common.http import csrf_response_payload, error_response, parse_json_body, success_response
from services.security import SecurityManager, client_ip_from_request
from users.models import Company, StudentProfile, User


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
    errors = {}
    for field in ("role", "email", "password", "name"):
        if not payload.get(field):
            errors[field] = ["This field is required."]

    role = payload.get("role")
    if role and role not in {User.Role.STUDENT, User.Role.COMPANY}:
        errors["role"] = ["Role must be one of: student, company."]

    if role == User.Role.COMPANY and not payload.get("company_name"):
        errors["company_name"] = ["This field is required when signing up as a company user."]

    if errors:
        raise ValidationError(errors)


def serialize_auth_response(request, user: User) -> dict:
    return {
        **serialize_user(user),
        "csrf_token": get_token(request),
        **issue_auth_tokens(user),
    }


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


@csrf_exempt
@api_endpoint(["POST"])
def signup_view(request):
    payload = parse_json_body(request)
    validate_signup_payload(payload)
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
            company = Company.objects.create(name=payload["company_name"].strip())

        user = User.objects.create_user(
            email=email,
            password=payload["password"],
            full_name=payload["name"].strip(),
            role=payload["role"],
            company=company,
        )
        if payload["role"] == User.Role.STUDENT:
            StudentProfile.objects.create(user=user)

    login(request, user)
    return success_response(serialize_auth_response(request, user), status=201)


@csrf_exempt
@api_endpoint(["POST"])
def login_view(request):
    payload = parse_json_body(request)
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    role = payload.get("role", "")
    client_ip = client_ip_from_request(request)

    if not email or not password or not role:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={
                "email": ["This field is required."] if not email else [],
                "password": ["This field is required."] if not password else [],
                "role": ["This field is required."] if not role else [],
            },
            status=400,
        )

    if role not in {User.Role.STUDENT, User.Role.COMPANY, User.Role.ADMIN}:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={"role": ["Role must be one of: student, company, admin."]},
            status=400,
        )

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

    if user.role != role:
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
    return success_response(serialize_auth_response(request, user))


@csrf_exempt
@api_endpoint(["POST"])
def refresh_view(request):
    payload = parse_json_body(request)
    refresh_token = payload.get("refresh_token", "")
    if not refresh_token:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={"refresh_token": ["This field is required."]},
            status=400,
        )

    user = user_from_token(refresh_token, expected_type="refresh")
    if user is None:
        return error_response(
            request,
            "INVALID_REFRESH_TOKEN",
            "The refresh token is invalid or has expired.",
            status=401,
        )

    return success_response(serialize_auth_response(request, user))


@api_endpoint(["POST"], authentication_required=True)
def logout_view(request):
    logout(request)
    return success_response({"message": "Logged out successfully."})


@api_endpoint(["POST"], authentication_required=True)
def password_change_view(request):
    payload = parse_json_body(request)
    current_password = payload.get("current_password", "")
    new_password = payload.get("new_password", "")

    if not current_password or not new_password:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={
                "current_password": ["This field is required."] if not current_password else [],
                "new_password": ["This field is required."] if not new_password else [],
            },
            status=400,
        )

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
