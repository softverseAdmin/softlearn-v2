from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

from common.decorators import api_endpoint
from common.http import csrf_response_payload, error_response, parse_json_body, success_response
from users.models import Company, Skill, StudentProfile, StudentSkill, User


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


def get_student_profile(user: User) -> StudentProfile:
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    return profile


def serialize_student_profile(user: User) -> dict:
    profile = get_student_profile(user)
    return {
        "student_id": user.id,
        "name": user.full_name,
        "desired_job_type": profile.desired_job_type,
        "desired_work_location": profile.desired_work_location,
        "japanese_level": profile.japanese_level,
        "english_level": profile.english_level,
        "profile_complete": profile.profile_complete,
    }


def serialize_skill(skill: Skill) -> dict:
    return {
        "id": skill.id,
        "name": skill.name,
        "slug": skill.slug,
    }


def serialize_student_skill(student_skill: StudentSkill) -> dict:
    return {
        "id": student_skill.id,
        "skill_id": student_skill.skill_id,
        "skill_name": student_skill.skill.name,
        "proficiency_level": student_skill.proficiency_level,
    }


def serialize_student_skills(user: User) -> dict:
    selected_skills = list(
        StudentSkill.objects.filter(student=user)
        .select_related("skill")
        .order_by("skill__name")
    )
    available_skills = list(Skill.objects.order_by("name"))
    return {
        "skills": [serialize_student_skill(student_skill) for student_skill in selected_skills],
        "available_skills": [serialize_skill(skill) for skill in available_skills],
        "skill_count": len(selected_skills),
    }


def serialize_company_profile(user: User) -> dict:
    company = user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    return {
        "company_id": company.id,
        "name": company.name,
        "description": company.description,
        "profile_complete": bool(company.name.strip() and company.description.strip()),
    }


def validate_student_profile_payload(payload: dict) -> dict:
    cleaned = {
        "name": str(payload.get("name", "")).strip(),
        "desired_job_type": str(payload.get("desired_job_type", "")).strip(),
        "desired_work_location": str(payload.get("desired_work_location", "")).strip(),
        "japanese_level": str(payload.get("japanese_level", "")).strip(),
        "english_level": str(payload.get("english_level", "")).strip(),
    }

    errors = {}
    if not cleaned["name"]:
        errors["name"] = ["This field is required."]

    if errors:
        raise ValidationError(errors)

    return cleaned


def validate_company_profile_payload(payload: dict) -> dict:
    cleaned = {
        "name": str(payload.get("name", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
    }
    if not cleaned["name"]:
        raise ValidationError({"name": ["This field is required."]})
    return cleaned


def validate_student_skill_payload(payload: dict) -> dict:
    cleaned_proficiency = str(payload.get("proficiency_level", "")).strip().lower()
    raw_skill_id = payload.get("skill_id")
    errors = {}
    skill = None

    if raw_skill_id in (None, ""):
        errors["skill_id"] = ["This field is required."]
    else:
        try:
            skill = Skill.objects.get(pk=int(raw_skill_id))
        except (TypeError, ValueError):
            errors["skill_id"] = ["A valid skill_id is required."]
        except Skill.DoesNotExist:
            errors["skill_id"] = ["Selected skill does not exist."]

    if not cleaned_proficiency:
        errors["proficiency_level"] = ["This field is required."]
    elif cleaned_proficiency not in StudentSkill.Proficiency.values:
        errors["proficiency_level"] = [
            f"Proficiency level must be one of: {', '.join(StudentSkill.Proficiency.values)}."
        ]

    if errors:
        raise ValidationError(errors)

    return {
        "skill": skill,
        "proficiency_level": cleaned_proficiency,
    }


@api_endpoint(["GET"])
def health_view(request):
    return success_response({"status": "ok", "request_id": request.request_id})


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
    return success_response({**serialize_user(user), "csrf_token": get_token(request)}, status=201)


@api_endpoint(["POST"])
def login_view(request):
    payload = parse_json_body(request)
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "The request data is invalid.",
            details={
                "email": ["This field is required."] if not email else [],
                "password": ["This field is required."] if not password else [],
            },
            status=400,
        )

    user = authenticate(request, email=email, password=password)
    if user is None:
        return error_response(
            request,
            "INVALID_CREDENTIALS",
            "Email or password is incorrect.",
            status=401,
        )

    login(request, user)
    return success_response({**serialize_user(user), "csrf_token": get_token(request)})


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


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_profile_view(request):
    if request.method == "GET":
        return success_response(serialize_student_profile(request.user))

    payload = validate_student_profile_payload(parse_json_body(request))
    profile = get_student_profile(request.user)

    request.user.full_name = payload["name"]
    request.user.save(update_fields=["full_name"])
    profile.desired_job_type = payload["desired_job_type"]
    profile.desired_work_location = payload["desired_work_location"]
    profile.japanese_level = payload["japanese_level"]
    profile.english_level = payload["english_level"]
    profile.save(
        update_fields=[
            "desired_job_type",
            "desired_work_location",
            "japanese_level",
            "english_level",
            "updated_at",
        ]
    )

    return success_response(serialize_student_profile(request.user))


@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.COMPANY])
def company_profile_view(request):
    company = request.user.company
    if company is None:
        raise ValidationError({"company": ["Company context is required for company users."]})

    if request.method == "GET":
        return success_response(serialize_company_profile(request.user))

    payload = validate_company_profile_payload(parse_json_body(request))
    company.name = payload["name"]
    company.description = payload["description"]
    company.full_clean()
    company.save(update_fields=["name", "description", "updated_at"])

    return success_response(serialize_company_profile(request.user))


@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skills_view(request):
    if request.method == "GET":
        return success_response(serialize_student_skills(request.user))

    payload = validate_student_skill_payload(parse_json_body(request))
    if StudentSkill.objects.filter(student=request.user, skill=payload["skill"]).exists():
        raise ValidationError({"skill_id": ["This skill is already added to your profile."]})

    student_skill = StudentSkill(
        student=request.user,
        skill=payload["skill"],
        proficiency_level=payload["proficiency_level"],
    )
    student_skill.full_clean()
    student_skill.save()

    return success_response(serialize_student_skills(request.user), status=201)


@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skill_detail_view(request, student_skill_id: int):
    student_skill = (
        StudentSkill.objects.filter(student=request.user, pk=student_skill_id)
        .select_related("skill")
        .first()
    )
    if student_skill is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested student skill was not found.",
            details={"student_skill_id": [str(student_skill_id)]},
            status=404,
        )

    if request.method == "DELETE":
        student_skill.delete()
        return success_response(serialize_student_skills(request.user))

    payload = validate_student_skill_payload(parse_json_body(request))
    duplicate_skill = StudentSkill.objects.filter(student=request.user, skill=payload["skill"]).exclude(
        pk=student_skill.pk
    )
    if duplicate_skill.exists():
        raise ValidationError({"skill_id": ["This skill is already added to your profile."]})

    student_skill.skill = payload["skill"]
    student_skill.proficiency_level = payload["proficiency_level"]
    student_skill.full_clean()
    student_skill.save(update_fields=["skill", "proficiency_level", "updated_at"])

    return success_response(serialize_student_skills(request.user))


@api_endpoint(["GET"], authentication_required=True)
def access_me_view(request):
    return success_response(
        {
            "user": serialize_user(request.user),
            "request_id": request.request_id,
        }
    )


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_access_view(request):
    return success_response({"message": "Student access granted.", "role": request.user.role})


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.COMPANY])
def company_access_view(request):
    return success_response({"message": "Company access granted.", "role": request.user.role})


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.ADMIN])
def admin_access_view(request):
    return success_response({"message": "Admin access granted.", "role": request.user.role})
