from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings

from users.models import User

ALGORITHM = "HS256"
ISSUER = "softlearn-api"


def bearer_token_from_request(request) -> str | None:
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return None
    token = authorization[7:].strip()
    return token or None


def _token_expiration(seconds: int) -> datetime:
    return datetime.now(timezone.utc) + timedelta(seconds=seconds)


def _build_token(user: User, *, token_type: str, lifetime_seconds: int) -> str:
    issued_at = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.pk),
        "role": user.role,
        "type": token_type,
        "iss": ISSUER,
        "iat": issued_at,
        "exp": _token_expiration(lifetime_seconds),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def issue_auth_tokens(user: User) -> dict[str, str]:
    return {
        "access_token": _build_token(
            user,
            token_type="access",
            lifetime_seconds=settings.AUTH_ACCESS_TOKEN_LIFETIME_SECONDS,
        ),
        "refresh_token": _build_token(
            user,
            token_type="refresh",
            lifetime_seconds=settings.AUTH_REFRESH_TOKEN_LIFETIME_SECONDS,
        ),
    }


def _decode_token(token: str, *, expected_type: str) -> dict:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[ALGORITHM],
        issuer=ISSUER,
        options={"require": ["exp", "iat", "iss", "sub", "type"]},
    )
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"Expected a {expected_type} token.")
    return payload


def user_from_token(token: str | None, *, expected_type: str = "access") -> User | None:
    if not token:
        return None
    try:
        payload = _decode_token(token, expected_type=expected_type)
    except jwt.PyJWTError:
        return None

    return (
        User.objects.select_related("company")
        .filter(pk=payload["sub"], role=payload.get("role"), is_active=True)
        .first()
    )
