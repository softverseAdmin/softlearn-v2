import json

from django.core.exceptions import ValidationError
from django.test import Client, TestCase

from users.models import Company, StudentProfile, User


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
            data=json.dumps({"email": "student@example.com", "password": "wrong-password"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"]["code"], "INVALID_CREDENTIALS")

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
        self.assertTrue(response.json()["data"]["profile_complete"])

    def test_company_profile_put_updates_name(self):
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
            data=json.dumps({"name": "Softverse Japan"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        company.refresh_from_db()
        self.assertEqual(company.name, "Softverse Japan")

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
