from django.core.management import call_command
from django.test import TestCase

from users.models import Application, Company, Course, Exam, Interview, ScheduledTask, User, Vacancy


SEED_DOMAIN = "demo.softlearn.local"


class SeedDemoDataCommandTest(TestCase):
    def test_seed_demo_data_creates_expected_records_without_usable_passwords(self):
        call_command("seed_demo_data")

        self.assertEqual(Company.objects.count(), 5)
        self.assertEqual(Course.objects.count(), 5)
        self.assertEqual(Exam.objects.count(), 5)
        self.assertEqual(Vacancy.objects.count(), 5)
        self.assertEqual(Application.objects.count(), 5)
        self.assertEqual(Interview.objects.count(), 5)
        self.assertEqual(ScheduledTask.objects.count(), 4)

        seeded_users = User.objects.filter(email__endswith=f"@{SEED_DOMAIN}")
        self.assertEqual(seeded_users.count(), 15)
        self.assertTrue(all(not user.has_usable_password() for user in seeded_users))

    def test_seed_demo_data_is_idempotent_for_core_records(self):
        call_command("seed_demo_data")
        call_command("seed_demo_data")

        self.assertEqual(Company.objects.count(), 5)
        self.assertEqual(Course.objects.count(), 5)
        self.assertEqual(Exam.objects.count(), 5)
        self.assertEqual(Vacancy.objects.count(), 5)
        self.assertEqual(Application.objects.count(), 5)
        self.assertEqual(Interview.objects.count(), 5)
        self.assertEqual(User.objects.filter(email__endswith=f"@{SEED_DOMAIN}").count(), 15)
