import json
from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import Client, TestCase
from django.utils import timezone

from users.models import (
    CandidateNote,
    CandidateReviewAccess,
    CandidateShortlist,
    Company,
    ExamResult,
    Interview,
    InterviewAvailability,
    InterviewEvent,
    LearningRecord,
    Notification,
    NotificationDelivery,
    Skill,
    StudentProfile,
    StudentSkill,
    StudentVisibilityEvent,
    StudentVisibilitySettings,
    User,
    Vacancy,
)


class ApiFoundationTests(TestCase):
    def csrf_client(self) -> tuple[Client, str]:
        client = Client(enforce_csrf_checks=True)
        response = client.get("/api/v1/auth/csrf")
        self.assertEqual(response.status_code, 200)
        return client, client.cookies["csrftoken"].value

    def test_health_endpoint_returns_request_id(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["status"], "ok")
        self.assertIn("X-Request-ID", response.headers)

    def test_session_endpoint_returns_unauthenticated_payload(self):
        response = self.client.get("/api/v1/auth/session")
        body = response.json()["data"]
        self.assertFalse(body["authenticated"])
        self.assertIsNone(body["user"])
        self.assertIn("csrf_token", body)

    def test_student_signup_creates_session(self):
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/signup",
            data=json.dumps(
                {
                    "role": "student",
                    "email": "student@example.com",
                    "password": "SecurePass123!",
                    "name": "Student User",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["data"]["role"], "student")
        session_response = client.get("/api/v1/auth/session")
        self.assertTrue(session_response.json()["data"]["authenticated"])

    def test_company_signup_requires_company_name(self):
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/signup",
            data=json.dumps(
                {
                    "role": "company",
                    "email": "company@example.com",
                    "password": "SecurePass123!",
                    "name": "Company User",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("company_name", response.json()["error"]["details"])

    def test_company_signup_creates_company_context(self):
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/signup",
            data=json.dumps(
                {
                    "role": "company",
                    "email": "company@example.com",
                    "password": "SecurePass123!",
                    "name": "Company User",
                    "company_name": "Softverse",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="company@example.com")
        self.assertEqual(user.role, User.Role.COMPANY)
        self.assertEqual(user.company.name, "Softverse")

    def test_signup_rejects_weak_passwords(self):
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/signup",
            data=json.dumps(
                {
                    "role": "student",
                    "email": "student@example.com",
                    "password": "123",
                    "name": "Student User",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.json()["error"]["details"])

    def test_login_returns_401_for_bad_credentials(self):
        User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "student@example.com", "password": "wrong-password", "role": "student"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"]["code"], "INVALID_CREDENTIALS")

    def test_login_requires_role(self):
        User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "student@example.com", "password": "SecurePass123!"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("role", response.json()["error"]["details"])

    def test_login_rejects_role_mismatch(self):
        User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        response = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "student@example.com", "password": "SecurePass123!", "role": "company"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"]["code"], "ROLE_MISMATCH")

    def test_logout_requires_csrf(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client = Client(enforce_csrf_checks=True)
        client.force_login(user)

        response = client.post("/api/v1/auth/logout")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"]["code"], "CSRF_FAILED")

    def test_password_change_updates_password(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)
        response = client.post(
            "/api/v1/auth/password/change",
            data=json.dumps(
                {
                    "current_password": "SecurePass123!",
                    "new_password": "NewSecurePass456!",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewSecurePass456!"))

    def test_role_protected_endpoints_are_deny_by_default(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )

        student_client = Client()
        student_client.force_login(student)
        self.assertEqual(student_client.get("/api/v1/access/student").status_code, 200)
        self.assertEqual(student_client.get("/api/v1/access/company").status_code, 403)

        company_client = Client()
        company_client.force_login(company_user)
        self.assertEqual(company_client.get("/api/v1/access/company").status_code, 200)
        self.assertEqual(company_client.get("/api/v1/access/admin").status_code, 403)

        admin_client = Client()
        admin_client.force_login(admin)
        self.assertEqual(admin_client.get("/api/v1/access/admin").status_code, 200)

    def test_notifications_list_and_mark_read_flow(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        Notification.objects.create(
            recipient=student,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam result available",
            message="A result is ready.",
            link="/student/exams",
            entity_type="exam_result",
            entity_id=1,
            event_key="seed",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        list_response = client.get("/api/v1/notifications")
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json()["data"]["unread_count"], 1)
        notification_id = list_response.json()["data"]["notifications"][0]["id"]
        self.assertFalse(list_response.json()["data"]["notifications"][0]["is_read"])

        read_response = client.post(
            f"/api/v1/notifications/{notification_id}/read",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(read_response.status_code, 200)
        self.assertTrue(read_response.json()["data"]["is_read"])

    def test_mark_all_notifications_as_read(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        Notification.objects.create(
            recipient=student,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam result available",
            message="A result is ready.",
            link="/student/exams",
            entity_type="exam_result",
            entity_id=1,
            event_key="first",
        )
        Notification.objects.create(
            recipient=student,
            notification_type=Notification.Type.EXAM_RESULT_UPDATED,
            title="Exam result updated",
            message="A result changed.",
            link="/student/exams",
            entity_type="exam_result",
            entity_id=1,
            event_key="second",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        response = client.post(
            "/api/v1/notifications/read-all",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["unread_count"], 0)
        self.assertTrue(all(item["is_read"] for item in response.json()["data"]["notifications"]))

    def test_student_dashboard_returns_summary_metrics(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(
            user=student,
            desired_job_type="Backend",
            desired_work_location="Tokyo",
            japanese_level="N2",
            english_level="Business",
        )
        skill = Skill.objects.create(name="Dashboard Skill")
        StudentSkill.objects.create(student=student, skill=skill, proficiency_level=StudentSkill.Proficiency.INTERMEDIATE)
        LearningRecord.objects.create(
            student=student,
            course_title="Web Fundamentals",
            category="engineering",
            progress_percent=100,
            status=LearningRecord.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        LearningRecord.objects.create(
            student=student,
            course_title="API Integration",
            category="engineering",
            progress_percent=45,
            status=LearningRecord.Status.IN_PROGRESS,
        )
        ExamResult.objects.create(
            student=student,
            exam_title="Backend Exam",
            category="engineering",
            score_percent=88,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )
        client = Client()
        client.force_login(student)

        response = client.get("/api/v1/student/dashboard")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["student_name"], "Student User")
        self.assertEqual(body["continue_learning"]["topic_title"], "API Integration")
        self.assertEqual(body["continue_learning"]["progress_percent"], 45)
        self.assertEqual(body["next_action"]["action_type"], "complete_topic")
        self.assertEqual(body["progress_overview"]["completed_topics"], 1)
        self.assertEqual(body["progress_overview"]["exam_average"], 88.0)
        self.assertEqual(body["progress_overview"]["current_level"], "Intermediate")
        self.assertTrue(any(node["is_current"] for node in body["roadmap_preview"]["nodes"]))

    def test_company_dashboard_is_company_scoped(self):
        company = Company.objects.create(name="Softverse", description="Hiring platform team")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=True,
            share_learning_record=True,
            share_exam_results=True,
        )
        ExamResult.objects.create(
            student=student,
            exam_title="Backend Exam",
            category="engineering",
            score_percent=92,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        CandidateShortlist.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            created_by=User.objects.create_user(
                email="company@example.com",
                password="SecurePass123!",
                full_name="Company User",
                role=User.Role.COMPANY,
                company=company,
            ),
        )
        company_user = User.objects.get(email="company@example.com")
        Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
        )
        Notification.objects.create(
            recipient=company_user,
            notification_type=Notification.Type.INTERVIEW_REQUESTED,
            title="Interview requested",
            message="Interview request recorded.",
            link="/company/interviews/1",
            entity_type="interview",
            entity_id=1,
            event_key="company-dashboard",
        )
        client = Client()
        client.force_login(company_user)

        response = client.get("/api/v1/company/dashboard")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["company_name"], "Softverse")
        self.assertEqual(body["analytics"]["candidates_to_review"], 1)
        self.assertEqual(body["analytics"]["shortlisted_candidates"], 1)
        self.assertEqual(body["analytics"]["active_jobs"], 0)
        self.assertEqual(body["analytics"]["unread_updates"], 1)
        self.assertEqual(len(body["candidates_to_review"]), 1)
        self.assertEqual(body["candidates_to_review"][0]["score_percent"], 92.0)
        self.assertEqual(body["interviews"]["active_count"], 1)
        self.assertEqual(body["interviews"]["completed_count"], 0)

    def test_company_dashboard_hides_candidate_score_when_exam_results_are_private(self):
        company = Company.objects.create(name="Softverse", description="Hiring platform team")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=True,
            share_learning_record=True,
            share_exam_results=False,
        )
        ExamResult.objects.create(
            student=student,
            exam_title="Backend Exam",
            category="engineering",
            score_percent=95,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.MATCH,
        )
        client = Client()
        client.force_login(company_user)

        response = client.get("/api/v1/company/dashboard")

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["data"]["candidates_to_review"][0]["score_percent"])

    def test_admin_dashboard_returns_platform_counts(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
            status=Interview.Status.COMPLETED,
            scheduled_start=timezone.now() - timedelta(hours=2),
            scheduled_end=timezone.now() - timedelta(hours=1),
            confirmed_at=timezone.now() - timedelta(days=1),
            completed_at=timezone.now(),
        )
        Notification.objects.create(
            recipient=admin,
            notification_type=Notification.Type.INTERVIEW_CONFIRMED,
            title="Platform activity",
            message="A platform update is ready.",
            link="/admin",
            entity_type="interview",
            entity_id=1,
            event_key="admin-dashboard",
        )
        client = Client()
        client.force_login(admin)

        response = client.get("/api/v1/admin/dashboard")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["metrics"]["students"], 1)
        self.assertEqual(body["metrics"]["company_users"], 1)
        self.assertEqual(body["metrics"]["admins"], 1)
        self.assertEqual(body["metrics"]["companies"], 1)
        self.assertEqual(body["metrics"]["active_vacancies"], 0)
        self.assertEqual(body["metrics"]["completed_interviews"], 1)
        self.assertEqual(body["metrics"]["unread_notifications"], 1)

    def test_admin_can_create_and_list_users(self):
        company = Company.objects.create(name="Softverse")
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_response = client.post(
            "/api/v1/admin/users",
            data=json.dumps(
                {
                    "email": "manager@example.com",
                    "name": "Manager User",
                    "role": "company",
                    "company_id": company.id,
                    "password": "SecurePass123!",
                    "is_active": True,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        list_response = client.get("/api/v1/admin/users")

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(User.objects.get(email="manager@example.com").company, company)
        self.assertTrue(any(item["email"] == "manager@example.com" for item in list_response.json()["data"]["users"]))

    def test_admin_can_update_user_activation(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        target = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        response = client.put(
            f"/api/v1/admin/users/{target.id}",
            data=json.dumps(
                {
                    "email": target.email,
                    "name": "Student User Updated",
                    "role": target.role,
                    "company_id": None,
                    "is_active": False,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        target.refresh_from_db()
        self.assertFalse(target.is_active)
        self.assertEqual(target.full_name, "Student User Updated")

    def test_admin_cannot_deactivate_self(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        response = client.put(
            f"/api/v1/admin/users/{admin.id}",
            data=json.dumps(
                {
                    "email": admin.email,
                    "name": admin.full_name,
                    "role": admin.role,
                    "company_id": None,
                    "is_active": False,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("is_active", response.json()["error"]["details"])

    def test_admin_can_create_and_update_company(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_response = client.post(
            "/api/v1/admin/companies",
            data=json.dumps(
                {
                    "name": "Softverse",
                    "description": "Platform company",
                    "is_active": True,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        company_id = create_response.json()["data"]["company_id"]
        update_response = client.put(
            f"/api/v1/admin/companies/{company_id}",
            data=json.dumps(
                {
                    "name": "Softverse Updated",
                    "description": "Updated description",
                    "is_active": False,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        company = Company.objects.get(pk=company_id)
        self.assertFalse(company.is_active)
        self.assertEqual(company.name, "Softverse Updated")

    def test_company_can_create_update_and_retire_vacancy(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        create_response = client.post(
            "/api/v1/company/vacancies",
            data=json.dumps(
                {
                    "title": "Backend Engineer",
                    "description": "Build platform APIs.",
                    "employment_type": "full_time",
                    "experience_level": "junior",
                    "location": "Tokyo",
                    "status": "draft",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        vacancy_id = create_response.json()["data"]["vacancy_id"]
        update_response = client.put(
            f"/api/v1/company/vacancies/{vacancy_id}",
            data=json.dumps(
                {
                    "title": "Backend Engineer Updated",
                    "description": "Build protected platform APIs.",
                    "employment_type": "full_time",
                    "experience_level": "mid",
                    "location": "Osaka",
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        delete_response = client.delete(
            f"/api/v1/company/vacancies/{vacancy_id}",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        vacancy = Vacancy.objects.get(pk=vacancy_id)
        self.assertEqual(vacancy.status, Vacancy.Status.INACTIVE)
        self.assertEqual(vacancy.title, "Backend Engineer Updated")

    def test_company_vacancy_list_is_scoped(self):
        company = Company.objects.create(name="Softverse")
        other_company = Company.objects.create(name="Otherverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        other_user = User.objects.create_user(
            email="other@example.com",
            password="SecurePass123!",
            full_name="Other User",
            role=User.Role.COMPANY,
            company=other_company,
        )
        Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        Vacancy.objects.create(
            company=other_company,
            created_by=other_user,
            title="Frontend Engineer",
            description="Build UI.",
            employment_type="full_time",
            experience_level="mid",
            location="Osaka",
            status=Vacancy.Status.ACTIVE,
        )
        client = Client()
        client.force_login(company_user)

        response = client.get("/api/v1/company/vacancies")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["data"]["vacancies"]), 1)
        self.assertEqual(response.json()["data"]["vacancies"][0]["company_name"], "Softverse")

    def test_admin_can_view_vacancies(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        client = Client()
        client.force_login(admin)

        response = client.get("/api/v1/admin/vacancies")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["data"]["vacancies"]), 1)

    def test_company_user_requires_company(self):
        with self.assertRaises(ValidationError):
            User.objects.create_user(
                email="company@example.com",
                password="SecurePass123!",
                full_name="Company User",
                role=User.Role.COMPANY,
            )

    def test_student_cannot_have_company(self):
        company = Company.objects.create(name="Softverse")
        with self.assertRaises(ValidationError):
            User.objects.create_user(
                email="student@example.com",
                password="SecurePass123!",
                full_name="Student User",
                role=User.Role.STUDENT,
                company=company,
            )

    def test_student_profile_get_returns_default_profile(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/student/profile")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["name"], "Student User")
        self.assertEqual(body["desired_job_type"], "")
        self.assertFalse(body["profile_complete"])

    def test_student_profile_put_updates_basic_fields(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        response = client.put(
            "/api/v1/student/profile",
            data=json.dumps(
                {
                    "name": "Updated Student",
                    "desired_job_type": "backend",
                    "desired_work_location": "Tokyo",
                    "japanese_level": "N3",
                    "english_level": "B2",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        profile = StudentProfile.objects.get(user=user)
        self.assertEqual(user.full_name, "Updated Student")
        self.assertEqual(profile.desired_job_type, "backend")
        self.assertTrue(response.json()["data"]["profile_complete"])

    def test_company_cannot_access_student_profile_endpoint(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get("/api/v1/student/profile")
        self.assertEqual(response.status_code, 403)

    def test_company_profile_get_returns_company_context(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get("/api/v1/company/profile")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["name"], "Softverse")
        self.assertEqual(response.json()["data"]["description"], "")
        self.assertFalse(response.json()["data"]["profile_complete"])

    def test_company_profile_put_updates_name_and_description(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.put(
            "/api/v1/company/profile",
            data=json.dumps(
                {
                    "name": "Softverse Japan",
                    "description": "We hire students for entry-level software roles in Japan.",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        company.refresh_from_db()
        self.assertEqual(company.name, "Softverse Japan")
        self.assertEqual(company.description, "We hire students for entry-level software roles in Japan.")
        self.assertTrue(response.json()["data"]["profile_complete"])

    def test_student_cannot_access_company_profile_endpoint(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/company/profile")
        self.assertEqual(response.status_code, 403)

    def test_student_skills_get_returns_catalog_and_assignments(self):
        skill_a = Skill.objects.create(name="Django Testing")
        skill_b = Skill.objects.create(name="React Testing")
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentSkill.objects.create(
            student=user,
            skill=skill_a,
            proficiency_level=StudentSkill.Proficiency.INTERMEDIATE,
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/student/skills")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["skill_count"], 1)
        self.assertEqual(body["skills"][0]["skill_name"], "Django Testing")
        available_skill_names = {skill["name"] for skill in body["available_skills"]}
        self.assertIn("Django Testing", available_skill_names)
        self.assertIn("React Testing", available_skill_names)

    def test_student_skills_post_adds_skill(self):
        skill = Skill.objects.create(name="TypeScript Testing")
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        response = client.post(
            "/api/v1/student/skills",
            data=json.dumps(
                {
                    "skill_id": skill.id,
                    "proficiency_level": StudentSkill.Proficiency.ADVANCED,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        student_skill = StudentSkill.objects.get(student=user, skill=skill)
        self.assertEqual(student_skill.proficiency_level, StudentSkill.Proficiency.ADVANCED)
        self.assertEqual(response.json()["data"]["skill_count"], 1)

    def test_student_skills_reject_duplicate_skill(self):
        skill = Skill.objects.create(name="Python Testing")
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentSkill.objects.create(student=user, skill=skill)
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        response = client.post(
            "/api/v1/student/skills",
            data=json.dumps(
                {
                    "skill_id": skill.id,
                    "proficiency_level": StudentSkill.Proficiency.BEGINNER,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("skill_id", response.json()["error"]["details"])

    def test_student_skills_put_updates_skill_and_proficiency(self):
        skill_a = Skill.objects.create(name="Django Editing")
        skill_b = Skill.objects.create(name="React Editing")
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        student_skill = StudentSkill.objects.create(student=user, skill=skill_a)
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        response = client.put(
            f"/api/v1/student/skills/{student_skill.id}",
            data=json.dumps(
                {
                    "skill_id": skill_b.id,
                    "proficiency_level": StudentSkill.Proficiency.INTERMEDIATE,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        student_skill.refresh_from_db()
        self.assertEqual(student_skill.skill, skill_b)
        self.assertEqual(student_skill.proficiency_level, StudentSkill.Proficiency.INTERMEDIATE)

    def test_student_skills_delete_removes_assignment(self):
        skill = Skill.objects.create(name="Docker Testing")
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        student_skill = StudentSkill.objects.create(student=user, skill=skill)
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        response = client.delete(
            f"/api/v1/student/skills/{student_skill.id}",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(StudentSkill.objects.filter(pk=student_skill.id).exists())
        self.assertEqual(response.json()["data"]["skill_count"], 0)

    def test_company_user_cannot_access_student_skills_endpoint(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get("/api/v1/student/skills")
        self.assertEqual(response.status_code, 403)

    def test_student_learning_summary_returns_course_records(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        LearningRecord.objects.create(
            student=user,
            course_title="Backend Foundations",
            category="backend",
            progress_percent=100,
            status=LearningRecord.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        LearningRecord.objects.create(
            student=user,
            course_title="Frontend Foundations",
            category="frontend",
            progress_percent=45,
            status=LearningRecord.Status.IN_PROGRESS,
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/student/learning-summary")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["total_courses"], 2)
        self.assertEqual(body["completed_courses"], 1)
        self.assertEqual(body["in_progress_courses"], 1)

    def test_student_exam_results_returns_summary(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        ExamResult.objects.create(
            student=user,
            exam_title="Python Basics Exam",
            category="programming",
            score_percent=82,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now() - timedelta(days=1),
        )
        ExamResult.objects.create(
            student=user,
            exam_title="Networking Exam",
            category="infrastructure",
            score_percent=68,
            passed=False,
            attempt_number=2,
            taken_at=timezone.now(),
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/student/exam-results")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["total_results"], 2)
        self.assertEqual(body["passed_results"], 1)
        self.assertEqual(body["average_score"], 75.0)

    def test_company_candidates_list_returns_company_safe_preview_cards(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        get_profile = StudentProfile.objects.create(
            user=student,
            desired_job_type="backend",
            desired_work_location="Tokyo",
            japanese_level="N3",
            english_level="B2",
        )
        del get_profile
        skill = Skill.objects.create(name="Candidate Python")
        StudentSkill.objects.create(student=student, skill=skill, proficiency_level=StudentSkill.Proficiency.ADVANCED)
        CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=True,
            share_learning_record=True,
            share_exam_results=False,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get("/api/v1/company/candidates")

        self.assertEqual(response.status_code, 200)
        candidate = response.json()["data"]["candidates"][0]
        self.assertEqual(candidate["display_name"], "Student User")
        self.assertEqual(candidate["visibility"]["exam_results"], "hidden")
        self.assertEqual(candidate["top_skills"], ["Candidate Python"])

    def test_company_candidate_preview_returns_hidden_state_when_profile_not_shared(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=False,
            share_learning_record=True,
            share_exam_results=False,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.MATCH,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/preview")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["visibility"], "hidden")
        self.assertIsNone(body["student"])

    def test_company_candidate_learning_record_returns_visible_summary(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        LearningRecord.objects.create(
            student=student,
            course_title="Backend Foundations",
            category="backend",
            progress_percent=100,
            status=LearningRecord.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=True,
            share_learning_record=True,
            share_exam_results=False,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.SHORTLIST,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/learning-record")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["visibility"], "visible")
        self.assertEqual(body["summary"]["completed_courses"], 1)

    def test_company_candidate_exam_results_require_explicit_sharing(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        ExamResult.objects.create(
            student=student,
            exam_title="Python Basics Exam",
            category="programming",
            score_percent=92,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )
        visibility = StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=True,
            share_learning_record=True,
            share_exam_results=False,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )

        client = Client()
        client.force_login(company_user)

        hidden_response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/exam-results")
        self.assertEqual(hidden_response.status_code, 200)
        self.assertEqual(hidden_response.json()["data"]["visibility"], "hidden")

        visibility.share_exam_results = True
        visibility.save(update_fields=["share_exam_results", "updated_at"])

        visible_response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/exam-results")
        self.assertEqual(visible_response.status_code, 200)
        self.assertEqual(visible_response.json()["data"]["visibility"], "visible")
        self.assertEqual(visible_response.json()["data"]["summary"]["passed_results"], 1)

    def test_company_cannot_access_another_company_candidate_context(self):
        owner_company = Company.objects.create(name="Owner Company")
        other_company = Company.objects.create(name="Other Company")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=owner_company,
            student=student,
            source=CandidateReviewAccess.Source.MATCH,
        )
        other_company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=other_company,
        )

        client = Client()
        client.force_login(other_company_user)
        response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/preview")

        self.assertEqual(response.status_code, 400)
        self.assertIn("candidate_access_id", response.json()["error"]["details"])

    def test_student_privacy_settings_get_returns_current_state_and_history(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/student/privacy-settings")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertTrue(body["share_profile_preview"])
        self.assertTrue(body["share_learning_record"])
        self.assertFalse(body["share_exam_results"])
        self.assertEqual(len(body["history"]), 1)

    def test_student_privacy_settings_put_updates_state_and_records_event(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        response = client.put(
            "/api/v1/student/privacy-settings",
            data=json.dumps(
                {
                    "share_profile_preview": True,
                    "share_learning_record": False,
                    "share_exam_results": True,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        settings = StudentVisibilitySettings.objects.get(student=user)
        self.assertFalse(settings.share_learning_record)
        self.assertTrue(settings.share_exam_results)
        self.assertEqual(StudentVisibilityEvent.objects.filter(student=user).count(), 2)

    def test_company_candidate_shortlist_can_be_created_and_removed(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        create_response = client.post(
            f"/api/v1/company/candidates/{candidate_access.id}/shortlist",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(create_response.status_code, 201)
        self.assertTrue(CandidateShortlist.objects.filter(candidate_access=candidate_access).exists())

        shortlist_response = client.get("/api/v1/company/shortlist")
        self.assertEqual(shortlist_response.status_code, 200)
        self.assertEqual(shortlist_response.json()["data"]["shortlist_count"], 1)

        delete_response = client.delete(
            f"/api/v1/company/candidates/{candidate_access.id}/shortlist",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(CandidateShortlist.objects.filter(candidate_access=candidate_access).exists())

    def test_company_candidate_notes_are_company_internal(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.MATCH,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student_client = Client()
        student_client.force_login(student)
        self.assertEqual(
            student_client.get(f"/api/v1/company/candidates/{candidate_access.id}/notes").status_code,
            403,
        )

        client, csrf_token = self.csrf_client()
        client.force_login(company_user)
        post_response = client.post(
            f"/api/v1/company/candidates/{candidate_access.id}/notes",
            data=json.dumps({"body": "Strong backend fundamentals and clear communication."}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(post_response.status_code, 201)
        self.assertTrue(CandidateNote.objects.filter(candidate_access=candidate_access).exists())

        get_response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/notes")
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(len(get_response.json()["data"]["notes"]), 1)

    def test_company_candidate_preview_includes_shortlist_and_notes(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        StudentVisibilitySettings.objects.create(
            student=student,
            share_profile_preview=True,
            share_learning_record=True,
            share_exam_results=False,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.SHORTLIST,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        CandidateShortlist.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            created_by=company_user,
        )
        CandidateNote.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            author=company_user,
            body="Add to shortlist for follow-up.",
        )

        client = Client()
        client.force_login(company_user)
        response = client.get(f"/api/v1/company/candidates/{candidate_access.id}/preview")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertIsNotNone(body["shortlist"])
        self.assertEqual(len(body["notes"]), 1)

    def test_company_can_request_interview_from_shortlisted_candidate_context(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.SHORTLIST,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.post(
            f"/api/v1/company/candidates/{candidate_access.id}/interviews",
            data=json.dumps({"purpose": "Technical interview", "role_context": "Backend trainee"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        interview = Interview.objects.get(candidate_access=candidate_access)
        self.assertEqual(interview.status, Interview.Status.REQUESTED)
        self.assertEqual(InterviewEvent.objects.filter(interview=interview, event_type="requested").count(), 1)
        self.assertEqual(Notification.objects.filter(entity_type="interview", entity_id=interview.id).count(), 2)
        self.assertEqual(
            NotificationDelivery.objects.filter(
                notification__entity_type="interview",
                notification__entity_id=interview.id,
                channel=NotificationDelivery.Channel.EMAIL,
            ).count(),
            2,
        )

    def test_match_only_candidate_context_cannot_request_interview_without_shortlist(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.MATCH,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.post(
            f"/api/v1/company/candidates/{candidate_access.id}/interviews",
            data=json.dumps({"purpose": "Screening interview", "role_context": ""}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("candidate_access_id", response.json()["error"]["details"])

    def test_student_and_company_can_submit_interview_availability(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
        )

        student_client, student_csrf = self.csrf_client()
        student_client.force_login(student)
        student_response = student_client.post(
            f"/api/v1/interviews/{interview.id}/availability",
            data=json.dumps(
                {
                    "start_at": (timezone.now() + timedelta(days=1)).isoformat(),
                    "end_at": (timezone.now() + timedelta(days=1, hours=1)).isoformat(),
                    "note": "Available after class.",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=student_csrf,
        )
        self.assertEqual(student_response.status_code, 201)

        company_client, company_csrf = self.csrf_client()
        company_client.force_login(company_user)
        company_response = company_client.post(
            f"/api/v1/interviews/{interview.id}/availability",
            data=json.dumps(
                {
                    "start_at": (timezone.now() + timedelta(days=2)).isoformat(),
                    "end_at": (timezone.now() + timedelta(days=2, hours=1)).isoformat(),
                    "note": "Preferred company slot.",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=company_csrf,
        )
        self.assertEqual(company_response.status_code, 201)
        self.assertEqual(InterviewAvailability.objects.filter(interview=interview).count(), 2)
        self.assertEqual(InterviewEvent.objects.filter(interview=interview, event_type="availability_submitted").count(), 2)

    def test_company_can_confirm_interview_from_availability(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
        )
        availability = InterviewAvailability.objects.create(
            interview=interview,
            submitted_by=student,
            start_at=timezone.now() + timedelta(days=1),
            end_at=timezone.now() + timedelta(days=1, hours=1),
            note="Morning works best.",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.post(
            f"/api/v1/company/interviews/{interview.id}/confirm",
            data=json.dumps({"availability_id": availability.id}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        interview.refresh_from_db()
        self.assertEqual(interview.status, Interview.Status.CONFIRMED)
        self.assertEqual(interview.scheduled_start, availability.start_at)
        self.assertEqual(InterviewEvent.objects.filter(interview=interview, event_type="confirmed").count(), 1)
        self.assertEqual(
            Notification.objects.filter(
                entity_type="interview",
                entity_id=interview.id,
                notification_type=Notification.Type.INTERVIEW_CONFIRMED,
            ).count(),
            2,
        )

    def test_student_can_list_own_interviews_and_detail(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
        )
        create = InterviewEvent.objects.create(
            interview=interview,
            actor=company_user,
            event_type="requested",
            description="Interview requested from an approved company candidate context.",
        )
        del create

        client = Client()
        client.force_login(student)
        list_response = client.get("/api/v1/student/interviews")
        detail_response = client.get(f"/api/v1/interviews/{interview.id}")

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()["data"]["interviews"]), 1)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["data"]["history"][0]["event_type"], "requested")

    def test_interview_can_be_rescheduled_by_participant(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
            status=Interview.Status.CONFIRMED,
            scheduled_start=timezone.now() + timedelta(days=1),
            scheduled_end=timezone.now() + timedelta(days=1, hours=1),
            confirmed_at=timezone.now(),
            meeting_provider=Interview.MeetingProvider.ZOOM,
            meeting_url="https://softverse.zoom.us/j/123456789",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        response = client.post(
            f"/api/v1/interviews/{interview.id}/reschedule",
            data=json.dumps({"reason": "Class schedule changed."}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        interview.refresh_from_db()
        self.assertEqual(interview.status, Interview.Status.RESCHEDULED)
        self.assertIsNone(interview.scheduled_start)
        self.assertEqual(interview.meeting_provider, "")
        self.assertEqual(interview.meeting_url, "")
        self.assertEqual(InterviewEvent.objects.filter(interview=interview, event_type="rescheduled").count(), 1)
        self.assertEqual(
            Notification.objects.filter(
                entity_type="interview",
                entity_id=interview.id,
                notification_type=Notification.Type.INTERVIEW_RESCHEDULED,
            ).count(),
            2,
        )

    def test_interview_can_be_cancelled_by_company(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.post(
            f"/api/v1/interviews/{interview.id}/cancel",
            data=json.dumps({"reason": "Position has been closed."}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        interview.refresh_from_db()
        self.assertEqual(interview.status, Interview.Status.CANCELLED)
        self.assertIsNotNone(interview.cancelled_at)
        self.assertEqual(InterviewEvent.objects.filter(interview=interview, event_type="cancelled").count(), 1)
        self.assertEqual(
            Notification.objects.filter(
                entity_type="interview",
                entity_id=interview.id,
                notification_type=Notification.Type.INTERVIEW_CANCELLED,
            ).count(),
            2,
        )

    def test_confirmed_interview_can_be_completed_by_participant(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
            status=Interview.Status.CONFIRMED,
            scheduled_start=timezone.now() - timedelta(hours=2),
            scheduled_end=timezone.now() - timedelta(hours=1),
            confirmed_at=timezone.now() - timedelta(days=1),
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        response = client.post(
            f"/api/v1/interviews/{interview.id}/complete",
            data=json.dumps({"summary": "Interview finished successfully."}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        interview.refresh_from_db()
        self.assertEqual(interview.status, Interview.Status.COMPLETED)
        self.assertIsNotNone(interview.completed_at)
        self.assertEqual(InterviewEvent.objects.filter(interview=interview, event_type="completed").count(), 1)

    def test_only_confirmed_interviews_can_be_completed(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.post(
            f"/api/v1/interviews/{interview.id}/complete",
            data=json.dumps({"summary": "Interview finished successfully."}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("status", response.json()["error"]["details"])

    def test_exam_result_creation_generates_student_notification(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )

        ExamResult.objects.create(
            student=student,
            exam_title="JLPT Mock",
            category="language",
            score_percent=82,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )

        self.assertEqual(
            Notification.objects.filter(
                recipient=student,
                notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            ).count(),
            1,
        )
        self.assertEqual(
            NotificationDelivery.objects.filter(
                notification__recipient=student,
                channel=NotificationDelivery.Channel.EMAIL,
            ).count(),
            1,
        )

    def test_meeting_link_validation_accepts_zoom_and_rejects_mismatch(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
            status=Interview.Status.CONFIRMED,
            scheduled_start=timezone.now() + timedelta(days=1),
            scheduled_end=timezone.now() + timedelta(days=1, hours=1),
            confirmed_at=timezone.now(),
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        valid_response = client.put(
            f"/api/v1/interviews/{interview.id}/meeting-link",
            data=json.dumps(
                {
                    "meeting_provider": "zoom",
                    "meeting_url": "https://softverse.zoom.us/j/123456789",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(valid_response.status_code, 200)
        interview.refresh_from_db()
        self.assertEqual(interview.meeting_provider, Interview.MeetingProvider.ZOOM)

        invalid_response = client.put(
            f"/api/v1/interviews/{interview.id}/meeting-link",
            data=json.dumps(
                {
                    "meeting_provider": "google_meet",
                    "meeting_url": "https://softverse.zoom.us/j/123456789",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(invalid_response.status_code, 400)
        self.assertIn("meeting_url", invalid_response.json()["error"]["details"])

    def test_meeting_links_cannot_be_updated_for_rescheduled_interviews(self):
        company = Company.objects.create(name="Softverse")
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        candidate_access = CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        interview = Interview.objects.create(
            candidate_access=candidate_access,
            company=company,
            student=student,
            requested_by=company_user,
            purpose="Technical interview",
            role_context="Backend trainee",
            status=Interview.Status.RESCHEDULED,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.put(
            f"/api/v1/interviews/{interview.id}/meeting-link",
            data=json.dumps(
                {
                    "meeting_provider": "zoom",
                    "meeting_url": "https://softverse.zoom.us/j/123456789",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("status", response.json()["error"]["details"])
