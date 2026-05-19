from django.db import IntegrityError
from django.test import TestCase

from django.utils import timezone

from users.models import Application, Company, ScheduledTask, User, Vacancy


class ModelIndexTests(TestCase):
    def test_vacancy_has_hot_path_indexes(self):
        index_names = {index.name for index in Vacancy._meta.indexes}

        self.assertIn("vacancy_company_status_idx", index_names)
        self.assertIn("vacancy_status_updated_idx", index_names)

    def test_application_has_hot_path_indexes(self):
        index_names = {index.name for index in Application._meta.indexes}

        self.assertIn("application_student_status_idx", index_names)
        self.assertIn("application_company_status_idx", index_names)
        self.assertIn("application_vacancy_status_idx", index_names)
        self.assertIn("app_student_vacancy_idx", index_names)


class ModelStringRepresentationTests(TestCase):
    def test_scheduled_task_string_uses_task_fields(self):
        task = ScheduledTask.objects.create(
            task_type=ScheduledTask.TaskType.CLEANUP_EXPORTS,
            schedule=ScheduledTask.Schedule.DAILY,
            next_run=timezone.now(),
        )

        self.assertEqual(str(task), "ScheduledTask<cleanup_exports:daily>")


class ModelConstraintTests(TestCase):
    def test_application_enforces_unique_active_student_vacancy_constraint(self):
        company = Company.objects.create(name="Softverse")
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

        with self.assertRaises(IntegrityError):
            Application.objects.create(company=company, vacancy=vacancy, student=student, status=Application.Status.UNDER_REVIEW)

    def test_application_allows_reapply_after_terminal_status(self):
        company = Company.objects.create(name="Softverse")
        company_user = User.objects.create_user(
            email="company-reapply@example.com",
            password="SecurePass123!",
            full_name="Company User",
            role=User.Role.COMPANY,
            company=company,
        )
        student = User.objects.create_user(
            email="student-reapply@example.com",
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
        Application.objects.create(company=company, vacancy=vacancy, student=student, status=Application.Status.REJECTED)
        Application.objects.create(company=company, vacancy=vacancy, student=student, status=Application.Status.SUBMITTED)

        self.assertEqual(
            Application.objects.filter(company=company, vacancy=vacancy, student=student).count(),
            2,
        )
