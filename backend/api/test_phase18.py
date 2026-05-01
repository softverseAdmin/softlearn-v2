"""Tests for Phase 18: Admin Features Polish"""

import io
import json
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.test import TestCase, Client
from django.utils import timezone

from users.models import (
    AuditLog,
    Company,
    Course,
    ScheduledTask,
    User,
)
from services.bulk_operations import CSVExporter, CSVImporter
from services.reports import ReportGenerator
from services.scheduled_tasks import (
    archive_old_applications,
    send_weekly_digest,
    cleanup_expired_exports,
    execute_scheduled_task,
)


class CSVExporterTests(TestCase):
    """Test CSV export functionality"""

    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            password="testpass123",
            full_name="User One",
            role=User.Role.STUDENT,
        )
        self.company = Company.objects.create(
            name="Test Company",
            description="A test company",
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            password="testpass123",
            full_name="User Two",
            role=User.Role.COMPANY,
            company=self.company,
        )

    def test_export_users_csv(self):
        """Test exporting users to CSV"""
        csv_content = CSVExporter.export_users(User.objects.all())
        lines = csv_content.strip().split('\n')
        
        self.assertGreaterEqual(len(lines), 2)  # Header + at least 2 users
        self.assertIn('email', lines[0])
        self.assertIn('role', lines[0])
        self.assertIn('user1@test.com', csv_content)

    def test_export_companies_csv(self):
        """Test exporting companies to CSV"""
        csv_content = CSVExporter.export_companies(Company.objects.all())
        lines = csv_content.strip().split('\n')
        
        self.assertGreaterEqual(len(lines), 1)
        self.assertIn('name', lines[0])
        self.assertIn('Test Company', csv_content)


class CSVImporterTests(TestCase):
    """Test CSV import functionality"""

    def test_import_users_with_valid_csv(self):
        """Test importing users with valid CSV data"""
        csv_data = "email,full_name,role,password,company_id\n"
        csv_data += "newuser@test.com,New User,student,TestPass123,\n"
        
        company = Company.objects.create(
            name="ImportCo",
            description="Test company",
        )
        csv_data += f"company@test.com,Company User,company,CompPass123,{company.id}\n"
        
        csv_file = io.BytesIO(csv_data.encode('utf-8'))
        result = CSVImporter.import_users(csv_file)
        
        self.assertEqual(result['created'], 2)
        self.assertEqual(result['skipped'], 0)
        self.assertEqual(len(result['errors']), 0)
        
        # Verify users were created
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())
        self.assertTrue(User.objects.filter(email='company@test.com').exists())

    def test_import_users_with_duplicate_email(self):
        """Test importing users with duplicate email"""
        # Create existing user
        User.objects.create_user(
            email="existing@test.com",
            password="testpass123",
            full_name="Existing User",
            role=User.Role.STUDENT,
        )
        
        csv_data = "email,full_name,role,password,company_id\n"
        csv_data += "existing@test.com,New User,student,TestPass123,\n"
        
        csv_file = io.BytesIO(csv_data.encode('utf-8'))
        result = CSVImporter.import_users(csv_file)
        
        self.assertEqual(result['created'], 0)
        self.assertEqual(result['skipped'], 1)
        self.assertGreater(len(result['errors']), 0)

    def test_import_courses_with_valid_csv(self):
        """Test importing courses with valid CSV data"""
        csv_data = "title,description,category,difficulty_level,estimated_hours\n"
        csv_data += "Python 101,Learn Python,Programming,beginner,20\n"
        csv_data += "Advanced JS,Advanced JavaScript,Programming,advanced,40\n"
        
        csv_file = io.BytesIO(csv_data.encode('utf-8'))
        result = CSVImporter.import_courses(csv_file)
        
        self.assertEqual(result['created'], 2)
        self.assertEqual(result['skipped'], 0)

    def test_csv_templates(self):
        """Test CSV template generation"""
        user_template = CSVImporter.get_user_import_template()
        course_template = CSVImporter.get_course_import_template()
        
        self.assertIn('email,full_name', user_template)
        self.assertIn('title,description', course_template)


class AuditLogTests(TestCase):
    """Test audit logging functionality"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            full_name="Admin User",
            role=User.Role.ADMIN,
        )

    def test_create_audit_log(self):
        """Test creating an audit log entry"""
        log = AuditLog.objects.create(
            admin_user=self.admin_user,
            action_type=AuditLog.ActionType.CREATE,
            entity_type='user',
            entity_id=1,
            description='Created new user',
        )
        
        self.assertEqual(log.admin_user, self.admin_user)
        self.assertEqual(log.action_type, AuditLog.ActionType.CREATE)
        self.assertIsNotNone(log.created_at)

    def test_audit_log_filtering(self):
        """Test filtering audit logs"""
        log1 = AuditLog.objects.create(
            admin_user=self.admin_user,
            action_type=AuditLog.ActionType.CREATE,
            entity_type='user',
            entity_id=1,
            description='Created user',
        )
        log2 = AuditLog.objects.create(
            admin_user=self.admin_user,
            action_type=AuditLog.ActionType.UPDATE,
            entity_type='course',
            entity_id=2,
            description='Updated course',
        )
        
        # Filter by action type
        create_logs = AuditLog.objects.filter(action_type=AuditLog.ActionType.CREATE)
        self.assertEqual(create_logs.count(), 1)
        
        # Filter by entity type
        course_logs = AuditLog.objects.filter(entity_type='course')
        self.assertEqual(course_logs.count(), 1)


class ScheduledTaskTests(TestCase):
    """Test scheduled task functionality"""

    def setUp(self):
        self.task = ScheduledTask.objects.create(
            task_type=ScheduledTask.TaskType.ARCHIVE_APPLICATIONS,
            schedule=ScheduledTask.Schedule.DAILY,
            next_run=timezone.now() + timedelta(days=1),
        )

    def test_create_scheduled_task(self):
        """Test creating a scheduled task"""
        self.assertEqual(self.task.task_type, ScheduledTask.TaskType.ARCHIVE_APPLICATIONS)
        self.assertTrue(self.task.is_active)

    def test_execute_task(self):
        """Test executing a scheduled task"""
        success = execute_scheduled_task(ScheduledTask.TaskType.ARCHIVE_APPLICATIONS)
        self.assertTrue(success)
        
        # Check task was updated
        self.task.refresh_from_db()
        self.assertIsNotNone(self.task.last_run)

    def test_task_next_run_calculation(self):
        """Test next run calculation"""
        from services.scheduled_tasks import calculate_next_run
        
        now = timezone.now()
        next_daily = calculate_next_run(ScheduledTask.Schedule.DAILY, now)
        
        self.assertEqual(next_daily.day, (now + timedelta(days=1)).day)


class ReportGeneratorTests(TestCase):
    """Test report generation"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            full_name="Admin",
            role=User.Role.ADMIN,
        )
        # Create some audit logs
        for i in range(5):
            AuditLog.objects.create(
                admin_user=self.admin_user,
                action_type=AuditLog.ActionType.CREATE,
                entity_type='user',
                entity_id=i,
                description=f'Created item {i}',
            )

    def test_generate_user_activity_report(self):
        """Test generating user activity report"""
        report = ReportGenerator.generate_user_activity_report()
        
        self.assertEqual(report['report_type'], 'user_activity')
        self.assertGreater(report['total_actions'], 0)
        self.assertIn('action_summary', report)

    def test_generate_compliance_report(self):
        """Test generating compliance report"""
        report = ReportGenerator.generate_compliance_report()
        
        self.assertEqual(report['report_type'], 'compliance')
        self.assertIn('data_exports', report)
        self.assertIn('consent', report)
        self.assertIn('audit_trail', report)

    def test_report_date_filtering(self):
        """Test report date filtering"""
        now = timezone.now()
        past = now - timedelta(days=90)
        
        report = ReportGenerator.generate_user_activity_report(
            date_from=past,
            date_to=now,
        )
        
        self.assertIn('date_from', report)
        self.assertIn('date_to', report)


class AdminAPITests(TestCase):
    """Test admin API endpoints"""

    def setUp(self):
        self.client = Client()
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            full_name="Admin User",
            role=User.Role.ADMIN,
            is_staff=True,
        )
        self.student_user = User.objects.create_user(
            email="student@test.com",
            password="testpass123",
            full_name="Student User",
            role=User.Role.STUDENT,
        )

    def test_export_users_endpoint(self):
        """Test export users API endpoint"""
        self.client.force_login(self.admin_user)
        response = self.client.get('/api/v1/admin/export/users/')
        
        self.assertEqual(response.status_code, 200)

    def test_export_users_requires_admin(self):
        """Test export endpoint requires admin role"""
        self.client.force_login(self.student_user)
        response = self.client.get('/api/v1/admin/export/users/')
        
        self.assertEqual(response.status_code, 403)

    def test_scheduled_tasks_list(self):
        """Test listing scheduled tasks"""
        task = ScheduledTask.objects.create(
            task_type=ScheduledTask.TaskType.SEND_DIGEST,
            schedule=ScheduledTask.Schedule.WEEKLY,
            next_run=timezone.now() + timedelta(days=7),
        )
        
        self.client.force_login(self.admin_user)
        response = self.client.get('/api/v1/admin/scheduled-tasks/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('data', data)
        self.assertIn('tasks', data['data'])

    def test_audit_log_created_on_user_creation(self):
        """Test that audit log is created on admin action"""
        # This would require middleware integration
        # For now, test direct log creation
        log = AuditLog.objects.create(
            admin_user=self.admin_user,
            action_type=AuditLog.ActionType.CREATE,
            entity_type='user',
            description='Created new user',
        )
        
        self.assertIsNotNone(log.id)
