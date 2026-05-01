from django.test import TestCase, Client
from django.utils import timezone
from datetime import timedelta

from users.models import (
    User,
    Company,
    StudentProfile,
    LearningRecord,
    ExamResult,
    Application,
    Interview,
    StudentSkill,
    Skill,
    CandidateReviewAccess,
    StudentDashboardMetric,
    CompanyDashboardMetric,
)
from services.analytics import AnalyticsService


class AnalyticsServiceTestCase(TestCase):
    """Test the AnalyticsService"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.student_user = User.objects.create_user(
            email='student@test.com',
            full_name='Test Student',
            password='testpass123',
            role=User.Role.STUDENT
        )
        
        self.company = Company.objects.create(name='Test Company')
        
        self.company_user = User.objects.create_user(
            email='company@test.com',
            full_name='Company User',
            password='testpass123',
            role=User.Role.COMPANY,
            company=self.company
        )
        
        # Create student profile
        self.student_profile = StudentProfile.objects.create(user=self.student_user)
        
        # Create some test data - use get_or_create to avoid slug conflicts
        self.skill, _ = Skill.objects.get_or_create(name='TestPythonSkill', defaults={'name': 'TestPythonSkill'})
        StudentSkill.objects.get_or_create(student=self.student_user, skill=self.skill)

    def test_calculate_student_metrics_basic(self):
        """Test basic student metrics calculation"""
        metric = AnalyticsService.calculate_student_metrics(self.student_profile)
        
        self.assertIsNotNone(metric)
        self.assertEqual(metric.student, self.student_profile)
        self.assertEqual(metric.skills_total, 1)
        self.assertEqual(metric.skills_endorsed, 1)

    def test_calculate_company_metrics_basic(self):
        """Test basic company metrics calculation"""
        metric = AnalyticsService.calculate_company_metrics(self.company)
        
        self.assertIsNotNone(metric)
        self.assertEqual(metric.company, self.company)
        self.assertEqual(metric.open_vacancies, 0)
        self.assertEqual(metric.total_applications, 0)

    def test_get_student_dashboard_data(self):
        """Test getting complete student dashboard data"""
        data = AnalyticsService.get_student_dashboard_data(self.student_profile)
        
        self.assertIn('metrics', data)
        self.assertIn('score_history', data)
        self.assertIn('learning_status', data)
        self.assertIn('upcoming_interviews', data)
        self.assertIn('application_status', data)
        self.assertIn('last_updated', data)

    def test_get_company_dashboard_data(self):
        """Test getting complete company dashboard data"""
        data = AnalyticsService.get_company_dashboard_data(self.company)
        
        self.assertIn('metrics', data)
        self.assertIn('vacancy_performance', data)
        self.assertIn('funnel_data', data)
        self.assertIn('daily_activity', data)
        self.assertIn('last_updated', data)

    def test_get_admin_dashboard_data(self):
        """Test getting admin dashboard data"""
        data = AnalyticsService.get_admin_dashboard_data()
        
        self.assertIn('platform_overview', data)
        self.assertIn('platform_activity', data)
        self.assertIn('content_metrics', data)
        self.assertIn('user_growth', data)
        self.assertIn('last_updated', data)
        
        # Check that student is counted
        self.assertGreaterEqual(data['platform_overview']['total_students'], 1)


class StudentDashboardAPITestCase(TestCase):
    """Test student dashboard API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        self.student_user = User.objects.create_user(
            email='student@test.com',
            full_name='Test Student',
            password='testpass123',
            role=User.Role.STUDENT
        )
        
        self.student_profile = StudentProfile.objects.create(user=self.student_user)

    def test_student_dashboard_data_requires_auth(self):
        """Test that dashboard requires authentication"""
        response = self.client.get('/api/v1/student/dashboard-data')
        self.assertEqual(response.status_code, 401)

    def test_student_dashboard_data_authenticated(self):
        """Test student dashboard data with authentication"""
        self.client.force_login(self.student_user)
        response = self.client.get('/api/v1/student/dashboard-data')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('metrics', data['data'])

    def test_student_dashboard_learning_view(self):
        """Test student learning dashboard endpoint"""
        self.client.force_login(self.student_user)
        response = self.client.get('/api/v1/student/dashboard-data/learning')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('learning_status', data['data'])

    def test_student_dashboard_applications_view(self):
        """Test student applications dashboard endpoint"""
        self.client.force_login(self.student_user)
        response = self.client.get('/api/v1/student/dashboard-data/applications')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('application_status', data['data'])


class CompanyDashboardAPITestCase(TestCase):
    """Test company dashboard API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        self.company = Company.objects.create(name='Test Company')
        
        self.company_user = User.objects.create_user(
            email='company@test.com',
            full_name='Company User',
            password='testpass123',
            role=User.Role.COMPANY,
            company=self.company
        )

    def test_company_dashboard_data_requires_auth(self):
        """Test that dashboard requires authentication"""
        response = self.client.get('/api/v1/company/dashboard-data')
        self.assertEqual(response.status_code, 401)

    def test_company_dashboard_data_authenticated(self):
        """Test company dashboard data with authentication"""
        self.client.force_login(self.company_user)
        response = self.client.get('/api/v1/company/dashboard-data')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('metrics', data['data'])

    def test_company_dashboard_pipeline_view(self):
        """Test company pipeline dashboard endpoint"""
        self.client.force_login(self.company_user)
        response = self.client.get('/api/v1/company/dashboard-data/pipeline')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('funnel_data', data['data'])


class AdminDashboardAPITestCase(TestCase):
    """Test admin dashboard API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            full_name='Admin User',
            password='testpass123',
            role=User.Role.ADMIN
        )
        self.admin_user.is_staff = True
        self.admin_user.save()

    def test_admin_dashboard_data_requires_admin_role(self):
        """Test that admin dashboard requires admin role"""
        student_user = User.objects.create_user(
            email='student@test.com',
            full_name='Test Student',
            password='testpass123',
            role=User.Role.STUDENT
        )
        
        self.client.force_login(student_user)
        response = self.client.get('/api/v1/admin/dashboard-data')
        self.assertEqual(response.status_code, 403)

    def test_admin_dashboard_data_authenticated_admin(self):
        """Test admin dashboard data with admin authentication"""
        self.client.force_login(self.admin_user)
        response = self.client.get('/api/v1/admin/dashboard-data')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('platform_overview', data['data'])
        self.assertIn('platform_activity', data['data'])
