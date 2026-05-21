"""Scheduled administrative tasks."""

from datetime import datetime, timedelta
from typing import Optional

from django.utils import timezone

from users.models import Application, ScheduledTask


def archive_old_applications() -> str:
    """Archive applications older than 6 months."""
    try:
        six_months_ago = timezone.now() - timedelta(days=180)

        archived_at = timezone.now()
        archived = Application.objects.filter(
            created_at__lt=six_months_ago,
            status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN],
            archived_at__isnull=True,
        ).update(archived_at=archived_at)

        return f"Archived {archived} applications"
    except Exception as e:
        return f"Error: {str(e)}"


def send_weekly_digest() -> str:
    """Send platform summary digest to admin."""
    try:
        from django.core.mail import send_mail
        from users.models import User, Company, Course
        
        # Get admin email (you'll want to configure this)
        admin_email = "admin@softlearn.com"
        
        # Calculate metrics
        user_count = User.objects.count()
        new_users_this_week = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).count()
        company_count = Company.objects.count()
        course_count = Course.objects.count()
        app_count = Application.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        # Prepare email content
        subject = f"Weekly Platform Digest - {timezone.now().strftime('%Y-%m-%d')}"
        message = f"""
Platform Weekly Summary:

Users:
- Total Users: {user_count}
- New Users (7 days): {new_users_this_week}

Companies:
- Total Companies: {company_count}

Content:
- Total Courses: {course_count}

Applications:
- New Applications (7 days): {app_count}

Generated at: {timezone.now()}
        """
        
        send_mail(subject, message, "noreply@softlearn.com", [admin_email])
        return "Digest sent successfully"
    
    except Exception as e:
        return f"Error: {str(e)}"


def cleanup_expired_exports() -> str:
    """Delete exports and temporary files older than 30 days."""
    try:
        from users.models import DataExportRequest
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        deleted_count, _ = DataExportRequest.objects.filter(
            created_at__lt=thirty_days_ago,
            status__in=['completed', 'expired']
        ).delete()
        
        return f"Deleted {deleted_count} expired exports"
    except Exception as e:
        return f"Error: {str(e)}"


def refresh_analytics() -> str:
    """Recalculate analytics dashboards."""
    try:
        from services.analytics import AnalyticsService
        
        # Recalculate all metrics
        AnalyticsService.calculate_student_metrics()
        AnalyticsService.calculate_company_metrics()
        
        return "Analytics refreshed successfully"
    except Exception as e:
        return f"Error: {str(e)}"


def execute_scheduled_task(task_type: str) -> bool:
    """Execute a scheduled task by type."""
    task_handlers = {
        ScheduledTask.TaskType.ARCHIVE_APPLICATIONS: archive_old_applications,
        ScheduledTask.TaskType.SEND_DIGEST: send_weekly_digest,
        ScheduledTask.TaskType.CLEANUP_EXPORTS: cleanup_expired_exports,
        ScheduledTask.TaskType.REFRESH_ANALYTICS: refresh_analytics,
    }
    
    handler = task_handlers.get(task_type)
    if not handler:
        return False
    
    try:
        # Get or create the scheduled task
        task, _ = ScheduledTask.objects.get_or_create(
            task_type=task_type,
            defaults={
                'schedule': ScheduledTask.Schedule.DAILY,
                'next_run': timezone.now() + timedelta(days=1),
            }
        )
        
        # Execute the task
        result = handler()
        
        # Update task record
        task.last_run = timezone.now()
        task.last_result = result
        task.next_run = calculate_next_run(task.schedule, timezone.now())
        task.save(update_fields=['last_run', 'last_result', 'next_run'])
        
        return True
    except Exception as e:
        return False


def calculate_next_run(schedule: str, current_time: datetime) -> datetime:
    """Calculate the next run time based on schedule."""
    if schedule == ScheduledTask.Schedule.HOURLY:
        return current_time + timedelta(hours=1)
    elif schedule == ScheduledTask.Schedule.DAILY:
        return current_time + timedelta(days=1)
    elif schedule == ScheduledTask.Schedule.WEEKLY:
        return current_time + timedelta(weeks=1)
    elif schedule == ScheduledTask.Schedule.MONTHLY:
        # Add approximately 30 days
        return current_time + timedelta(days=30)
    else:
        return current_time + timedelta(hours=1)


def init_scheduled_tasks() -> None:
    """Initialize default scheduled tasks."""
    tasks = [
        {
            'task_type': ScheduledTask.TaskType.ARCHIVE_APPLICATIONS,
            'schedule': ScheduledTask.Schedule.DAILY,
            'hour': 2,  # 2 AM
        },
        {
            'task_type': ScheduledTask.TaskType.SEND_DIGEST,
            'schedule': ScheduledTask.Schedule.WEEKLY,
            'day_of_week': 1,  # Monday
            'hour': 9,  # 9 AM
        },
        {
            'task_type': ScheduledTask.TaskType.CLEANUP_EXPORTS,
            'schedule': ScheduledTask.Schedule.DAILY,
            'hour': 3,  # 3 AM
        },
        {
            'task_type': ScheduledTask.TaskType.REFRESH_ANALYTICS,
            'schedule': ScheduledTask.Schedule.DAILY,
            'hour': 1,  # 1 AM
        },
    ]
    
    for task_config in tasks:
        task_type = task_config.pop('task_type')
        schedule = task_config.pop('schedule')
        
        ScheduledTask.objects.get_or_create(
            task_type=task_type,
            defaults={
                'schedule': schedule,
                'next_run': timezone.now() + timedelta(hours=1),
                'is_active': True,
            }
        )
