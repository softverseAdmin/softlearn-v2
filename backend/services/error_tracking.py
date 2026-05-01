import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from django.conf import settings
from typing import Optional, Dict, Any
from common.models import ErrorReport
from common.middleware import RequestIDMiddleware
import traceback
import logging
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class ErrorTracker:
    """Service for error tracking and aggregation"""
    
    initialized = False
    
    @staticmethod
    def initialize():
        """Initialize Sentry SDK"""
        if ErrorTracker.initialized:
            return
        
        sentry_dsn = settings.SENTRY_DSN if hasattr(settings, 'SENTRY_DSN') else None
        
        if not sentry_dsn:
            logger.warning("SENTRY_DSN not configured, error tracking disabled")
            ErrorTracker.initialized = True
            return
        
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                DjangoIntegration(),
                LoggingIntegration(
                    level=logging.INFO,
                    event_level=logging.ERROR,
                ),
            ],
            traces_sample_rate=0.1,  # 10% of transactions
            send_default_pii=False,
            environment=settings.ENVIRONMENT if hasattr(settings, 'ENVIRONMENT') else 'production',
            debug=settings.DEBUG,
        )
        
        ErrorTracker.initialized = True
    
    @staticmethod
    def capture_exception(
        exception: Exception,
        request_id: Optional[str] = None,
        user_id: Optional[int] = None,
        request_method: Optional[str] = None,
        request_path: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ErrorReport:
        """Capture and track an exception"""
        
        error_type = type(exception).__name__
        error_message = str(exception)
        stack_trace = traceback.format_exc()
        
        # Get or create error report
        try:
            error_report = ErrorReport.objects.get(
                error_type=error_type,
                error_message=error_message,
                is_resolved=False,
            )
            error_report.increment()
        except ErrorReport.DoesNotExist:
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass
            
            error_report = ErrorReport.objects.create(
                error_type=error_type,
                error_message=error_message,
                stack_trace=stack_trace,
                request_id=request_id,
                user=user,
                request_method=request_method,
                request_path=request_path,
                environment=settings.ENVIRONMENT if hasattr(settings, 'ENVIRONMENT') else 'production',
                metadata=metadata or {},
            )
        
        # Also capture in Sentry if configured
        try:
            sentry_sdk.capture_exception(exception)
        except Exception as e:
            logger.error(f"Failed to capture exception in Sentry: {e}")
        
        return error_report
    
    @staticmethod
    def set_user_context(user_id: Optional[int] = None, user_email: Optional[str] = None):
        """Set user context for error reporting"""
        if user_id or user_email:
            sentry_sdk.set_user({
                'id': user_id,
                'email': user_email,
            })
    
    @staticmethod
    def set_tag(key: str, value: str):
        """Set a tag for error context"""
        sentry_sdk.set_tag(key, value)
    
    @staticmethod
    def get_error_statistics() -> Dict[str, Any]:
        """Get error statistics and patterns"""
        from django.db.models import Count, Q
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        
        total_errors = ErrorReport.objects.count()
        unresolved_errors = ErrorReport.objects.filter(is_resolved=False).count()
        errors_last_24h = ErrorReport.objects.filter(last_occurrence__gte=last_24h).count()
        
        top_errors = ErrorReport.objects.values('error_type').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        most_affected_users = ErrorReport.objects.filter(
            user__isnull=False
        ).values('user').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return {
            'total_errors': total_errors,
            'unresolved_errors': unresolved_errors,
            'errors_last_24h': errors_last_24h,
            'top_errors': list(top_errors),
            'most_affected_users': list(most_affected_users),
        }


class ErrorReportingMiddleware:
    """Middleware to automatically capture unhandled exceptions"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        ErrorTracker.initialize()
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            # Capture the exception
            request_id = getattr(request, 'request_id', None)
            user_id = request.user.id if request.user.is_authenticated else None
            
            ErrorTracker.capture_exception(
                e,
                request_id=request_id,
                user_id=user_id,
                request_method=request.method,
                request_path=request.path,
                metadata={
                    'client_ip': self._get_client_ip(request),
                },
            )
            
            # Re-raise the exception
            raise
    
    @staticmethod
    def _get_client_ip(request) -> str:
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')
