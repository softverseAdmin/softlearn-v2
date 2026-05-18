import hashlib
import logging
from typing import Dict, Any, Set
from functools import wraps
from datetime import datetime, timedelta

from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings

from common.http import error_response

logger = logging.getLogger(__name__)


def client_ip_from_request(request) -> str:
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class SecurityManager:
    """Service for security management and rate limiting"""
    
    # Rate limit keys
    LOGIN_ACCOUNT_LIMIT_KEY = 'rate_limit:login:account:{}'
    LOGIN_IP_LIMIT_KEY = 'rate_limit:login:ip:{}'
    API_LIMIT_KEY = 'rate_limit:api:{}'
    SIGNUP_LIMIT_KEY = 'rate_limit:signup:{}'
    
    # Rate limit thresholds
    LOGIN_ACCOUNT_LIMIT = 5  # per 5 minutes per IP/email pair
    LOGIN_IP_LIMIT = 20  # per 5 minutes per IP
    LOGIN_WINDOW_SECONDS = 300
    API_LIMIT = 100  # per minute
    SIGNUP_LIMIT = 1  # per minute per IP
    WHITELIST_IPS: Set[str] = set()
    
    @staticmethod
    def add_whitelist_ip(ip: str):
        """Add IP to admin whitelist"""
        SecurityManager.WHITELIST_IPS.add(ip)
    
    @staticmethod
    def remove_whitelist_ip(ip: str):
        """Remove IP from admin whitelist"""
        SecurityManager.WHITELIST_IPS.discard(ip)
    
    @staticmethod
    def is_ip_whitelisted(ip: str) -> bool:
        """Check if IP is whitelisted"""
        return ip in SecurityManager.WHITELIST_IPS
    
    @staticmethod
    def login_account_identifier(ip: str, email: str) -> str:
        return f"{get_ip_hash(ip)}:{email.strip().lower()}"

    @staticmethod
    def login_ip_identifier(ip: str) -> str:
        return get_ip_hash(ip)

    @staticmethod
    def _get_limit(key_template: str, identifier: str) -> int:
        key = key_template.format(identifier)
        count = cache.get(key, 0)

        return int(count)

    @staticmethod
    def _increment_limit(key_template: str, identifier: str, *, window_seconds: int) -> None:
        key = key_template.format(identifier)
        count = cache.get(key, 0)
        cache.set(key, count + 1, window_seconds)

    @staticmethod
    def _reset_limit(key_template: str, identifier: str) -> None:
        cache.delete(key_template.format(identifier))

    @staticmethod
    def login_is_rate_limited(ip: str, email: str) -> bool:
        account_identifier = SecurityManager.login_account_identifier(ip, email)
        ip_identifier = SecurityManager.login_ip_identifier(ip)
        return (
            SecurityManager._get_limit(SecurityManager.LOGIN_ACCOUNT_LIMIT_KEY, account_identifier) >= SecurityManager.LOGIN_ACCOUNT_LIMIT
            or SecurityManager._get_limit(SecurityManager.LOGIN_IP_LIMIT_KEY, ip_identifier) >= SecurityManager.LOGIN_IP_LIMIT
        )

    @staticmethod
    def record_login_failure(ip: str, email: str) -> None:
        account_identifier = SecurityManager.login_account_identifier(ip, email)
        ip_identifier = SecurityManager.login_ip_identifier(ip)
        SecurityManager._increment_limit(
            SecurityManager.LOGIN_ACCOUNT_LIMIT_KEY,
            account_identifier,
            window_seconds=SecurityManager.LOGIN_WINDOW_SECONDS,
        )
        SecurityManager._increment_limit(
            SecurityManager.LOGIN_IP_LIMIT_KEY,
            ip_identifier,
            window_seconds=SecurityManager.LOGIN_WINDOW_SECONDS,
        )

    @staticmethod
    def reset_login_rate_limit(ip: str, email: str) -> None:
        account_identifier = SecurityManager.login_account_identifier(ip, email)
        ip_identifier = SecurityManager.login_ip_identifier(ip)
        SecurityManager._reset_limit(SecurityManager.LOGIN_ACCOUNT_LIMIT_KEY, account_identifier)
        SecurityManager._reset_limit(SecurityManager.LOGIN_IP_LIMIT_KEY, ip_identifier)
    
    @staticmethod
    def get_login_rate_limit_remaining(ip: str, email: str) -> int:
        account_identifier = SecurityManager.login_account_identifier(ip, email)
        ip_identifier = SecurityManager.login_ip_identifier(ip)
        account_remaining = max(
            0,
            SecurityManager.LOGIN_ACCOUNT_LIMIT
            - SecurityManager._get_limit(SecurityManager.LOGIN_ACCOUNT_LIMIT_KEY, account_identifier),
        )
        ip_remaining = max(
            0,
            SecurityManager.LOGIN_IP_LIMIT
            - SecurityManager._get_limit(SecurityManager.LOGIN_IP_LIMIT_KEY, ip_identifier),
        )
        return min(account_remaining, ip_remaining)
    
    @staticmethod
    def check_api_rate_limit(user_id: int) -> bool:
        """Check API rate limit per user"""
        key = SecurityManager.API_LIMIT_KEY.format(user_id)
        count = cache.get(key, 0)
        
        if count >= SecurityManager.API_LIMIT:
            return False
        
        cache.set(key, count + 1, 60)  # 1 minute
        return True
    
    @staticmethod
    def get_api_rate_limit_remaining(user_id: int) -> int:
        """Get remaining API requests"""
        key = SecurityManager.API_LIMIT_KEY.format(user_id)
        count = cache.get(key, 0)
        return max(0, SecurityManager.API_LIMIT - count)
    
    @staticmethod
    def check_signup_rate_limit(ip: str) -> bool:
        """Check signup rate limit per IP"""
        key = SecurityManager.SIGNUP_LIMIT_KEY.format(ip)
        count = cache.get(key, 0)
        
        if count >= SecurityManager.SIGNUP_LIMIT:
            return False
        
        cache.set(key, count + 1, 60)  # 1 minute
        return True
    
    @staticmethod
    def get_security_metrics() -> Dict[str, Any]:
        """Get security metrics and statistics"""
        return {
            'whitelist_ips': list(SecurityManager.WHITELIST_IPS),
            'login_account_rate_limit': SecurityManager.LOGIN_ACCOUNT_LIMIT,
            'login_ip_rate_limit': SecurityManager.LOGIN_IP_LIMIT,
            'api_rate_limit': SecurityManager.API_LIMIT,
            'signup_rate_limit': SecurityManager.SIGNUP_LIMIT,
            'csrf_protection': getattr(settings, 'CSRF_COOKIE_SECURE', False),
            'secure_cookies': getattr(settings, 'SESSION_COOKIE_SECURE', False),
            'https_only': not settings.DEBUG,
        }


class SecurityHeadersMiddleware:
    """Middleware to add security headers to all responses"""
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.sentry.io; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-src 'none'; "
            "frame-ancestors 'none'"
        ),
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    }
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        for header, value in self.SECURITY_HEADERS.items():
            # Skip HSTS in development or non-HTTPS
            if header == 'Strict-Transport-Security' and (settings.DEBUG or not request.is_secure()):
                continue
            response[header] = value
        
        return response


class RateLimitingMiddleware:
    """Middleware to enforce rate limiting"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Get client IP
        ip = client_ip_from_request(request)
        
        # Check signup rate limit for signup endpoint
        if request.path == '/api/v1/auth/signup' and request.method == 'POST':
            if not SecurityManager.check_signup_rate_limit(ip):
                return error_response(
                    request,
                    "RATE_LIMITED",
                    "Too many signup attempts. Please try again later.",
                    details={"scope": "signup", "retry_after_seconds": 60},
                    status=429
                )
        
        # Check API rate limit for authenticated users
        if request.user.is_authenticated:
            if not SecurityManager.check_api_rate_limit(request.user.id):
                return error_response(
                    request,
                    "RATE_LIMITED",
                    "Too many requests. Please try again later.",
                    details={"scope": "api", "retry_after_seconds": 60},
                    status=429
                )
        
        response = self.get_response(request)
        
        # Add rate limit headers
        if request.user.is_authenticated:
            remaining = SecurityManager.get_api_rate_limit_remaining(request.user.id)
            response['X-RateLimit-Limit'] = str(SecurityManager.API_LIMIT)
            response['X-RateLimit-Remaining'] = str(remaining)
            response['X-RateLimit-Reset'] = str(
                int((datetime.now() + timedelta(minutes=1)).timestamp())
            )
        
        return response
    
def require_admin(view_func):
    """Decorator to require admin access with IP whitelist support"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        # Check IP whitelist if configured
        if SecurityManager.WHITELIST_IPS:
            ip = client_ip_from_request(request)
            if not SecurityManager.is_ip_whitelisted(ip):
                logger.warning(f"Unauthorized admin access attempt from IP: {ip}")
                return JsonResponse({'error': 'IP not whitelisted'}, status=403)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def get_ip_hash(ip: str) -> str:
    """Get hash of IP for logging"""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]
