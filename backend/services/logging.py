import logging
import time
import json
from contextvars import ContextVar
from typing import Any, Optional
from django.utils import timezone
from common.models import ApplicationLogEntry
from django.contrib.auth import get_user_model

User = get_user_model()

# Context variable for storing request ID in async contexts
_request_id_context: ContextVar[Optional[str]] = ContextVar('request_id', default=None)
_user_context: ContextVar[Optional[int]] = ContextVar('user_id', default=None)


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
        request_id: Optional[str] = None,
        user_id: Optional[int] = None,
        request_method: Optional[str] = None,
        request_path: Optional[str] = None,
        response_status: Optional[int] = None,
        duration_ms: Optional[float] = None,
        metadata: Optional[dict] = None,
    ) -> ApplicationLogEntry:
        """Log a structured message to the database"""
        
        # Use context values if not explicitly provided
        request_id = request_id or LogAggregationService.get_request_id()
        user_id = user_id or LogAggregationService.get_user_id()
        
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
        
        # Also log to Python logger
        logger = logging.getLogger(service)
        log_func = getattr(logger, level.lower(), logger.info)
        log_func(f"[{request_id}] {message}", extra={'user_id': user_id})
        
        return entry
    
    @staticmethod
    def debug(service: str, message: str, **kwargs) -> ApplicationLogEntry:
        """Log a debug message"""
        return LogAggregationService.log('DEBUG', service, message, **kwargs)
    
    @staticmethod
    def info(service: str, message: str, **kwargs) -> ApplicationLogEntry:
        """Log an info message"""
        return LogAggregationService.log('INFO', service, message, **kwargs)
    
    @staticmethod
    def warning(service: str, message: str, **kwargs) -> ApplicationLogEntry:
        """Log a warning message"""
        return LogAggregationService.log('WARNING', service, message, **kwargs)
    
    @staticmethod
    def error(service: str, message: str, **kwargs) -> ApplicationLogEntry:
        """Log an error message"""
        return LogAggregationService.log('ERROR', service, message, **kwargs)
    
    @staticmethod
    def critical(service: str, message: str, **kwargs) -> ApplicationLogEntry:
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
                    }
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
