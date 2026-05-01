import hashlib
import logging
from typing import Optional, Dict, Any, Set
from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.http import require_http_methods
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SecurityManager:
    """Service for security management and rate limiting"""
    
    # Rate limit keys
    LOGIN_LIMIT_KEY = 'rate_limit:login:{}'
    API_LIMIT_KEY = 'rate_limit:api:{}'
    SIGNUP_LIMIT_KEY = 'rate_limit:signup:{}'
    
    # Rate limit thresholds
    LOGIN_LIMIT = 5  # per minute
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
    def check_login_rate_limit(identifier: str) -> bool:
        """Check login rate limit"""
        key = SecurityManager.LOGIN_LIMIT_KEY.format(identifier)
        count = cache.get(key, 0)
        
        if count >= SecurityManager.LOGIN_LIMIT:
            return False
        
        cache.set(key, count + 1, 60)  # 1 minute
        return True
    
    @staticmethod
    def get_login_rate_limit_remaining(identifier: str) -> int:
        """Get remaining login attempts"""
        key = SecurityManager.LOGIN_LIMIT_KEY.format(identifier)
        count = cache.get(key, 0)
        return max(0, SecurityManager.LOGIN_LIMIT - count)
    
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
            'login_rate_limit': SecurityManager.LOGIN_LIMIT,
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
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.sentry.io; "
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
        ip = self._get_client_ip(request)
        
        # Check signup rate limit for signup endpoint
        if request.path == '/api/v1/auth/signup' and request.method == 'POST':
            if not SecurityManager.check_signup_rate_limit(ip):
                return JsonResponse(
                    {'error': 'Rate limit exceeded. Please try again in 1 minute.'},
                    status=429
                )
        
        # Check API rate limit for authenticated users
        if request.user.is_authenticated:
            if not SecurityManager.check_api_rate_limit(request.user.id):
                return JsonResponse(
                    {'error': 'Rate limit exceeded. Maximum 100 requests per minute.'},
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
    
    @staticmethod
    def _get_client_ip(request) -> str:
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


def require_admin(view_func):
    """Decorator to require admin access with IP whitelist support"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        # Check IP whitelist if configured
        if SecurityManager.WHITELIST_IPS:
            ip = RateLimitingMiddleware._get_client_ip(request)
            if not SecurityManager.is_ip_whitelisted(ip):
                logger.warning(f"Unauthorized admin access attempt from IP: {ip}")
                return JsonResponse({'error': 'IP not whitelisted'}, status=403)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def get_ip_hash(ip: str) -> str:
    """Get hash of IP for logging"""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]
