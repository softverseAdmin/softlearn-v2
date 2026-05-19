from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

import users.media


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0041_application_application_student_status_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="cover_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.company_cover_image_upload_to),
        ),
        migrations.AddField(
            model_name="company",
            name="profile_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.company_profile_image_upload_to),
        ),
        migrations.AddField(
            model_name="course",
            name="thumbnail_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.course_thumbnail_upload_to),
        ),
        migrations.AddField(
            model_name="studentprofile",
            name="cover_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.student_cover_image_upload_to),
        ),
        migrations.AddField(
            model_name="studentprofile",
            name="github_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="studentprofile",
            name="linkedin_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="studentprofile",
            name="portfolio_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="studentprofile",
            name="profile_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.student_profile_image_upload_to),
        ),
        migrations.AddField(
            model_name="studentresume",
            name="content_type",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="studentresume",
            name="file_size_bytes",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="studentresume",
            name="stored_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.student_resume_upload_to),
        ),
        migrations.CreateModel(
            name="CompanyCourseBookmark",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_bookmarks", to="users.course")),
                (
                    "user",
                    models.ForeignKey(
                        limit_choices_to={"role": "company"},
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="company_course_bookmarks",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.AddConstraint(
            model_name="companycoursebookmark",
            constraint=models.UniqueConstraint(fields=("user", "course"), name="unique_company_course_bookmark"),
        ),
    ]
