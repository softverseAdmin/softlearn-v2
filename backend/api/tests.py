import json
from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import Client, TestCase
from django.utils import timezone

from users.models import (
    Application,
    ApplicationStatusHistory,
    CandidateNote,
    CandidateReviewAccess,
    CandidateShortlist,
    Company,
    Course,
    Exam,
    ExamAnswerOption,
    ExamAttempt,
    ExamAttemptAnswer,
    ExamCategory,
    ExamQuestion,
    ExamResult,
    Interview,
    InterviewAvailability,
    InterviewEvent,
    JobBookmark,
    Lesson,
    LessonProgress,
    LearningRecord,
    MockExam,
    MockExamAttempt,
    MockExamAttemptAnswer,
    Notification,
    NotificationDelivery,
    PracticeQuestion,
    PracticeQuestionAttempt,
    PracticeQuestionOption,
    Skill,
    StudentAvailabilityProfile,
    StudentCertificate,
    StudentEducation,
    StudentExperience,
    StudentPerformanceMetric,
    StudentProfile,
    StudentResume,
    StudentSkill,
    StudyPlan,
    StudyPlanItem,
    StudentVisibilityEvent,
    StudentVisibilitySettings,
    User,
    Vacancy,
    VacancyLanguageRequirement,
    VacancySkillRequirement,
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
        self.assertIsNone(body["current_lesson"])
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
            source=CandidateReviewAccess.Source.APPLICATION,
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
        self.assertEqual(body["system_stats"]["active_students"], 1)
        self.assertEqual(body["system_stats"]["companies"], 1)
        self.assertEqual(body["system_stats"]["revenue_label"], "Unavailable")
        self.assertEqual(body["system_stats"]["revenue_description"], "Billing and premium purchase tracking are not connected yet.")
        self.assertTrue(any(item["kind"] == "user" for item in body["recent_activity"]))
        self.assertTrue(any(item["kind"] == "interview" for item in body["recent_activity"]))
        self.assertEqual(body["system_status"][0]["value"], "1")

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

    def test_admin_can_create_update_and_retire_company(self):
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
        company = Company.objects.get(pk=company_id)
        company_user = User.objects.create_user(
            email="company-owner@example.com",
            password="SecurePass123!",
            full_name="Company Owner",
            role=User.Role.COMPANY,
            company=company,
        )
        vacancy = Vacancy(
            company=company,
            created_by=company_user,
            title="Platform Engineer",
            description="Maintain the platform.",
            employment_type="Full-time",
            experience_level="Mid",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=True,
            status=Vacancy.Status.ACTIVE,
        )
        vacancy.full_clean()
        vacancy.save()

        list_response = client.get("/api/v1/admin/companies")
        detail_response = client.get(f"/api/v1/admin/companies/{company_id}")
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
        delete_response = client.delete(
            f"/api/v1/admin/companies/{company_id}",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        listed_company = list_response.json()["data"]["companies"][0]
        self.assertEqual(listed_company["user_count"], 1)
        self.assertEqual(listed_company["vacancy_count"], 1)
        self.assertEqual(listed_company["active_vacancy_count"], 1)
        self.assertEqual(detail_response.json()["data"]["company_id"], company_id)
        company = Company.objects.get(pk=company_id)
        self.assertFalse(company.is_active)
        self.assertEqual(company.name, "Softverse Updated")

    def test_admin_can_create_update_and_retire_course(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_response = client.post(
            "/api/v1/admin/courses",
            data=json.dumps(
                {
                    "title": "Backend Foundations",
                    "description": "Build backend fundamentals.",
                    "category": "backend",
                    "difficulty_level": "beginner",
                    "estimated_hours": 16,
                    "status": "draft",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        course_id = create_response.json()["data"]["course_id"]
        update_response = client.put(
            f"/api/v1/admin/courses/{course_id}",
            data=json.dumps(
                {
                    "title": "Backend Foundations Updated",
                    "description": "Protected backend fundamentals.",
                    "category": "backend",
                    "difficulty_level": "intermediate",
                    "estimated_hours": 24,
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        delete_response = client.delete(
            f"/api/v1/admin/courses/{course_id}",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        course = Course.objects.get(pk=course_id)
        self.assertEqual(course.title, "Backend Foundations Updated")
        self.assertEqual(course.difficulty_level, "intermediate")
        self.assertEqual(course.estimated_hours, 24)
        self.assertEqual(course.status, Course.Status.INACTIVE)

    def test_company_user_cannot_access_admin_courses(self):
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

        response = client.get("/api/v1/admin/courses")

        self.assertEqual(response.status_code, 403)

    def test_admin_can_create_update_and_retire_lesson(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_response = client.post(
            f"/api/v1/admin/courses/{course.id}/lessons",
            data=json.dumps(
                {
                    "title": "HTTP Basics",
                    "summary": "Learn request fundamentals.",
                    "content": "Lesson body",
                    "sequence_number": 1,
                    "status": "draft",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        lesson_id = create_response.json()["data"]["lesson_id"]
        update_response = client.put(
            f"/api/v1/admin/lessons/{lesson_id}",
            data=json.dumps(
                {
                    "title": "HTTP Basics Updated",
                    "summary": "Learn protected request fundamentals.",
                    "content": "Updated lesson body",
                    "sequence_number": 2,
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        delete_response = client.delete(
            f"/api/v1/admin/lessons/{lesson_id}",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        lesson = Lesson.objects.get(pk=lesson_id)
        self.assertEqual(lesson.title, "HTTP Basics Updated")
        self.assertEqual(lesson.sequence_number, 2)
        self.assertEqual(lesson.status, Lesson.Status.INACTIVE)

    def test_admin_can_create_update_and_retire_exam(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_response = client.post(
            "/api/v1/admin/exams",
            data=json.dumps(
                {
                    "title": "Backend Validation",
                    "description": "Backend assessment.",
                    "category": "backend",
                    "duration_minutes": 45,
                    "passing_score_percent": 80,
                    "question_count": 20,
                    "max_attempts": 3,
                    "status": "draft",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        exam_id = create_response.json()["data"]["exam_id"]
        update_response = client.put(
            f"/api/v1/admin/exams/{exam_id}",
            data=json.dumps(
                {
                    "title": "Backend Validation Updated",
                    "description": "Protected backend assessment.",
                    "category": "backend",
                    "duration_minutes": 60,
                    "passing_score_percent": 85,
                    "question_count": 24,
                    "max_attempts": 4,
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        delete_response = client.delete(
            f"/api/v1/admin/exams/{exam_id}",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        exam = Exam.objects.get(pk=exam_id)
        self.assertEqual(exam.title, "Backend Validation Updated")
        self.assertEqual(exam.duration_minutes, 60)
        self.assertEqual(exam.passing_score_percent, 85)
        self.assertEqual(exam.question_count, 24)
        self.assertEqual(exam.max_attempts, 4)
        self.assertEqual(exam.status, Exam.Status.INACTIVE)

    def test_company_user_cannot_access_admin_exams(self):
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

        response = client.get("/api/v1/admin/exams")

        self.assertEqual(response.status_code, 403)

    def test_admin_can_manage_exam_questions_and_options(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        exam = Exam.objects.create(
            title="Backend Validation",
            description="Backend assessment.",
            category="backend",
            duration_minutes=45,
            passing_score_percent=80,
            question_count=0,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_question = client.post(
            f"/api/v1/admin/exams/{exam.id}/questions",
            data=json.dumps(
                {
                    "prompt": "Which layer handles URL routing?",
                    "instructions": "Pick one answer.",
                    "question_type": "single_choice",
                    "sequence_number": 1,
                    "points": 2,
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        question_id = create_question.json()["data"]["question_id"]
        create_option = client.post(
            f"/api/v1/admin/questions/{question_id}/options",
            data=json.dumps(
                {
                    "option_text": "Router",
                    "sequence_number": 1,
                    "is_correct": True,
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        option_id = create_option.json()["data"]["option_id"]
        update_option = client.put(
            f"/api/v1/admin/options/{option_id}",
            data=json.dumps(
                {
                    "option_text": "Application router",
                    "sequence_number": 1,
                    "is_correct": True,
                    "status": "active",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_question.status_code, 201)
        self.assertEqual(create_option.status_code, 201)
        self.assertEqual(update_option.status_code, 200)
        exam.refresh_from_db()
        self.assertEqual(exam.question_count, 1)
        self.assertEqual(ExamQuestion.objects.get(pk=question_id).points, 2)
        self.assertEqual(ExamAnswerOption.objects.get(pk=option_id).option_text, "Application router")

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

    def test_company_vacancy_metadata_is_saved_and_updated(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        python_skill, _ = Skill.objects.get_or_create(name="Python")
        react_skill, _ = Skill.objects.get_or_create(name="React")
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        create_response = client.post(
            "/api/v1/company/vacancies",
            data=json.dumps(
                {
                    "title": "Platform Engineer",
                    "description": "Build hiring platform services.",
                    "employment_type": "full_time",
                    "experience_level": "mid",
                    "location": "Tokyo",
                    "work_style": "hybrid",
                    "relocation_support": True,
                    "status": "active",
                    "required_skill_ids": [python_skill.id],
                    "preferred_skill_ids": [react_skill.id],
                    "language_requirements": [
                        {
                            "language": "japanese",
                            "minimum_level": "business",
                            "requirement_type": "required",
                        },
                        {
                            "language": "english",
                            "minimum_level": "conversational",
                            "requirement_type": "preferred",
                        },
                    ],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        vacancy_id = create_response.json()["data"]["vacancy_id"]
        self.assertEqual(create_response.json()["data"]["work_style"], "hybrid")
        self.assertTrue(create_response.json()["data"]["relocation_support"])
        self.assertEqual(len(create_response.json()["data"]["skill_requirements"]), 2)
        self.assertEqual(len(create_response.json()["data"]["language_requirements"]), 2)

        update_response = client.put(
            f"/api/v1/company/vacancies/{vacancy_id}",
            data=json.dumps(
                {
                    "title": "Platform Engineer",
                    "description": "Build hiring platform services and discovery flows.",
                    "employment_type": "full_time",
                    "experience_level": "senior",
                    "location": "Osaka",
                    "work_style": "remote",
                    "relocation_support": False,
                    "status": "active",
                    "required_skill_ids": [react_skill.id],
                    "preferred_skill_ids": [],
                    "language_requirements": [
                        {
                            "language": "english",
                            "minimum_level": "fluent",
                            "requirement_type": "required",
                        }
                    ],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(update_response.status_code, 200)
        vacancy = Vacancy.objects.get(pk=vacancy_id)
        self.assertEqual(vacancy.work_style, Vacancy.WorkStyle.REMOTE)
        self.assertFalse(vacancy.relocation_support)
        self.assertEqual(VacancySkillRequirement.objects.filter(vacancy=vacancy).count(), 1)
        self.assertTrue(
            VacancySkillRequirement.objects.filter(
                vacancy=vacancy,
                skill=react_skill,
                requirement_type=VacancySkillRequirement.RequirementType.REQUIRED,
            ).exists()
        )
        self.assertEqual(VacancyLanguageRequirement.objects.filter(vacancy=vacancy).count(), 1)
        self.assertTrue(
            VacancyLanguageRequirement.objects.filter(
                vacancy=vacancy,
                language=VacancyLanguageRequirement.Language.ENGLISH,
                minimum_level=VacancyLanguageRequirement.Level.FLUENT,
                requirement_type=VacancyLanguageRequirement.RequirementType.REQUIRED,
            ).exists()
        )

        list_response = client.get("/api/v1/company/vacancies")

        self.assertEqual(list_response.status_code, 200)
        available_skill_ids = {item["id"] for item in list_response.json()["data"]["available_skills"]}
        self.assertIn(python_skill.id, available_skill_ids)
        self.assertIn(react_skill.id, available_skill_ids)
        self.assertEqual(list_response.json()["data"]["vacancies"][0]["work_style"], "remote")

    def test_student_job_list_shows_only_active_visible_vacancies(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        inactive_company = Company.objects.create(name="Hiddenverse", is_active=False)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        hidden_company_user = User.objects.create_user(
            email="hidden@example.com",
            password="SecurePass123!",
            full_name="Hidden Company User",
            role=User.Role.COMPANY,
            company=inactive_company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
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
            company=company,
            created_by=company_user,
            title="Draft Engineer",
            description="Not visible.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.DRAFT,
        )
        Vacancy.objects.create(
            company=inactive_company,
            created_by=hidden_company_user,
            title="Hidden Engineer",
            description="Company is inactive.",
            employment_type="full_time",
            experience_level="junior",
            location="Osaka",
            status=Vacancy.Status.ACTIVE,
        )
        client = Client()
        client.force_login(student)

        response = client.get("/api/v1/student/jobs")

        self.assertEqual(response.status_code, 200)
        vacancies = response.json()["data"]["vacancies"]
        self.assertEqual(len(vacancies), 1)
        self.assertEqual(vacancies[0]["title"], "Backend Engineer")

    def test_company_user_cannot_access_student_job_list(self):
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

        response = client.get("/api/v1/student/jobs")

        self.assertEqual(response.status_code, 403)

    def test_student_job_filters_and_bookmarks_respect_visibility(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        hidden_company = Company.objects.create(name="Hiddenverse", is_active=False)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        hidden_company_user = User.objects.create_user(
            email="hidden@example.com",
            password="SecurePass123!",
            full_name="Hidden Company User",
            role=User.Role.COMPANY,
            company=hidden_company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        python_skill, _ = Skill.objects.get_or_create(name="Python")
        react_skill, _ = Skill.objects.get_or_create(name="React")
        matching_vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs with Python.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=True,
            status=Vacancy.Status.ACTIVE,
        )
        other_vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Frontend Engineer",
            description="Build UI with React.",
            employment_type="full_time",
            experience_level="mid",
            location="Osaka",
            work_style=Vacancy.WorkStyle.ONSITE,
            relocation_support=False,
            status=Vacancy.Status.ACTIVE,
        )
        hidden_vacancy = Vacancy.objects.create(
            company=hidden_company,
            created_by=hidden_company_user,
            title="Hidden Engineer",
            description="Should not be visible.",
            employment_type="full_time",
            experience_level="mid",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.REMOTE,
            relocation_support=False,
            status=Vacancy.Status.ACTIVE,
        )
        VacancySkillRequirement.objects.create(
            vacancy=matching_vacancy,
            skill=python_skill,
            requirement_type=VacancySkillRequirement.RequirementType.REQUIRED,
        )
        VacancySkillRequirement.objects.create(
            vacancy=other_vacancy,
            skill=react_skill,
            requirement_type=VacancySkillRequirement.RequirementType.REQUIRED,
        )
        VacancyLanguageRequirement.objects.create(
            vacancy=matching_vacancy,
            language=VacancyLanguageRequirement.Language.JAPANESE,
            minimum_level=VacancyLanguageRequirement.Level.BUSINESS,
            requirement_type=VacancyLanguageRequirement.RequirementType.REQUIRED,
        )
        VacancyLanguageRequirement.objects.create(
            vacancy=other_vacancy,
            language=VacancyLanguageRequirement.Language.ENGLISH,
            minimum_level=VacancyLanguageRequirement.Level.FLUENT,
            requirement_type=VacancyLanguageRequirement.RequirementType.REQUIRED,
        )

        client, csrf_token = self.csrf_client()
        client.force_login(student)

        filtered_response = client.get(
            "/api/v1/student/jobs?q=Backend&skills=python&languages=japanese&locations=Tokyo&work_styles=hybrid"
        )

        self.assertEqual(filtered_response.status_code, 200)
        vacancies = filtered_response.json()["data"]["vacancies"]
        self.assertEqual(len(vacancies), 1)
        self.assertEqual(vacancies[0]["vacancy_id"], matching_vacancy.id)
        self.assertFalse(vacancies[0]["is_bookmarked"])

        bookmark_response = client.post(
            f"/api/v1/student/jobs/{matching_vacancy.id}/bookmark",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        hidden_bookmark_response = client.post(
            f"/api/v1/student/jobs/{hidden_vacancy.id}/bookmark",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(bookmark_response.status_code, 201)
        self.assertEqual(hidden_bookmark_response.status_code, 404)
        self.assertTrue(JobBookmark.objects.filter(student=student, vacancy=matching_vacancy).exists())

        bookmarked_response = client.get(
            "/api/v1/student/jobs?q=Backend&skills=python&languages=japanese&locations=Tokyo&work_styles=hybrid"
        )

        self.assertEqual(bookmarked_response.status_code, 200)
        self.assertEqual(bookmarked_response.json()["data"]["bookmark_count"], 1)
        self.assertTrue(bookmarked_response.json()["data"]["vacancies"][0]["is_bookmarked"])

        remove_response = client.delete(
            f"/api/v1/student/jobs/{matching_vacancy.id}/bookmark",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(remove_response.status_code, 200)
        self.assertFalse(JobBookmark.objects.filter(student=student, vacancy=matching_vacancy).exists())

    def test_student_matches_rank_visible_jobs_deterministically(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        profile = StudentProfile.objects.create(
            user=student,
            desired_job_type="backend_engineer",
            desired_work_location="Tokyo",
            japanese_level="business",
            english_level="conversational",
        )
        python_skill, _ = Skill.objects.get_or_create(name="Python")
        django_skill, _ = Skill.objects.get_or_create(name="Django")
        StudentSkill.objects.create(student=student, skill=python_skill, proficiency_level="advanced")
        StudentSkill.objects.create(student=student, skill=django_skill, proficiency_level="intermediate")
        LearningRecord.objects.create(
            student=student,
            course_title="Backend Foundations",
            category="backend",
            progress_percent=100,
            status=LearningRecord.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        ExamResult.objects.create(
            student=student,
            exam_title="Backend Validation",
            category="backend",
            score_percent=88,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )

        strong_vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs in Tokyo.",
            employment_type="full_time",
            experience_level="mid",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=True,
            status=Vacancy.Status.ACTIVE,
        )
        possible_vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Platform Support Engineer",
            description="Support backend tools remotely.",
            employment_type="full_time",
            experience_level="junior",
            location="Osaka",
            work_style=Vacancy.WorkStyle.REMOTE,
            relocation_support=False,
            status=Vacancy.Status.ACTIVE,
        )
        hidden_vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Hidden Role",
            description="Draft role.",
            employment_type="full_time",
            experience_level="mid",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.ONSITE,
            relocation_support=False,
            status=Vacancy.Status.DRAFT,
        )
        VacancySkillRequirement.objects.create(
            vacancy=strong_vacancy,
            skill=python_skill,
            requirement_type=VacancySkillRequirement.RequirementType.REQUIRED,
        )
        VacancySkillRequirement.objects.create(
            vacancy=strong_vacancy,
            skill=django_skill,
            requirement_type=VacancySkillRequirement.RequirementType.PREFERRED,
        )
        VacancyLanguageRequirement.objects.create(
            vacancy=strong_vacancy,
            language=VacancyLanguageRequirement.Language.JAPANESE,
            minimum_level=VacancyLanguageRequirement.Level.BUSINESS,
            requirement_type=VacancyLanguageRequirement.RequirementType.REQUIRED,
        )
        VacancySkillRequirement.objects.create(
            vacancy=possible_vacancy,
            skill=python_skill,
            requirement_type=VacancySkillRequirement.RequirementType.PREFERRED,
        )
        VacancyLanguageRequirement.objects.create(
            vacancy=possible_vacancy,
            language=VacancyLanguageRequirement.Language.ENGLISH,
            minimum_level=VacancyLanguageRequirement.Level.CONVERSATIONAL,
            requirement_type=VacancyLanguageRequirement.RequirementType.PREFERRED,
        )
        VacancySkillRequirement.objects.create(
            vacancy=hidden_vacancy,
            skill=python_skill,
            requirement_type=VacancySkillRequirement.RequirementType.REQUIRED,
        )

        client = Client()
        client.force_login(student)

        response = client.get("/api/v1/student/matches")

        self.assertEqual(response.status_code, 200)
        matches = response.json()["data"]["matches"]
        self.assertEqual(len(matches), 2)
        self.assertEqual(matches[0]["vacancy_id"], strong_vacancy.id)
        self.assertGreater(matches[0]["match_score"], matches[1]["match_score"])
        self.assertEqual(matches[0]["match_level"], "Strong Match")
        self.assertNotIn(hidden_vacancy.id, [item["vacancy_id"] for item in matches])
        self.assertTrue(matches[0]["can_apply"])
        self.assertIn("skill", matches[0]["factor_breakdown"])

    def test_company_vacancy_matches_create_privacy_safe_match_contexts(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs in Tokyo.",
            employment_type="full_time",
            experience_level="mid",
            location="Tokyo",
            work_style=Vacancy.WorkStyle.HYBRID,
            relocation_support=True,
            status=Vacancy.Status.ACTIVE,
        )
        python_skill, _ = Skill.objects.get_or_create(name="Python")
        VacancySkillRequirement.objects.create(
            vacancy=vacancy,
            skill=python_skill,
            requirement_type=VacancySkillRequirement.RequirementType.REQUIRED,
        )
        VacancyLanguageRequirement.objects.create(
            vacancy=vacancy,
            language=VacancyLanguageRequirement.Language.JAPANESE,
            minimum_level=VacancyLanguageRequirement.Level.BUSINESS,
            requirement_type=VacancyLanguageRequirement.RequirementType.REQUIRED,
        )

        visible_student = User.objects.create_user(
            email="visible@example.com",
            password="SecurePass123!",
            full_name="Visible Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(
            user=visible_student,
            desired_job_type="backend_engineer",
            desired_work_location="Tokyo",
            japanese_level="business",
            english_level="conversational",
        )
        StudentSkill.objects.create(student=visible_student, skill=python_skill, proficiency_level="advanced")
        LearningRecord.objects.create(
            student=visible_student,
            course_title="Backend Foundations",
            category="backend",
            progress_percent=100,
            status=LearningRecord.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        ExamResult.objects.create(
            student=visible_student,
            exam_title="Backend Validation",
            category="backend",
            score_percent=92,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )

        private_student = User.objects.create_user(
            email="private@example.com",
            password="SecurePass123!",
            full_name="Private Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(
            user=private_student,
            desired_job_type="backend_engineer",
            desired_work_location="Tokyo",
            japanese_level="business",
            english_level="business",
        )
        StudentSkill.objects.create(student=private_student, skill=python_skill, proficiency_level="advanced")
        StudentVisibilitySettings.objects.create(
            student=private_student,
            share_profile_preview=False,
            share_learning_record=False,
            share_exam_results=False,
        )

        low_student = User.objects.create_user(
            email="low@example.com",
            password="SecurePass123!",
            full_name="Low Match Student",
            role=User.Role.STUDENT,
        )
        StudentProfile.objects.create(
            user=low_student,
            desired_job_type="designer",
            desired_work_location="Osaka",
            japanese_level="basic",
            english_level="basic",
        )

        client = Client()
        client.force_login(company_user)

        response = client.get(f"/api/v1/company/vacancies/{vacancy.id}/matches")
        candidates_response = client.get("/api/v1/company/candidates")

        self.assertEqual(response.status_code, 200)
        matches = response.json()["data"]["matches"]
        self.assertEqual(len(matches), 2)
        self.assertEqual(matches[0]["display_name"], "Visible Student")
        private_match = next(item for item in matches if item["student_id"] == private_student.id)
        self.assertEqual(private_match["display_name"], "Private candidate")
        self.assertEqual(private_match["top_skills"], [])
        self.assertTrue(private_match["candidate_access_id"])
        self.assertTrue(
            CandidateReviewAccess.objects.filter(
                company=company,
                student=visible_student,
                source=CandidateReviewAccess.Source.MATCH,
                is_active=True,
            ).exists()
        )
        self.assertFalse(
            CandidateReviewAccess.objects.filter(
                company=company,
                student=low_student,
                source=CandidateReviewAccess.Source.MATCH,
                is_active=True,
            ).exists()
        )
        self.assertEqual(candidates_response.status_code, 200)
        self.assertIn("match", [candidate["source"] for candidate in candidates_response.json()["data"]["candidates"]])

    def test_student_can_apply_and_view_application_history(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        create_response = client.post(
            "/api/v1/student/applications",
            data=json.dumps({"vacancy_id": vacancy.id}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        list_response = client.get("/api/v1/student/applications")

        self.assertEqual(create_response.status_code, 201)
        body = create_response.json()["data"]
        self.assertEqual(body["status"], Application.Status.SUBMITTED)
        self.assertEqual(len(body["history"]), 1)
        self.assertEqual(body["history"][0]["to_status"], Application.Status.SUBMITTED)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json()["data"]["application_count"], 1)
        self.assertTrue(
            CandidateReviewAccess.objects.filter(
                company=company,
                student=student,
                source=CandidateReviewAccess.Source.APPLICATION,
                is_active=True,
            ).exists()
        )
        self.assertEqual(
            Notification.objects.filter(
                entity_type="application",
                entity_id=Application.objects.get(student=student, vacancy=vacancy).id,
                notification_type=Notification.Type.APPLICATION_SUBMITTED,
            ).count(),
            2,
        )
        self.assertEqual(
            NotificationDelivery.objects.filter(
                notification__entity_type="application",
                notification__entity_id=Application.objects.get(student=student, vacancy=vacancy).id,
                notification__notification_type=Notification.Type.APPLICATION_SUBMITTED,
                channel=NotificationDelivery.Channel.EMAIL,
            ).count(),
            2,
        )

    def test_student_application_rejects_duplicate_active_submission(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        Application.objects.create(company=company, vacancy=vacancy, student=student, status=Application.Status.SUBMITTED)
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        response = client.post(
            "/api/v1/student/applications",
            data=json.dumps({"vacancy_id": vacancy.id}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("vacancy_id", response.json()["error"]["details"])

    def test_student_can_withdraw_application(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        application = Application.objects.create(
            company=company,
            vacancy=vacancy,
            student=student,
            status=Application.Status.SUBMITTED,
        )
        ApplicationStatusHistory.objects.create(
            application=application,
            actor=student,
            from_status="",
            to_status=Application.Status.SUBMITTED,
            note="Application submitted by student.",
        )
        CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
            is_active=True,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        response = client.post(
            f"/api/v1/student/applications/{application.id}/withdraw",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.status, Application.Status.WITHDRAWN)
        self.assertEqual(application.history.count(), 2)
        self.assertFalse(
            CandidateReviewAccess.objects.get(
                company=company,
                student=student,
                source=CandidateReviewAccess.Source.APPLICATION,
            ).is_active
        )
        self.assertEqual(
            Notification.objects.filter(
                entity_type="application",
                entity_id=application.id,
                notification_type=Notification.Type.APPLICATION_WITHDRAWN,
            ).count(),
            2,
        )

    def test_company_can_view_and_shortlist_applications(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
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
        vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        application = Application.objects.create(
            company=company,
            vacancy=vacancy,
            student=student,
            status=Application.Status.SUBMITTED,
        )
        ApplicationStatusHistory.objects.create(
            application=application,
            actor=student,
            from_status="",
            to_status=Application.Status.SUBMITTED,
            note="Application submitted by student.",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        list_response = client.get("/api/v1/company/applications")
        shortlist_response = client.post(
            f"/api/v1/company/applications/{application.id}/shortlist",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json()["data"]["application_count"], 1)
        self.assertEqual(list_response.json()["data"]["applications"][0]["display_name"], "Student User")
        self.assertEqual(shortlist_response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.status, Application.Status.SHORTLISTED)
        candidate_access = CandidateReviewAccess.objects.get(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
        )
        self.assertTrue(CandidateShortlist.objects.filter(candidate_access=candidate_access).exists())
        self.assertEqual(
            Notification.objects.filter(
                entity_type="application",
                entity_id=application.id,
                notification_type=Notification.Type.APPLICATION_SHORTLISTED,
            ).count(),
            2,
        )
        self.assertEqual(
            NotificationDelivery.objects.filter(
                notification__entity_type="application",
                notification__entity_id=application.id,
                notification__notification_type=Notification.Type.APPLICATION_SHORTLISTED,
                channel=NotificationDelivery.Channel.EMAIL,
            ).count(),
            2,
        )

    def test_company_can_reject_application(self):
        company = Company.objects.create(name="Softverse", is_active=True)
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        vacancy = Vacancy.objects.create(
            company=company,
            created_by=company_user,
            title="Backend Engineer",
            description="Build APIs.",
            employment_type="full_time",
            experience_level="junior",
            location="Tokyo",
            status=Vacancy.Status.ACTIVE,
        )
        application = Application.objects.create(
            company=company,
            vacancy=vacancy,
            student=student,
            status=Application.Status.SUBMITTED,
        )
        ApplicationStatusHistory.objects.create(
            application=application,
            actor=student,
            from_status="",
            to_status=Application.Status.SUBMITTED,
            note="Application submitted by student.",
        )
        CandidateReviewAccess.objects.create(
            company=company,
            student=student,
            source=CandidateReviewAccess.Source.APPLICATION,
            is_active=True,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(company_user)

        response = client.post(
            f"/api/v1/company/applications/{application.id}/reject",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.status, Application.Status.REJECTED)
        self.assertFalse(
            CandidateReviewAccess.objects.get(
                company=company,
                student=student,
                source=CandidateReviewAccess.Source.APPLICATION,
            ).is_active
        )
        self.assertEqual(
            Notification.objects.filter(
                entity_type="application",
                entity_id=application.id,
                notification_type=Notification.Type.APPLICATION_REJECTED,
            ).count(),
            2,
        )

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
        body = response.json()["data"]
        self.assertEqual(len(body["vacancies"]), 1)
        self.assertEqual(body["companies"][0]["name"], "Softverse")
        self.assertEqual(body["company_users"][0]["email"], "company@example.com")

    def test_admin_can_create_update_and_retire_vacancy(self):
        company = Company.objects.create(name="Softverse")
        other_company = Company.objects.create(name="Otherverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        other_company_user = User.objects.create_user(
            email="other@example.com",
            password="SecurePass123!",
            full_name="Other Company User",
            role=User.Role.COMPANY,
            company=other_company,
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        create_response = client.post(
            "/api/v1/admin/vacancies",
            data=json.dumps(
                {
                    "company_id": company.id,
                    "created_by_id": company_user.id,
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
            f"/api/v1/admin/vacancies/{vacancy_id}",
            data=json.dumps(
                {
                    "company_id": other_company.id,
                    "created_by_id": other_company_user.id,
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
            f"/api/v1/admin/vacancies/{vacancy_id}",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        vacancy = Vacancy.objects.get(pk=vacancy_id)
        self.assertEqual(vacancy.company, other_company)
        self.assertEqual(vacancy.created_by, other_company_user)
        self.assertEqual(vacancy.title, "Backend Engineer Updated")
        self.assertEqual(vacancy.status, Vacancy.Status.INACTIVE)

    def test_admin_vacancy_create_rejects_cross_company_creator(self):
        company = Company.objects.create(name="Softverse")
        other_company = Company.objects.create(name="Otherverse")
        other_company_user = User.objects.create_user(
            email="other@example.com",
            password="SecurePass123!",
            full_name="Other Company User",
            role=User.Role.COMPANY,
            company=other_company,
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="SecurePass123!",
            full_name="Admin User",
        )
        client, csrf_token = self.csrf_client()
        client.force_login(admin)

        response = client.post(
            "/api/v1/admin/vacancies",
            data=json.dumps(
                {
                    "company_id": company.id,
                    "created_by_id": other_company_user.id,
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

        self.assertEqual(response.status_code, 400)
        self.assertIn("created_by_id", response.json()["error"]["details"])

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
                    "about_me": "Backend-focused student.",
                    "profile_image": "data:image/png;base64,profile",
                    "cover_image": "data:image/png;base64,cover",
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
        self.assertEqual(profile.about_me, "Backend-focused student.")
        self.assertEqual(profile.profile_image, "data:image/png;base64,profile")
        self.assertEqual(profile.cover_image, "data:image/png;base64,cover")
        self.assertTrue(response.json()["data"]["profile_complete"])

    def test_student_profile_get_includes_extension_sections(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        profile = StudentProfile.objects.create(
            user=user,
            about_me="Focused on backend engineering.",
            profile_image="data:image/png;base64,profile",
            cover_image="data:image/png;base64,cover",
        )
        skill, _ = Skill.objects.get_or_create(name="Python")
        StudentEducation.objects.create(
            student=user,
            institution="Softlearn University",
            field_of_study="Computer Science",
            start_date="2022-01-01",
            completion_status=StudentEducation.CompletionStatus.IN_PROGRESS,
            grade="A",
            activities="Tech club",
            description="Studied backend development.",
        )
        education = StudentEducation.objects.get(student=user)
        education.skills.add(skill)
        StudentExperience.objects.create(
            student=user,
            organization="Softverse",
            role_title="Intern",
            experience_type=StudentExperience.ExperienceType.INTERNSHIP,
            start_date="2024-01-01",
            summary="Worked on student-facing flows.",
        )
        experience = StudentExperience.objects.get(student=user)
        experience.skills.add(skill)
        certificate = StudentCertificate.objects.create(
            student=user,
            name="Cloud Basics",
            issuer="Softlearn Academy",
            issue_date="2024-06-01",
            credential_id="CERT-1",
            credential_url="https://example.com/certificates/1",
            description="Foundational cloud certification.",
        )
        certificate.skills.add(skill)
        StudentResume.objects.create(
            student=user,
            display_name="Main Resume",
            file_name="resume.pdf",
            source_type=StudentResume.SourceType.UPLOADED,
            is_active=True,
        )
        StudentAvailabilityProfile.objects.create(
            student=user,
            job_search_status=StudentAvailabilityProfile.JobSearchStatus.OPEN_TO_OFFERS,
            earliest_start_date="2025-06-01",
            interview_availability="Weekday evenings",
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/v1/student/profile")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        profile.refresh_from_db()
        self.assertEqual(body["about_me"], profile.about_me)
        self.assertEqual(body["profile_image"], profile.profile_image)
        self.assertEqual(body["cover_image"], profile.cover_image)
        self.assertEqual(len(body["education_records"]), 1)
        self.assertEqual(len(body["experience_records"]), 1)
        self.assertEqual(len(body["certificates"]), 1)
        self.assertEqual(body["education_records"][0]["grade"], "A")
        self.assertEqual(body["education_records"][0]["skill_ids"], [skill.id])
        self.assertEqual(body["experience_records"][0]["skill_ids"], [skill.id])
        self.assertEqual(body["certificates"][0]["credential_id"], "CERT-1")
        self.assertEqual(len(body["resumes"]), 1)
        self.assertTrue(body["availability"]["availability_set"])
        self.assertTrue(body["profile_extension_summary"]["has_active_resume"])

    def test_student_can_create_update_and_delete_education_record(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)
        skill, _ = Skill.objects.get_or_create(name="React")

        create_response = client.post(
            "/api/v1/student/profile/education",
            data=json.dumps(
                {
                    "institution": "Softlearn University",
                    "field_of_study": "Computer Science",
                    "start_date": "2022-01-01",
                    "completion_status": "in_progress",
                    "grade": "A-",
                    "activities": "Robotics Club",
                    "description": "Built student projects.",
                    "skill_ids": [skill.id],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(create_response.status_code, 201)
        record = StudentEducation.objects.get(student=user)
        self.assertEqual(record.grade, "A-")
        self.assertEqual(list(record.skills.values_list("id", flat=True)), [skill.id])

        update_response = client.put(
            f"/api/v1/student/profile/education/{record.id}",
            data=json.dumps(
                {
                    "institution": "Softlearn University",
                    "field_of_study": "Software Engineering",
                    "start_date": "2022-01-01",
                    "end_date": "2025-01-01",
                    "completion_status": "completed",
                    "grade": "A",
                    "activities": "Engineering society",
                    "description": "Completed capstone work.",
                    "skill_ids": [],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(update_response.status_code, 200)
        record.refresh_from_db()
        self.assertEqual(record.field_of_study, "Software Engineering")
        self.assertEqual(record.completion_status, StudentEducation.CompletionStatus.COMPLETED)
        self.assertEqual(record.grade, "A")
        self.assertFalse(record.skills.exists())

        delete_response = client.delete(
            f"/api/v1/student/profile/education/{record.id}",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(StudentEducation.objects.filter(student=user).exists())

    def test_student_can_manage_experience_and_availability(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)
        skill, _ = Skill.objects.get_or_create(name="Django")

        experience_response = client.post(
            "/api/v1/student/profile/experience",
            data=json.dumps(
                {
                    "organization": "Softverse",
                    "role_title": "Backend Intern",
                    "experience_type": "internship",
                    "start_date": "2024-01-01",
                    "is_current": True,
                    "summary": "Built API endpoints.",
                    "skill_ids": [skill.id],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(experience_response.status_code, 201)
        experience = StudentExperience.objects.get(student=user)
        self.assertEqual(list(experience.skills.values_list("id", flat=True)), [skill.id])

        availability_response = client.put(
            "/api/v1/student/profile/availability",
            data=json.dumps(
                {
                    "job_search_status": "actively_looking",
                    "earliest_start_date": "2025-05-01",
                    "interview_availability": "Weekdays after 6 PM",
                    "scheduling_notes": "Can adjust for final rounds.",
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(availability_response.status_code, 200)
        availability = StudentAvailabilityProfile.objects.get(student=user)
        self.assertEqual(availability.job_search_status, StudentAvailabilityProfile.JobSearchStatus.ACTIVELY_LOOKING)
        self.assertTrue(availability.availability_set)

    def test_student_can_manage_certificates(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)
        skill, _ = Skill.objects.get_or_create(name="AWS")

        create_response = client.post(
            "/api/v1/student/profile/certificates",
            data=json.dumps(
                {
                    "name": "AWS Cloud Practitioner",
                    "issuer": "AWS",
                    "issue_date": "2024-05-01",
                    "credential_id": "AWS-123",
                    "credential_url": "https://example.com/aws-123",
                    "description": "Entry cloud certification.",
                    "skill_ids": [skill.id],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(create_response.status_code, 201)
        certificate = StudentCertificate.objects.get(student=user)
        self.assertEqual(certificate.credential_id, "AWS-123")
        self.assertEqual(list(certificate.skills.values_list("id", flat=True)), [skill.id])

        update_response = client.put(
            f"/api/v1/student/profile/certificates/{certificate.id}",
            data=json.dumps(
                {
                    "name": "AWS Cloud Practitioner",
                    "issuer": "AWS Training",
                    "issue_date": "2024-05-01",
                    "expiry_date": "2027-05-01",
                    "credential_id": "AWS-999",
                    "credential_url": "https://example.com/aws-999",
                    "description": "Updated certification details.",
                    "skill_ids": [],
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(update_response.status_code, 200)
        certificate.refresh_from_db()
        self.assertEqual(certificate.issuer, "AWS Training")
        self.assertEqual(certificate.credential_id, "AWS-999")
        self.assertFalse(certificate.skills.exists())

        delete_response = client.delete(
            f"/api/v1/student/profile/certificates/{certificate.id}",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(StudentCertificate.objects.filter(student=user).exists())

    def test_student_resume_management_keeps_single_active_resume(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(user)

        first_response = client.post(
            "/api/v1/student/profile/resumes",
            data=json.dumps(
                {
                    "display_name": "Primary Resume",
                    "file_name": "resume-v1.pdf",
                    "source_type": "uploaded",
                    "is_active": True,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(first_response.status_code, 201)
        first_resume = StudentResume.objects.get(student=user, file_name="resume-v1.pdf")

        second_response = client.post(
            "/api/v1/student/profile/resumes",
            data=json.dumps(
                {
                    "display_name": "Updated Resume",
                    "file_name": "resume-v2.pdf",
                    "source_type": "manual",
                    "is_active": True,
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(second_response.status_code, 201)
        first_resume.refresh_from_db()
        second_resume = StudentResume.objects.get(student=user, file_name="resume-v2.pdf")
        self.assertFalse(first_resume.is_active)
        self.assertTrue(second_resume.is_active)

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
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        LearningRecord.objects.create(
            student=user,
            course=course,
            course_title="Old Backend Foundations",
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
        linked_record = next(item for item in body["records"] if item["course_id"] == course.id)
        self.assertEqual(linked_record["course_title"], "Backend Foundations")

    def test_student_courses_list_only_shows_active_courses(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        active_course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        Course.objects.create(
            title="Hidden Draft",
            description="Draft path",
            category="backend",
            difficulty_level="advanced",
            estimated_hours=8,
            status=Course.Status.DRAFT,
        )

        client = Client()
        client.force_login(student)
        response = client.get("/api/v1/student/courses")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["result_count"], 1)
        self.assertEqual(body["courses"][0]["course_id"], active_course.id)
        self.assertEqual(body["courses"][0]["detail_href"], f"/student/courses/{active_course.id}")

    def test_student_course_detail_includes_lessons_and_enrollment_state(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        Lesson.objects.create(
            course=course,
            title="Intro",
            summary="Start here",
            content="Lesson content",
            sequence_number=1,
            status=Lesson.Status.ACTIVE,
        )
        Lesson.objects.create(
            course=course,
            title="Draft Lesson",
            summary="Hidden",
            content="Hidden content",
            sequence_number=2,
            status=Lesson.Status.DRAFT,
        )

        client = Client()
        client.force_login(student)
        response = client.get(f"/api/v1/student/courses/{course.id}")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertFalse(body["enrollment"]["is_enrolled"])
        self.assertEqual(len(body["lessons"]), 1)
        self.assertEqual(body["lessons"][0]["title"], "Intro")
        self.assertFalse(body["lessons"][0]["is_accessible"])

    def test_student_course_enrollment_creates_single_learning_record(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        Lesson.objects.create(
            course=course,
            title="Intro",
            summary="Start here",
            content="Lesson content",
            sequence_number=1,
            status=Lesson.Status.ACTIVE,
        )
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        first_response = client.post(
            f"/api/v1/student/courses/{course.id}/enrollment",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        second_response = client.post(
            f"/api/v1/student/courses/{course.id}/enrollment",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(second_response.status_code, 200)
        self.assertTrue(first_response.json()["data"]["created"])
        self.assertFalse(second_response.json()["data"]["created"])
        self.assertEqual(LearningRecord.objects.filter(student=student, course=course).count(), 1)
        self.assertEqual(LessonProgress.objects.filter(learning_record__student=student, lesson__course=course).count(), 1)

    def test_student_course_detail_requires_active_course(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        active_course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        inactive_course = Course.objects.create(
            title="Retired Course",
            description="Retired path",
            category="backend",
            difficulty_level="advanced",
            estimated_hours=6,
            status=Course.Status.INACTIVE,
        )

        client = Client()
        client.force_login(student)

        active_response = client.get(f"/api/v1/student/courses/{active_course.id}")
        inactive_response = client.get(f"/api/v1/student/courses/{inactive_course.id}")

        self.assertEqual(active_response.status_code, 200)
        self.assertEqual(active_response.json()["data"]["course_id"], active_course.id)
        self.assertEqual(inactive_response.status_code, 404)

    def test_student_must_enroll_before_viewing_lesson(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        lesson = Lesson.objects.create(
            course=course,
            title="Intro",
            summary="Start here",
            content="Lesson content",
            sequence_number=1,
            status=Lesson.Status.ACTIVE,
        )

        client = Client()
        client.force_login(student)
        response = client.get(f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}")

        self.assertEqual(response.status_code, 403)

    def test_student_can_update_lesson_progress_and_complete_course(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )
        lesson_one = Lesson.objects.create(
            course=course,
            title="Intro",
            summary="Start here",
            content="Lesson content",
            sequence_number=1,
            status=Lesson.Status.ACTIVE,
        )
        lesson_two = Lesson.objects.create(
            course=course,
            title="Routing",
            summary="Keep going",
            content="Routing content",
            sequence_number=2,
            status=Lesson.Status.ACTIVE,
        )
        learning_record = LearningRecord.objects.create(
            student=student,
            course=course,
            course_title=course.title,
            category=course.category,
            progress_percent=0,
            status=LearningRecord.Status.NOT_STARTED,
        )
        LessonProgress.objects.create(learning_record=learning_record, lesson=lesson_one)
        LessonProgress.objects.create(learning_record=learning_record, lesson=lesson_two)
        client, csrf_token = self.csrf_client()
        client.force_login(student)

        first_update = client.put(
            f"/api/v1/student/courses/{course.id}/lessons/{lesson_one.id}/progress",
            data=json.dumps({"status": "in_progress"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        second_update = client.put(
            f"/api/v1/student/courses/{course.id}/lessons/{lesson_one.id}/progress",
            data=json.dumps({"status": "completed"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        third_update = client.put(
            f"/api/v1/student/courses/{course.id}/lessons/{lesson_two.id}/progress",
            data=json.dumps({"status": "completed"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(first_update.status_code, 200)
        self.assertEqual(second_update.status_code, 200)
        self.assertEqual(third_update.status_code, 200)
        learning_record.refresh_from_db()
        self.assertEqual(learning_record.status, LearningRecord.Status.COMPLETED)
        self.assertEqual(learning_record.progress_percent, 100)
        self.assertIsNotNone(learning_record.completed_at)
        self.assertEqual(third_update.json()["data"]["enrollment"]["completed_lesson_count"], 2)

    def test_company_user_cannot_access_student_courses(self):
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
        response = client.get("/api/v1/student/courses")

        self.assertEqual(response.status_code, 403)

    def test_company_user_cannot_enroll_in_student_course(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        course = Course.objects.create(
            title="Backend Foundations",
            description="Backend path",
            category="backend",
            difficulty_level="beginner",
            estimated_hours=12,
            status=Course.Status.ACTIVE,
        )

        client, csrf_token = self.csrf_client()
        client.force_login(company_user)
        response = client.post(
            f"/api/v1/student/courses/{course.id}/enrollment",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 403)

    def test_student_exam_results_returns_summary(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        exam = Exam.objects.create(
            title="Python Basics Exam",
            description="Programming validation",
            category="programming",
            duration_minutes=30,
            passing_score_percent=80,
            question_count=15,
            status=Exam.Status.ACTIVE,
        )
        ExamResult.objects.create(
            student=user,
            exam=exam,
            exam_title="Old Python Basics Exam",
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
        self.assertEqual(len(body["available_exams"]), 1)
        linked_result = next(item for item in body["results"] if item["exam_id"] == exam.id)
        self.assertEqual(linked_result["exam_title"], "Python Basics Exam")

    def test_student_can_load_exam_detail_and_submit_scored_attempt(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        exam = Exam.objects.create(
            title="Python Basics Exam",
            description="Programming validation",
            category="programming",
            duration_minutes=30,
            passing_score_percent=50,
            question_count=0,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )
        question_one = ExamQuestion.objects.create(
            exam=exam,
            prompt="Which keyword defines a function?",
            instructions="Pick one answer.",
            sequence_number=1,
            points=1,
            status=ExamQuestion.Status.ACTIVE,
        )
        question_two = ExamQuestion.objects.create(
            exam=exam,
            prompt="Which collection is mutable?",
            instructions="Pick one answer.",
            sequence_number=2,
            points=1,
            status=ExamQuestion.Status.ACTIVE,
        )
        option_one_correct = ExamAnswerOption.objects.create(
            question=question_one,
            option_text="def",
            sequence_number=1,
            is_correct=True,
        )
        ExamAnswerOption.objects.create(
            question=question_one,
            option_text="func",
            sequence_number=2,
            is_correct=False,
        )
        ExamAnswerOption.objects.create(
            question=question_two,
            option_text="tuple",
            sequence_number=1,
            is_correct=False,
        )
        option_two_correct = ExamAnswerOption.objects.create(
            question=question_two,
            option_text="list",
            sequence_number=2,
            is_correct=True,
        )

        client, csrf_token = self.csrf_client()
        client.force_login(student)

        detail_response = client.get(f"/api/v1/student/exams/{exam.id}")
        submit_response = client.post(
            f"/api/v1/student/exams/{exam.id}/submit",
            data=json.dumps(
                {
                    "answers": [
                        {"question_id": question_one.id, "selected_option_id": option_one_correct.id},
                        {"question_id": question_two.id, "selected_option_id": option_two_correct.id},
                    ]
                }
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["data"]["question_count"], 2)
        self.assertEqual(submit_response.status_code, 201)
        attempt = ExamAttempt.objects.get(student=student, exam=exam)
        result = ExamResult.objects.get(student=student, exam=exam)
        self.assertEqual(attempt.status, ExamAttempt.Status.SCORED)
        self.assertEqual(attempt.score_percent, 100)
        self.assertTrue(attempt.passed)
        self.assertEqual(result.attempt_id, attempt.id)
        self.assertEqual(ExamAttemptAnswer.objects.filter(attempt=attempt).count(), 2)

    def test_student_exam_retake_policy_blocks_after_pass(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        exam = Exam.objects.create(
            title="Python Basics Exam",
            description="Programming validation",
            category="programming",
            duration_minutes=30,
            passing_score_percent=80,
            question_count=1,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )
        ExamResult.objects.create(
            student=student,
            exam=exam,
            exam_title=exam.title,
            category=exam.category,
            score_percent=92,
            passed=True,
            attempt_number=1,
            taken_at=timezone.now(),
        )

        client = Client()
        client.force_login(student)
        response = client.get(f"/api/v1/student/exams/{exam.id}")

        self.assertEqual(response.status_code, 403)

    def test_company_user_cannot_open_student_exam(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        exam = Exam.objects.create(
            title="Python Basics Exam",
            description="Programming validation",
            category="programming",
            duration_minutes=30,
            passing_score_percent=80,
            question_count=1,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )

        client = Client()
        client.force_login(company_user)
        response = client.get(f"/api/v1/student/exams/{exam.id}")

        self.assertEqual(response.status_code, 403)

    def test_student_preparation_summary_returns_categories_study_plan_and_performance(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        course = Course.objects.create(
            title="Python Prep",
            description="Study fundamentals",
            category="programming",
            difficulty_level="beginner",
            estimated_hours=10,
            status=Course.Status.ACTIVE,
        )
        LearningRecord.objects.create(
            student=student,
            course=course,
            course_title=course.title,
            category=course.category,
            progress_percent=50,
            status=LearningRecord.Status.IN_PROGRESS,
        )
        exam = Exam.objects.create(
            title="Python Mock",
            description="Practice exam",
            category="programming",
            duration_minutes=20,
            passing_score_percent=70,
            question_count=0,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )
        question = ExamQuestion.objects.create(
            exam=exam,
            prompt="Which keyword defines a class?",
            instructions="Pick one answer.",
            sequence_number=1,
            points=1,
            status=ExamQuestion.Status.ACTIVE,
        )
        correct_option = ExamAnswerOption.objects.create(
            question=question,
            option_text="class",
            sequence_number=1,
            is_correct=True,
        )
        PracticeQuestionAttempt.objects.create(
            student=student,
            exam=exam,
            question=question,
            selected_option=correct_option,
            is_correct=True,
        )
        MockExamAttempt.objects.create(
            student=student,
            exam=exam,
            exam_title=exam.title,
            category=exam.category,
            attempt_number=1,
            score_percent=88,
            correct_answer_count=1,
            total_questions=1,
            started_at=timezone.now() - timedelta(minutes=5),
            submitted_at=timezone.now(),
        )

        client = Client()
        client.force_login(student)
        response = client.get("/api/v1/student/preparation-summary")

        self.assertEqual(response.status_code, 200)
        body = response.json()["data"]
        self.assertEqual(body["student_id"], student.id)
        self.assertEqual(len(body["categories"]), 1)
        self.assertEqual(body["categories"][0]["category"], "programming")
        self.assertEqual(body["study_plan"]["items"][0]["category"], "programming")
        self.assertEqual(body["performance"]["practice_attempt_count"], 1)
        self.assertEqual(body["performance"]["recent_mock_score"], 88)

    def test_student_can_submit_practice_attempt_without_creating_official_exam_result(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        exam = Exam.objects.create(
            title="Networking Prep",
            description="Question bank",
            category="infrastructure",
            duration_minutes=20,
            passing_score_percent=70,
            question_count=0,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )
        question = ExamQuestion.objects.create(
            exam=exam,
            prompt="Which protocol secures web traffic?",
            instructions="Pick one answer.",
            sequence_number=1,
            points=1,
            status=ExamQuestion.Status.ACTIVE,
        )
        correct_option = ExamAnswerOption.objects.create(
            question=question,
            option_text="HTTPS",
            sequence_number=1,
            is_correct=True,
        )
        wrong_option = ExamAnswerOption.objects.create(
            question=question,
            option_text="FTP",
            sequence_number=2,
            is_correct=False,
        )

        client, csrf_token = self.csrf_client()
        client.force_login(student)
        response = client.post(
            f"/api/v1/student/practice-questions/{question.id}/attempt",
            data=json.dumps({"selected_option_id": wrong_option.id}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(PracticeQuestionAttempt.objects.filter(student=student, question=question).count(), 1)
        self.assertEqual(ExamResult.objects.filter(student=student, exam=exam).count(), 0)
        self.assertFalse(response.json()["data"]["is_correct"])
        self.assertEqual(response.json()["data"]["correct_option_id"], correct_option.id)

    def test_student_can_submit_mock_exam_without_affecting_official_exam_history(self):
        student = User.objects.create_user(
            email="student@example.com",
            password="SecurePass123!",
            full_name="Student User",
            role=User.Role.STUDENT,
        )
        exam = Exam.objects.create(
            title="Frontend Mock",
            description="Mock exam",
            category="frontend",
            duration_minutes=25,
            passing_score_percent=50,
            question_count=0,
            max_attempts=3,
            status=Exam.Status.ACTIVE,
        )
        question = ExamQuestion.objects.create(
            exam=exam,
            prompt="Which hook manages state?",
            instructions="Pick one answer.",
            sequence_number=1,
            points=1,
            status=ExamQuestion.Status.ACTIVE,
        )
        correct_option = ExamAnswerOption.objects.create(
            question=question,
            option_text="useState",
            sequence_number=1,
            is_correct=True,
        )
        ExamAnswerOption.objects.create(
            question=question,
            option_text="useRoute",
            sequence_number=2,
            is_correct=False,
        )

        client, csrf_token = self.csrf_client()
        client.force_login(student)
        detail_response = client.get(f"/api/v1/student/mock-exams/{exam.id}")
        submit_response = client.post(
            f"/api/v1/student/mock-exams/{exam.id}/submit",
            data=json.dumps({"answers": [{"question_id": question.id, "selected_option_id": correct_option.id}]}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(submit_response.status_code, 201)
        attempt = MockExamAttempt.objects.get(student=student, exam=exam)
        self.assertEqual(attempt.score_percent, 100)
        self.assertEqual(MockExamAttemptAnswer.objects.filter(attempt=attempt).count(), 1)
        self.assertEqual(ExamResult.objects.filter(student=student, exam=exam).count(), 0)

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
