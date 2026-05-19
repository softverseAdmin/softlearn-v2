import logging
import time
import json
from datetime import datetime, timezone
from contextvars import ContextVar
from typing import Any, Optional
from django.conf import settings

# Context variable for storing request ID in async contexts
_request_id_context: ContextVar[Optional[str]] = ContextVar('request_id', default=None)
_user_context: ContextVar[Optional[int]] = ContextVar('user_id', default=None)

_STANDARD_LOG_RECORD_ATTRIBUTES = {
    "args",
    "asctime",
    "created",
    "exc_info",
    "exc_text",
    "filename",
    "funcName",
    "levelname",
    "levelno",
    "lineno",
    "module",
    "msecs",
    "message",
    "msg",
    "name",
    "pathname",
    "process",
    "processName",
    "relativeCreated",
    "stack_info",
    "thread",
    "threadName",
}


class RequestContextFilter(logging.Filter):
    """Attach request-scoped context to every emitted log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        if not getattr(record, "request_id", None):
            record.request_id = _request_id_context.get()
        if getattr(record, "user_id", None) is None:
            record.user_id = _user_context.get()
        return True


class JsonLogFormatter(logging.Formatter):
    """Emit structured JSON logs for container/runtime aggregation."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        request_id = getattr(record, "request_id", None)
        user_id = getattr(record, "user_id", None)
        if request_id:
            payload["request_id"] = request_id
        if user_id is not None:
            payload["user_id"] = user_id

        for key, value in record.__dict__.items():
            if key in _STANDARD_LOG_RECORD_ATTRIBUTES or key.startswith("_"):
                continue
            if value is not None:
                payload[key] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        if record.stack_info:
            payload["stack"] = self.formatStack(record.stack_info)

        return json.dumps(payload, default=str)


class RequestIDContextManager:
    """Context manager for request ID tracking in distributed tracing"""
    
    def __init__(self, request_id: str):
        self.request_id = request_id
        self.token = None
    
    def __enter__(self):
        self.token = _request_id_context.set(self.request_id)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.token:
            _request_id_context.reset(self.token)


class LogAggregationService:
    """Service for structured logging and log aggregation"""
    
    LEVELS = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL,
    }
    
    @staticmethod
    def get_request_id() -> Optional[str]:
        """Get current request ID from context"""
        return _request_id_context.get()
    
    @staticmethod
    def get_user_id() -> Optional[int]:
        """Get current user ID from context"""
        return _user_context.get()
    
    @staticmethod
    def log(
        level: str,
        service: str,
        message: str,
        *,
        request_id: Optional[str] = None,
        user_id: Optional[int] = None,
        request_method: Optional[str] = None,
        request_path: Optional[str] = None,
        response_status: Optional[int] = None,
        duration_ms: Optional[float] = None,
        metadata: Optional[dict] = None,
        persist_db: Optional[bool] = None,
    ) -> Any:
        """Log a structured message to the configured sinks."""
        
        # Use context values if not explicitly provided
        request_id = request_id or LogAggregationService.get_request_id()
        user_id = user_id or LogAggregationService.get_user_id()
        
        if persist_db is None:
            persist_db = getattr(settings, "PERSIST_APP_DIAGNOSTIC_LOGS", False)

        entry = None
        if persist_db:
            from django.contrib.auth import get_user_model
            from common.models import ApplicationLogEntry

            User = get_user_model()
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass

            entry = ApplicationLogEntry.objects.create(
                level=level.upper(),
                service=service,
                message=message,
                request_id=request_id,
                user=user,
                request_method=request_method,
                request_path=request_path,
                response_status=response_status,
                duration_ms=duration_ms,
                metadata=metadata or {},
            )

        logger = logging.getLogger(service)
        log_func = getattr(logger, level.lower(), logger.info)
        log_func(
            message,
            extra={
                "service": service,
                "request_id": request_id,
                "user_id": user_id,
                "request_method": request_method,
                "request_path": request_path,
                "response_status": response_status,
                "duration_ms": round(duration_ms, 2) if duration_ms is not None else None,
                "metadata": metadata or {},
            },
        )
        
        return entry
    
    @staticmethod
    def debug(service: str, message: str, **kwargs) -> Any:
        """Log a debug message"""
        return LogAggregationService.log('DEBUG', service, message, **kwargs)
    
    @staticmethod
    def info(service: str, message: str, **kwargs) -> Any:
        """Log an info message"""
        return LogAggregationService.log('INFO', service, message, **kwargs)
    
    @staticmethod
    def warning(service: str, message: str, **kwargs) -> Any:
        """Log a warning message"""
        return LogAggregationService.log('WARNING', service, message, **kwargs)
    
    @staticmethod
    def error(service: str, message: str, **kwargs) -> Any:
        """Log an error message"""
        return LogAggregationService.log('ERROR', service, message, **kwargs)
    
    @staticmethod
    def critical(service: str, message: str, **kwargs) -> Any:
        """Log a critical message"""
        return LogAggregationService.log('CRITICAL', service, message, **kwargs)


class RequestLoggingMiddleware:
    """Middleware to log all HTTP requests and responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Start timing
        start_time = time.time()
        request_id = request.request_id
        user_id = request.user.id if request.user.is_authenticated else None
        
        # Set context
        token = _request_id_context.set(request_id)
        if user_id:
            user_token = _user_context.set(user_id)
        
        try:
            response = self.get_response(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Only log non-static file requests
            if not request.path.startswith('/static/'):
                # Log the request
                LogAggregationService.log(
                    level='INFO',
                    service='api',
                    message=f"{request.method} {request.path}",
                    request_id=request_id,
                    user_id=user_id,
                    request_method=request.method,
                    request_path=request.path,
                    response_status=response.status_code,
                    duration_ms=duration_ms,
                    metadata={
                        'client_ip': self._get_client_ip(request),
                    },
                    persist_db=getattr(settings, "PERSIST_REQUEST_LOGS", False),
                )
            
            return response
        finally:
            # Reset context
            _request_id_context.reset(token)
            if user_id:
                _user_context.reset(user_token)
    
    @staticmethod
    def _get_client_ip(request) -> str:
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


def set_request_context(request_id: str, user_id: Optional[int] = None):
    """Set request context for logging in async tasks"""
    _request_id_context.set(request_id)
    if user_id:
        _user_context.set(user_id)


def get_log_context() -> dict:
    """Get current logging context"""
    return {
        'request_id': LogAggregationService.get_request_id(),
        'user_id': LogAggregationService.get_user_id(),
    }
