import redis
import pickle
import logging
from functools import wraps
from typing import Optional, Any, Callable, Dict
from django.core.cache import cache
from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from datetime import timedelta

logger = logging.getLogger(__name__)


class CacheManager:
    """Service for managing caching with strategic TTLs"""
    
    # Cache key prefixes
    USER_PROFILE_PREFIX = 'user_profile:'
    COURSE_LIST_PREFIX = 'course_list:'
    COMPANY_JOBS_PREFIX = 'company_jobs:'
    MATCHING_RESULTS_PREFIX = 'matching_results:'
    DASHBOARD_METRICS_PREFIX = 'dashboard_metrics:'
    
    # TTLs in seconds
    USER_PROFILE_TTL = 30 * 60  # 30 minutes
    COURSE_LIST_TTL = 60 * 60  # 1 hour
    COMPANY_JOBS_TTL = 30 * 60  # 30 minutes
    MATCHING_RESULTS_TTL = 15 * 60  # 15 minutes
    DASHBOARD_METRICS_TTL = 5 * 60  # 5 minutes
    
    @staticmethod
    def get(key: str, default=None) -> Any:
        """Get value from cache"""
        try:
            return cache.get(key, default)
        except Exception as e:
            logger.warning(f"Failed to get cache key {key}: {e}")
            return default
    
    @staticmethod
    def set(key: str, value: Any, timeout: Optional[int] = None):
        """Set value in cache"""
        try:
            cache.set(key, value, timeout)
        except Exception as e:
            logger.error(f"Failed to set cache key {key}: {e}")
    
    @staticmethod
    def delete(key: str):
        """Delete key from cache"""
        try:
            cache.delete(key)
        except Exception as e:
            logger.warning(f"Failed to delete cache key {key}: {e}")
    
    @staticmethod
    def clear():
        """Clear entire cache"""
        try:
            cache.clear()
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
    
    @staticmethod
    def get_stats() -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            redis_conn = redis.from_url(
                settings.CACHES['default']['LOCATION'],
                decode_responses=True
            )
            info = redis_conn.info()
            return {
                'used_memory': info.get('used_memory_human'),
                'total_commands': info.get('total_commands_processed'),
                'keyspace': info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0),
                'hit_rate': f"{info.get('keyspace_hits', 0) / (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 1)) * 100:.2f}%",
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {}
    
    @staticmethod
    def cache_user_profile(user_id: int, data: Any):
        """Cache user profile data"""
        key = f"{CacheManager.USER_PROFILE_PREFIX}{user_id}"
        CacheManager.set(key, data, CacheManager.USER_PROFILE_TTL)
    
    @staticmethod
    def get_user_profile(user_id: int) -> Optional[Any]:
        """Get cached user profile"""
        key = f"{CacheManager.USER_PROFILE_PREFIX}{user_id}"
        return CacheManager.get(key)
    
    @staticmethod
    def invalidate_user_profile(user_id: int):
        """Invalidate user profile cache"""
        key = f"{CacheManager.USER_PROFILE_PREFIX}{user_id}"
        CacheManager.delete(key)
    
    @staticmethod
    def cache_course_list(data: Any):
        """Cache course list"""
        key = f"{CacheManager.COURSE_LIST_PREFIX}all"
        CacheManager.set(key, data, CacheManager.COURSE_LIST_TTL)
    
    @staticmethod
    def get_course_list() -> Optional[Any]:
        """Get cached course list"""
        key = f"{CacheManager.COURSE_LIST_PREFIX}all"
        return CacheManager.get(key)
    
    @staticmethod
    def invalidate_course_list():
        """Invalidate course list cache"""
        key = f"{CacheManager.COURSE_LIST_PREFIX}all"
        CacheManager.delete(key)
    
    @staticmethod
    def cache_company_jobs(company_id: int, data: Any):
        """Cache company job postings"""
        key = f"{CacheManager.COMPANY_JOBS_PREFIX}{company_id}"
        CacheManager.set(key, data, CacheManager.COMPANY_JOBS_TTL)
    
    @staticmethod
    def get_company_jobs(company_id: int) -> Optional[Any]:
        """Get cached company jobs"""
        key = f"{CacheManager.COMPANY_JOBS_PREFIX}{company_id}"
        return CacheManager.get(key)
    
    @staticmethod
    def invalidate_company_jobs(company_id: int):
        """Invalidate company jobs cache"""
        key = f"{CacheManager.COMPANY_JOBS_PREFIX}{company_id}"
        CacheManager.delete(key)
    
    @staticmethod
    def cache_matching_results(student_id: int, data: Any):
        """Cache matching results"""
        key = f"{CacheManager.MATCHING_RESULTS_PREFIX}{student_id}"
        CacheManager.set(key, data, CacheManager.MATCHING_RESULTS_TTL)
    
    @staticmethod
    def get_matching_results(student_id: int) -> Optional[Any]:
        """Get cached matching results"""
        key = f"{CacheManager.MATCHING_RESULTS_PREFIX}{student_id}"
        return CacheManager.get(key)
    
    @staticmethod
    def invalidate_matching_results(student_id: int):
        """Invalidate matching results cache"""
        key = f"{CacheManager.MATCHING_RESULTS_PREFIX}{student_id}"
        CacheManager.delete(key)
    
    @staticmethod
    def cache_dashboard_metrics(metric_key: str, data: Any):
        """Cache dashboard metrics"""
        key = f"{CacheManager.DASHBOARD_METRICS_PREFIX}{metric_key}"
        CacheManager.set(key, data, CacheManager.DASHBOARD_METRICS_TTL)
    
    @staticmethod
    def get_dashboard_metrics(metric_key: str) -> Optional[Any]:
        """Get cached dashboard metrics"""
        key = f"{CacheManager.DASHBOARD_METRICS_PREFIX}{metric_key}"
        return CacheManager.get(key)
    
    @staticmethod
    def invalidate_dashboard_metrics(metric_key: Optional[str] = None):
        """Invalidate dashboard metrics cache"""
        if metric_key:
            key = f"{CacheManager.DASHBOARD_METRICS_PREFIX}{metric_key}"
            CacheManager.delete(key)
        else:
            # Clear all dashboard metrics
            try:
                redis_conn = redis.from_url(
                    settings.CACHES['default']['LOCATION'],
                    decode_responses=True
                )
                pattern = f"{CacheManager.DASHBOARD_METRICS_PREFIX}*"
                for key in redis_conn.scan_iter(match=pattern):
                    redis_conn.delete(key)
            except Exception as e:
                logger.error(f"Failed to invalidate all dashboard metrics: {e}")


def cache_result(
    timeout: int = 60 * 60,
    key_prefix: Optional[str] = None,
    key_func: Optional[Callable] = None,
):
    """Decorator for caching function results"""
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            elif key_prefix:
                cache_key = f"{key_prefix}:{':'.join(str(a) for a in args)}"
            else:
                cache_key = f"{func.__name__}:{':'.join(str(a) for a in args)}"
            
            # Try to get from cache
            result = CacheManager.get(cache_key)
            if result is not None:
                return result
            
            # Compute result and cache it
            result = func(*args, **kwargs)
            CacheManager.set(cache_key, result, timeout)
            return result
        
        # Add function to clear cache
        wrapper.clear_cache = lambda: CacheManager.delete(
            key_prefix if key_prefix else func.__name__
        )
        
        return wrapper
    
    return decorator


class CacheInvalidationSignalHandler:
    """Signal handler for cache invalidation on model changes"""
    
    @staticmethod
    def register_user_cache_invalidation():
        """Register User model cache invalidation"""
        from users.models import User
        
        @receiver(post_save, sender=User)
        def invalidate_user_cache(sender, instance, **kwargs):
            CacheManager.invalidate_user_profile(instance.id)
            # Also invalidate matching results if user is a student
            if hasattr(instance, 'student_profile'):
                CacheManager.invalidate_matching_results(instance.id)
        
        @receiver(post_delete, sender=User)
        def invalidate_user_delete_cache(sender, instance, **kwargs):
            CacheManager.invalidate_user_profile(instance.id)
    
    @staticmethod
    def register_course_cache_invalidation():
        """Register Course model cache invalidation"""
        try:
            from api.models import Course
            
            @receiver(post_save, sender=Course)
            def invalidate_course_cache(sender, instance, **kwargs):
                CacheManager.invalidate_course_list()
            
            @receiver(post_delete, sender=Course)
            def invalidate_course_delete_cache(sender, instance, **kwargs):
                CacheManager.invalidate_course_list()
        except ImportError:
            pass


def register_cache_signals():
    """Register all cache invalidation signals"""
    CacheInvalidationSignalHandler.register_user_cache_invalidation()
    CacheInvalidationSignalHandler.register_course_cache_invalidation()
