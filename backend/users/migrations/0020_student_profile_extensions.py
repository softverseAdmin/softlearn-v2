from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0019_preparation_workspace"),
    ]

    operations = [
        migrations.CreateModel(
            name="StudentAvailabilityProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("job_search_status", models.CharField(blank=True, choices=[("actively_looking", "Actively looking"), ("open_to_offers", "Open to offers"), ("not_searching", "Not searching")], default="", max_length=30)),
                ("earliest_start_date", models.DateField(blank=True, null=True)),
                ("interview_availability", models.CharField(blank=True, default="", max_length=255)),
                ("scheduling_notes", models.TextField(blank=True, default="")),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("student", models.OneToOneField(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="availability_profile", to="users.user")),
            ],
            options={
                "ordering": ["student_id"],
            },
        ),
        migrations.CreateModel(
            name="StudentEducation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("institution", models.CharField(max_length=255)),
                ("field_of_study", models.CharField(max_length=255)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                ("completion_status", models.CharField(choices=[("in_progress", "In progress"), ("completed", "Completed"), ("paused", "Paused")], default="in_progress", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="education_records", to="users.user")),
            ],
            options={
                "ordering": ["-start_date", "-id"],
            },
        ),
        migrations.CreateModel(
            name="StudentExperience",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("organization", models.CharField(max_length=255)),
                ("role_title", models.CharField(max_length=255)),
                ("experience_type", models.CharField(choices=[("work", "Work"), ("internship", "Internship"), ("project", "Project"), ("freelance", "Freelance"), ("volunteer", "Volunteer")], default="work", max_length=20)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                ("is_current", models.BooleanField(default=False)),
                ("summary", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="experience_records", to="users.user")),
            ],
            options={
                "ordering": ["-start_date", "-id"],
            },
        ),
        migrations.CreateModel(
            name="StudentResume",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("display_name", models.CharField(max_length=255)),
                ("file_name", models.CharField(max_length=255)),
                ("source_type", models.CharField(choices=[("uploaded", "Uploaded"), ("external", "External"), ("manual", "Manual")], default="manual", max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="resume_records", to="users.user")),
            ],
            options={
                "ordering": ["-updated_at", "-id"],
            },
        ),
    ]
