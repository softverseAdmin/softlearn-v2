"""
Tests for Phase 16: Privacy & Security features
Tests for DataConsent, StudentDataAccessLog, DataExportRequest, and related APIs
"""

from django.test import TestCase, Client
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from users.models import (
    Company,
    DataConsent,
    StudentDataAccessLog,
    DataExportRequest,
    DataDeletionRequest,
    StudentProfile,
)
from api.privacy_utils import (
    check_student_data_access,
    log_student_data_access,
    get_user_consent_for_company,
    get_client_ip,
)

User = get_user_model()


class DataConsentModelTests(TestCase):
    """Test DataConsent model."""

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)
        
        self.company = Company.objects.create(
            name="Test Company",
            description="A test company"
        )

    def test_create_consent_without_company(self):
        """Test creating consent for marketing emails (no company required)."""
        consent = DataConsent.objects.create(
            student=self.student,
            consent_type='marketing_emails',
            given=True,
            given_at=timezone.now(),
        )
        self.assertTrue(consent.given)
        self.assertEqual(consent.consent_type, 'marketing_emails')

    def test_create_consent_with_company(self):
        """Test creating company-specific consent."""
        consent = DataConsent.objects.create(
            student=self.student,
            consent_type='share_profile_with_company',
            company=self.company,
            given=True,
            given_at=timezone.now(),
        )
        self.assertTrue(consent.given)
        self.assertEqual(consent.company, self.company)

    def test_unique_consent_constraint(self):
        """Test unique constraint on student + consent_type + company."""
        DataConsent.objects.create(
            student=self.student,
            consent_type='share_profile_with_company',
            company=self.company,
            given=True,
        )
        
        # Should raise IntegrityError
        with self.assertRaises(Exception):
            DataConsent.objects.create(
                student=self.student,
                consent_type='share_profile_with_company',
                company=self.company,
                given=False,
            )

    def test_consent_string_representation(self):
        """Test string representation of consent."""
        consent = DataConsent.objects.create(
            student=self.student,
            consent_type='marketing_emails',
            given=True,
        )
        expected = f"Consent<{self.student.email}:marketing_emails>"
        self.assertEqual(str(consent), expected)


class StudentDataAccessLogTests(TestCase):
    """Test StudentDataAccessLog model."""

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)
        
        self.company = Company.objects.create(
            name="Test Company",
            description="A test company"
        )
        
        self.company_user = User.objects.create_user(
            email="company@example.com",
            password="testpass123",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=self.company,
        )

    def test_create_access_log(self):
        """Test creating an access log entry."""
        log = StudentDataAccessLog.objects.create(
            student=self.student,
            accessed_by=self.company_user,
            accessed_by_company=self.company,
            access_type='profile',
            ip_address='192.168.1.1',
            reason='Application review',
        )
        self.assertEqual(log.access_type, 'profile')
        self.assertEqual(log.student, self.student)

    def test_access_log_ordering(self):
        """Test that logs are ordered by creation time."""
        log1 = StudentDataAccessLog.objects.create(
            student=self.student,
            accessed_by=self.company_user,
            accessed_by_company=self.company,
            access_type='profile',
            ip_address='192.168.1.1',
        )
        
        # Create second log
        log2 = StudentDataAccessLog.objects.create(
            student=self.student,
            accessed_by=self.company_user,
            accessed_by_company=self.company,
            access_type='exam_results',
            ip_address='192.168.1.2',
        )
        
        logs = list(StudentDataAccessLog.objects.all())
        self.assertEqual(logs[0], log2)  # Most recent first


class DataExportRequestTests(TestCase):
    """Test DataExportRequest model."""

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)

    def test_create_export_request(self):
        """Test creating an export request."""
        expires_at = timezone.now() + timedelta(days=30)
        export = DataExportRequest.objects.create(
            student=self.student,
            status='pending',
            expires_at=expires_at,
        )
        self.assertEqual(export.status, 'pending')
        self.assertIsNone(export.file_url)

    def test_is_expired_property(self):
        """Test the is_expired property."""
        # Create expired request
        expired_time = timezone.now() - timedelta(days=1)
        export = DataExportRequest.objects.create(
            student=self.student,
            status='ready',
            expires_at=expired_time,
            file_url='https://example.com/export.zip',
        )
        self.assertTrue(export.is_expired)
        
        # Create non-expired request
        future_time = timezone.now() + timedelta(days=30)
        export2 = DataExportRequest.objects.create(
            student=self.student,
            status='pending',
            expires_at=future_time,
        )
        self.assertFalse(export2.is_expired)


class DataDeletionRequestTests(TestCase):
    """Test DataDeletionRequest model."""

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)

    def test_create_deletion_request(self):
        """Test creating a deletion request."""
        deletion = DataDeletionRequest.objects.create(
            student=self.student,
            status='pending',
            reason='No longer using the platform',
        )
        self.assertEqual(deletion.status, 'pending')
        self.assertIsNone(deletion.completed_at)

    def test_mark_deletion_completed(self):
        """Test marking deletion as completed."""
        deletion = DataDeletionRequest.objects.create(
            student=self.student,
            status='pending',
        )
        deletion.status = 'completed'
        deletion.completed_at = timezone.now()
        deletion.save()
        
        self.assertEqual(deletion.status, 'completed')
        self.assertIsNotNone(deletion.completed_at)


class PrivacyUtilsTests(TestCase):
    """Test privacy utility functions."""

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)
        
        self.company = Company.objects.create(
            name="Test Company",
            description="A test company"
        )
        
        self.company_user = User.objects.create_user(
            email="company@example.com",
            password="testpass123",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=self.company,
        )
        
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="testpass123",
            full_name="Admin User",
            role=User.Role.ADMIN,
        )

    def test_student_can_access_own_data(self):
        """Test that students can access their own data."""
        result = check_student_data_access(self.student, self.student)
        self.assertTrue(result)

    def test_admin_can_access_any_data(self):
        """Test that admins can access any student data."""
        result = check_student_data_access(self.admin_user, self.student)
        self.assertTrue(result)

    def test_company_needs_consent(self):
        """Test that company users need consent to access data."""
        result = check_student_data_access(self.company_user, self.student)
        self.assertFalse(result)

    def test_company_with_consent(self):
        """Test that company with consent can access data."""
        DataConsent.objects.create(
            student=self.student,
            consent_type='share_profile_with_company',
            company=self.company,
            given=True,
        )
        result = check_student_data_access(self.company_user, self.student)
        self.assertTrue(result)

    def test_log_student_data_access(self):
        """Test logging data access."""
        log = log_student_data_access(
            self.student,
            self.company_user,
            'profile',
            '192.168.1.1',
        )
        self.assertIsNotNone(log.id)
        self.assertEqual(log.access_type, 'profile')

    def test_get_user_consent_for_company(self):
        """Test retrieving consent for a company."""
        DataConsent.objects.create(
            student=self.student,
            consent_type='share_profile_with_company',
            company=self.company,
            given=True,
        )
        
        consents = get_user_consent_for_company(self.student, self.company)
        self.assertIn('share_profile_with_company', consents)
        self.assertTrue(consents['share_profile_with_company'])


class StudentConsentAPITests(TestCase):
    """Test student consent API endpoints."""

    def setUp(self):
        self.client = Client()
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)
        
        self.company = Company.objects.create(
            name="Test Company",
            description="A test company"
        )

    def test_get_consent_view(self):
        """Test getting consent preferences."""
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.get('/api/v1/student/consent')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('consents', data['data'])

    def test_update_consent_view(self):
        """Test updating consent preference."""
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.put(
            '/api/v1/student/consent',
            data={
                'consent_type': 'marketing_emails',
                'given': True,
            },
            content_type='application/json'
        )
        self.assertIn(response.status_code, [200, 201])


class DataAccessLogAPITests(TestCase):
    """Test data access log API endpoints."""

    def setUp(self):
        self.client = Client()
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)
        
        self.company = Company.objects.create(
            name="Test Company",
            description="A test company"
        )
        
        self.company_user = User.objects.create_user(
            email="company@example.com",
            password="testpass123",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=self.company,
        )

    def test_get_access_log_view(self):
        """Test getting data access logs."""
        # Create some logs
        StudentDataAccessLog.objects.create(
            student=self.student,
            accessed_by=self.company_user,
            accessed_by_company=self.company,
            access_type='profile',
            ip_address='192.168.1.1',
        )
        
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.get('/api/v1/student/data-access-log')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('logs', data['data'])


class DataExportAPITests(TestCase):
    """Test data export API endpoints."""

    def setUp(self):
        self.client = Client()
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)

    def test_create_export_request_view(self):
        """Test creating an export request via API."""
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.post('/api/v1/student/data-export-request')
        self.assertIn(response.status_code, [200, 201])

    def test_get_export_status_view(self):
        """Test getting export request status."""
        export = DataExportRequest.objects.create(
            student=self.student,
            status='pending',
            expires_at=timezone.now() + timedelta(days=30),
        )
        
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.get(f'/api/v1/student/data-export/{export.id}')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('export_request', data['data'])


class DataDeletionAPITests(TestCase):
    """Test data deletion API endpoints."""

    def setUp(self):
        self.client = Client()
        self.student = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            full_name="Test Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(user=self.student)

    def test_create_deletion_request_view(self):
        """Test creating a deletion request via API."""
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.post(
            '/api/v1/student/deletion-request',
            data={'reason': 'No longer using the platform'},
            content_type='application/json'
        )
        self.assertIn(response.status_code, [200, 201])

    def test_cannot_create_duplicate_deletion_request(self):
        """Test that duplicate deletion requests are blocked."""
        DataDeletionRequest.objects.create(
            student=self.student,
            status='pending',
        )
        
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.post(
            '/api/v1/student/deletion-request',
            data={'reason': 'Another request'},
            content_type='application/json'
        )
        # Should return error
        self.assertEqual(response.status_code, 400)

    def test_get_deletion_status_view(self):
        """Test getting deletion request status."""
        deletion = DataDeletionRequest.objects.create(
            student=self.student,
            status='pending',
        )
        
        self.client.login(email="student@example.com", password="testpass123")
        response = self.client.get('/api/v1/student/deletion-status')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('deletion_request', data['data'])
