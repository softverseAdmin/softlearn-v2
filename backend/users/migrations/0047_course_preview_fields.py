from django.core.validators import MinValueValidator
from django.db import migrations, models

import users.media


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0046_teacherprofile_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="preview_access_type",
            field=models.CharField(blank=True, choices=[("free_preview", "Free Preview"), ("enrolled_only", "Enrolled Only")], default="", max_length=32),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_duration_minutes",
            field=models.PositiveSmallIntegerField(blank=True, null=True, validators=[MinValueValidator(1)]),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_order",
            field=models.PositiveSmallIntegerField(blank=True, null=True, validators=[MinValueValidator(1)]),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_short_description",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_status",
            field=models.CharField(blank=True, choices=[("draft", "Draft"), ("published", "Published")], default="", max_length=20),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_thumbnail_image",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_thumbnail_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.course_preview_thumbnail_upload_to),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_title",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="course",
            name="preview_video_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
