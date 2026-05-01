from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0016_exam_examresult_exam"),
    ]

    operations = [
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("summary", models.TextField(blank=True, default="")),
                ("content", models.TextField(blank=True, default="")),
                ("sequence_number", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("active", "Active"), ("inactive", "Inactive")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "course",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lessons", to="users.course"),
                ),
            ],
            options={
                "ordering": ["course_id", "sequence_number", "id"],
                "constraints": [
                    models.UniqueConstraint(fields=("course", "sequence_number"), name="unique_course_lesson_sequence"),
                ],
            },
        ),
        migrations.CreateModel(
            name="LessonProgress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("not_started", "Not started"), ("in_progress", "In progress"), ("completed", "Completed")], default="not_started", max_length=20)),
                ("started_at", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "learning_record",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lesson_progress", to="users.learningrecord"),
                ),
                (
                    "lesson",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="progress_entries", to="users.lesson"),
                ),
            ],
            options={
                "ordering": ["lesson__sequence_number", "lesson_id", "id"],
                "constraints": [
                    models.UniqueConstraint(fields=("learning_record", "lesson"), name="unique_learning_record_lesson_progress"),
                ],
            },
        ),
    ]
