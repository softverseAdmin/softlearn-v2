import os
from pathlib import Path
import sys
import warnings

from django.core.exceptions import ImproperlyConfigured

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent


def load_environment_files() -> None:
    env_root = BASE_DIR.parent
    load_dotenv(env_root / ".env", override=False)
    load_dotenv(env_root / ".env.local", override=True)

    environment = (os.getenv("ENVIRONMENT", "development") or "development").strip().lower()
    load_dotenv(env_root / f".env.{environment}", override=True)
    load_dotenv(env_root / f".env.{environment}.local", override=True)


load_environment_files()


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: list[str]) -> list[str]:
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


def env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


DEFAULT_SECRET_KEY = "change-me-before-production"
NON_DELIVERING_EMAIL_BACKENDS = {
    "django.core.mail.backends.console.EmailBackend",
    "django.core.mail.backends.dummy.EmailBackend",
    "django.core.mail.backends.filebased.EmailBackend",
    "django.core.mail.backends.locmem.EmailBackend",
}


def validate_production_configuration(
    *,
    postgres_db: str | None,
    email_backend: str,
    is_production: bool | None = None,
) -> None:
    if is_production is None:
        is_production = IS_PRODUCTION

    if not is_production:
        return

    if not postgres_db:
        raise ImproperlyConfigured("POSTGRES_DB must be set when ENVIRONMENT is production.")

    if email_backend in NON_DELIVERING_EMAIL_BACKENDS:
        raise ImproperlyConfigured(
            "DJANGO_EMAIL_BACKEND must point to a real delivery backend when ENVIRONMENT is production."
        )


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", DEFAULT_SECRET_KEY)
DEBUG = env_bool("DJANGO_DEBUG", env_bool("DEBUG", True))
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", ["127.0.0.1", "localhost"])
ENVIRONMENT = (os.getenv("ENVIRONMENT", "development") or "development").strip().lower()
TESTING = len(sys.argv) > 1 and sys.argv[1] == 'test'
IS_PRODUCTION = ENVIRONMENT == "production"
DEFAULT_FRONTEND_ORIGINS = (
    ["https://softlearn-v2.vercel.app"]
    if IS_PRODUCTION
    else ["http://localhost:5173", "http://127.0.0.1:5173"]
)
TRUSTED_PROXY_IPS = env_list("DJANGO_TRUSTED_PROXY_IPS", [])

if not DEBUG and SECRET_KEY == DEFAULT_SECRET_KEY:
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false.")

if IS_PRODUCTION and set(ALLOWED_HOSTS).issubset({"127.0.0.1", "localhost"}):
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS must include real production hosts.")

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "common",
    "users.apps.UsersConfig",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "common.middleware.RequestIDMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "services.logging.RequestLoggingMiddleware",
    "services.error_tracking.ErrorReportingMiddleware",
    "services.security.SecurityHeadersMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"

postgres_db = os.getenv("POSTGRES_DB")

if postgres_db:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": postgres_db,
            "USER": os.getenv("POSTGRES_USER", ""),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", ""),
            "HOST": os.getenv("POSTGRES_HOST", "127.0.0.1"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"

USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = os.getenv("DJANGO_MEDIA_URL", "/media/")
MEDIA_ROOT = BASE_DIR / os.getenv("DJANGO_MEDIA_ROOT", "media")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "users.User"
APPEND_SLASH = False

CORS_ALLOWED_ORIGINS = env_list(
    "DJANGO_CORS_ALLOWED_ORIGINS",
    DEFAULT_FRONTEND_ORIGINS,
)
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    DEFAULT_FRONTEND_ORIGINS,
)
CSRF_FAILURE_VIEW = "common.views.csrf_failure"

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", IS_PRODUCTION)
CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", IS_PRODUCTION)
SESSION_COOKIE_SAMESITE = os.getenv(
    "DJANGO_SESSION_COOKIE_SAMESITE",
    "None" if SESSION_COOKIE_SECURE else "Lax",
)
CSRF_COOKIE_SAMESITE = os.getenv(
    "DJANGO_CSRF_COOKIE_SAMESITE",
    "None" if CSRF_COOKIE_SECURE else "Lax",
)

if IS_PRODUCTION:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    USE_X_FORWARDED_HOST = True

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

DEFAULT_FROM_EMAIL = os.getenv(
    "DJANGO_DEFAULT_FROM_EMAIL",
    os.getenv("SENDGRID_FROM_EMAIL", "noreply@softlearn.io"),
)
EMAIL_BACKEND = os.getenv(
    "DJANGO_EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.dummy.EmailBackend",
)
FRONTEND_URL = os.getenv("FRONTEND_URL", DEFAULT_FRONTEND_ORIGINS[0])
validate_production_configuration(postgres_db=postgres_db, email_backend=EMAIL_BACKEND)

# Caching Configuration
cache_location = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/1")
ENABLE_REDIS_CACHE = env_bool("DJANGO_ENABLE_REDIS_CACHE", IS_PRODUCTION and bool(os.getenv("REDIS_URL")))

if ENABLE_REDIS_CACHE:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": cache_location,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "CONNECTION_POOL_KWARGS": {
                    "max_connections": 50,
                    "retry_on_timeout": True,
                },
                "SOCKET_CONNECT_TIMEOUT": 5,
                "SOCKET_TIMEOUT": 5,
            },
            "KEY_PREFIX": "softlearn",
            "TIMEOUT": 300,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "softlearn-cache",
            "TIMEOUT": 300,
        }
    }
    if IS_PRODUCTION:
        raise ImproperlyConfigured(
            "Production requires a shared cache backend. Set DJANGO_ENABLE_REDIS_CACHE=true "
            "and configure REDIS_URL before booting the application."
        )

ENABLE_RATE_LIMITING = env_bool(
    "DJANGO_ENABLE_RATE_LIMITING",
    not DEBUG and not TESTING and ENABLE_REDIS_CACHE,
)
RATE_LIMITING_REQUIRES_SHARED_CACHE = env_bool(
    "DJANGO_RATE_LIMITING_REQUIRES_SHARED_CACHE",
    IS_PRODUCTION,
)

if ENABLE_RATE_LIMITING and RATE_LIMITING_REQUIRES_SHARED_CACHE and not ENABLE_REDIS_CACHE:
    raise ImproperlyConfigured(
        "DJANGO_ENABLE_RATE_LIMITING requires a shared cache backend. "
        "Enable Redis caching or set DJANGO_RATE_LIMITING_REQUIRES_SHARED_CACHE=false explicitly."
    )

if ENABLE_RATE_LIMITING:
    MIDDLEWARE.append("services.security.RateLimitingMiddleware")

# Async jobs configuration
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://127.0.0.1:6379/2"))
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)
CELERY_TASK_ALWAYS_EAGER = env_bool("CELERY_TASK_ALWAYS_EAGER", TESTING)
CELERY_TASK_EAGER_PROPAGATES = env_bool("CELERY_TASK_EAGER_PROPAGATES", TESTING)
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
MATCHING_ASYNC_REFRESH_ENABLED = env_bool(
    "MATCHING_ASYNC_REFRESH_ENABLED",
    bool(os.getenv("CELERY_BROKER_URL") or os.getenv("REDIS_URL")),
)
MATCHES_SNAPSHOT_TTL_SECONDS = env_int("MATCHES_SNAPSHOT_TTL_SECONDS", 300)

# Sentry Configuration
SENTRY_DSN = os.getenv("SENTRY_DSN", "")

# Gemini exam generation configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_EXAM_GENERATION_ENABLED = env_bool("GEMINI_EXAM_GENERATION_ENABLED", False)
GEMINI_EXAM_REQUEST_TIMEOUT_SECONDS = env_int("GEMINI_EXAM_REQUEST_TIMEOUT_SECONDS", 15)
GEMINI_EXAM_MAX_OUTPUT_TOKENS = env_int("GEMINI_EXAM_MAX_OUTPUT_TOKENS", 768)
GEMINI_EXAM_SOURCE_CHAR_LIMIT = env_int("GEMINI_EXAM_SOURCE_CHAR_LIMIT", 4000)
GEMINI_EXAM_DEFAULT_QUESTION_COUNT = env_int("GEMINI_EXAM_DEFAULT_QUESTION_COUNT", 5)
GEMINI_EXAM_FINAL_QUESTION_COUNT = env_int("GEMINI_EXAM_FINAL_QUESTION_COUNT", 15)

# Logging Configuration
LOG_LEVEL = os.getenv("DJANGO_LOG_LEVEL", "INFO")
LOG_AS_JSON = env_bool("DJANGO_LOG_AS_JSON", IS_PRODUCTION)
ENABLE_FILE_LOGGING = env_bool("DJANGO_ENABLE_FILE_LOGGING", not IS_PRODUCTION)
PERSIST_REQUEST_LOGS = env_bool("DJANGO_PERSIST_REQUEST_LOGS", False)
PERSIST_APP_DIAGNOSTIC_LOGS = env_bool("DJANGO_PERSIST_APP_DIAGNOSTIC_LOGS", False)
PERSIST_ERROR_REPORTS = env_bool("DJANGO_PERSIST_ERROR_REPORTS", False)

if ENABLE_FILE_LOGGING:
    os.makedirs(BASE_DIR / "logs", exist_ok=True)

active_log_handlers = ["console"]
if ENABLE_FILE_LOGGING:
    active_log_handlers.append("file")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "request_context": {
            "()": "services.logging.RequestContextFilter",
        },
    },
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "[{levelname}] {message}",
            "style": "{",
        },
        "json": {
            "()": "services.logging.JsonLogFormatter",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json" if LOG_AS_JSON else "verbose",
            "filters": ["request_context"],
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "logs" / "django.log",
            "maxBytes": 1024 * 1024 * 10,  # 10 MB
            "backupCount": 10,
            "formatter": "verbose",
            "filters": ["request_context"],
        },
    },
    "root": {
        "handlers": active_log_handlers,
        "level": LOG_LEVEL,
    },
    "loggers": {
        "django": {
            "handlers": active_log_handlers,
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "services": {
            "handlers": active_log_handlers,
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "frontend": {
            "handlers": active_log_handlers,
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "api": {
            "handlers": active_log_handlers,
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
}
