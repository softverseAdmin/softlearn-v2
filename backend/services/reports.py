"""Report generation service for admin."""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from django.db.models import Count, Q, QuerySet
from django.utils import timezone

from users.models import AuditLog, User, Application, DataExportRequest, DataDeletionRequest, DataConsent


class ReportGenerator:
    """Generate various administrative reports."""
    
    @staticmethod
    def generate_user_activity_report(
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        admin_user_id: Optional[int] = None,
        action_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate user activity report for date range.
        
        Returns audit logs of admin actions taken during the period.
        """
        if not date_from:
            date_from = timezone.now() - timedelta(days=30)
        if not date_to:
            date_to = timezone.now()
        
        logs = AuditLog.objects.filter(
            created_at__gte=date_from,
            created_at__lte=date_to,
        )
        
        if admin_user_id:
            logs = logs.filter(admin_user_id=admin_user_id)
        
        if action_type:
            logs = logs.filter(action_type=action_type)
        
        # Aggregate by action type
        action_counts = logs.values('action_type').annotate(count=Count('id')).order_by('-count')
        
        # Aggregate by entity type
        entity_counts = logs.values('entity_type').annotate(count=Count('id')).order_by('-count')
        
        # Get top admin users by activity
        top_users = logs.values('admin_user__email').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return {
            'report_type': 'user_activity',
            'date_from': date_from.isoformat(),
            'date_to': date_to.isoformat(),
            'total_actions': logs.count(),
            'action_summary': list(action_counts),
            'entity_summary': list(entity_counts),
            'top_users': list(top_users),
            'logs': list(logs.values('id', 'admin_user__email', 'action_type', 'entity_type', 'description', 'created_at')[:100]),
        }
    
    @staticmethod
    def generate_data_access_report(
        student_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Generate data access report.
        
        Shows all data access events for compliance auditing.
        """
        if not date_from:
            date_from = timezone.now() - timedelta(days=90)
        if not date_to:
            date_to = timezone.now()
        
        logs = AuditLog.objects.filter(
            created_at__gte=date_from,
            created_at__lte=date_to,
            action_type=AuditLog.ActionType.VIEW,
        )
        
        if student_id:
            logs = logs.filter(entity_id=student_id)
        
        # Count by admin user
        access_by_user = logs.values('admin_user__email').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Count by entity type
        access_by_entity = logs.values('entity_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'report_type': 'data_access',
            'date_from': date_from.isoformat(),
            'date_to': date_to.isoformat(),
            'total_accesses': logs.count(),
            'access_by_user': list(access_by_user),
            'access_by_entity': list(access_by_entity),
            'recent_accesses': list(logs.values(
                'admin_user__email', 'entity_type', 'entity_id', 'description', 'created_at'
            )[:50]),
        }
    
    @staticmethod
    def generate_content_modification_report(
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Generate content modification report.
        
        Shows all changes to courses, exams, and lessons.
        """
        if not date_from:
            date_from = timezone.now() - timedelta(days=90)
        if not date_to:
            date_to = timezone.now()
        
        logs = AuditLog.objects.filter(
            created_at__gte=date_from,
            created_at__lte=date_to,
            entity_type__in=['course', 'exam', 'lesson', 'question'],
            action_type__in=[AuditLog.ActionType.CREATE, AuditLog.ActionType.UPDATE, AuditLog.ActionType.DELETE],
        )
        
        # Count by action
        action_counts = logs.values('action_type', 'entity_type').annotate(
            count=Count('id')
        ).order_by('entity_type', '-count')
        
        # Get modifications by user
        mods_by_user = logs.values('admin_user__email').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'report_type': 'content_modification',
            'date_from': date_from.isoformat(),
            'date_to': date_to.isoformat(),
            'total_modifications': logs.count(),
            'modifications_by_action': list(action_counts),
            'modifications_by_user': list(mods_by_user),
            'recent_modifications': list(logs.values(
                'admin_user__email', 'action_type', 'entity_type', 'entity_id', 'description', 'created_at'
            )[:100]),
        }
    
    @staticmethod
    def generate_compliance_report() -> Dict[str, Any]:
        """
        Generate GDPR and privacy compliance report.
        
        Shows data export requests and deletion requests.
        """
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_90_days = now - timedelta(days=90)
        
        # Data exports
        try:
            export_qs = DataExportRequest.objects.all()
            exports_30d = export_qs.filter(created_at__gte=last_30_days).count()
            exports_90d = export_qs.filter(created_at__gte=last_90_days).count()
            pending_exports = export_qs.filter(status='pending').count()
        except:
            exports_30d = 0
            exports_90d = 0
            pending_exports = 0
        
        # Deletions
        try:
            deletion_qs = DataDeletionRequest.objects.all()
            deletions_30d = deletion_qs.filter(created_at__gte=last_30_days).count()
            pending_deletions = deletion_qs.filter(status='pending').count()
        except:
            deletions_30d = 0
            pending_deletions = 0
        
        # Consent tracking
        try:
            consent_qs = DataConsent.objects.all()
            users_with_consent = consent_qs.filter(has_consented=True).count()
            users_without_consent = consent_qs.filter(has_consented=False).count()
        except:
            users_with_consent = 0
            users_without_consent = 0
        
        return {
            'report_type': 'compliance',
            'generated_at': now.isoformat(),
            'data_exports': {
                'total': export_qs.count() if 'export_qs' in locals() else 0,
                'last_30_days': exports_30d,
                'last_90_days': exports_90d,
                'pending': pending_exports,
            },
            'deletions': {
                'last_30_days': deletions_30d,
                'pending': pending_deletions,
            },
            'consent': {
                'users_with_consent': users_with_consent,
                'users_without_consent': users_without_consent,
            },
            'audit_trail': {
                'total_logs': AuditLog.objects.count(),
                'logs_30_days': AuditLog.objects.filter(created_at__gte=last_30_days).count(),
            },
        }
    
    @staticmethod
    def generate_user_summary_report(user_id: int) -> Dict[str, Any]:
        """Generate summary report for a specific user."""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return {'error': 'User not found'}
        
        return {
            'report_type': 'user_summary',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.full_name,
                'role': user.role,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            },
            'activity': {
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'total_logins': AuditLog.objects.filter(
                    admin_user_id=user_id,
                    action_type=AuditLog.ActionType.LOGIN,
                ).count(),
            },
            'applications': {
                'total': Application.objects.filter(student_id=user_id).count() if user.role == 'student' else 0,
                'by_status': list(Application.objects.filter(
                    student_id=user_id
                ).values('status').annotate(count=Count('id'))) if user.role == 'student' else [],
            },
        }
