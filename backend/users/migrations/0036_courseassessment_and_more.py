from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0035_lesson_video_url"),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseAssessment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True, default="")),
                ("kind", models.CharField(choices=[("lesson", "Lesson"), ("final", "Final")], default="lesson", max_length=20)),
                ("passing_score_percent", models.PositiveSmallIntegerField(default=90, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("active", "Active"), ("inactive", "Inactive")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assessments", to="users.course")),
                ("lesson", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="assessment", to="users.lesson")),
            ],
            options={"ordering": ["course_id", "kind", "lesson__sequence_number", "id"]},
        ),
        migrations.CreateModel(
            name="CourseAssessmentQuestion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("prompt", models.TextField()),
                ("instructions", models.TextField(blank=True, default="")),
                ("question_type", models.CharField(choices=[("single_choice", "Single choice"), ("multiple_choice", "Multiple choice")], default="single_choice", max_length=30)),
                ("sequence_number", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ("points", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("active", "Active"), ("inactive", "Inactive")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assessment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="questions", to="users.courseassessment")),
            ],
            options={"ordering": ["assessment_id", "sequence_number", "id"]},
        ),
        migrations.CreateModel(
            name="CourseAssessmentOption",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("option_text", models.CharField(max_length=255)),
                ("sequence_number", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ("is_correct", models.BooleanField(default=False)),
                ("status", models.CharField(choices=[("active", "Active"), ("inactive", "Inactive")], default="active", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="options", to="users.courseassessmentquestion")),
            ],
            options={"ordering": ["question_id", "sequence_number", "id"]},
        ),
        migrations.CreateModel(
            name="CourseAssessmentAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("attempt_number", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("score_percent", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ("passed", models.BooleanField(default=False)),
                ("started_at", models.DateTimeField()),
                ("submitted_at", models.DateTimeField()),
                ("completed_at", models.DateTimeField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assessment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="users.courseassessment")),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="course_assessment_attempts", to="users.user")),
            ],
            options={"ordering": ["-submitted_at", "-id"]},
        ),
        migrations.CreateModel(
            name="CourseAssessmentAttemptSelection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("attempt", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="selections", to="users.courseassessmentattempt")),
                ("option", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempt_selections", to="users.courseassessmentoption")),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempt_selections", to="users.courseassessmentquestion")),
            ],
            options={"ordering": ["question__sequence_number", "option__sequence_number", "id"]},
        ),
        migrations.AddConstraint(
            model_name="courseassessment",
            constraint=models.UniqueConstraint(condition=models.Q(("kind", "final")), fields=("course", "kind"), name="unique_final_assessment_per_course"),
        ),
        migrations.AddConstraint(
            model_name="courseassessmentquestion",
            constraint=models.UniqueConstraint(fields=("assessment", "sequence_number"), name="unique_course_assessment_question_sequence"),
        ),
        migrations.AddConstraint(
            model_name="courseassessmentoption",
            constraint=models.UniqueConstraint(fields=("question", "sequence_number"), name="unique_course_assessment_option_sequence"),
        ),
        migrations.AddConstraint(
            model_name="courseassessmentattempt",
            constraint=models.UniqueConstraint(fields=("student", "assessment", "attempt_number"), name="unique_student_course_assessment_attempt"),
        ),
        migrations.AddConstraint(
            model_name="courseassessmentattemptselection",
            constraint=models.UniqueConstraint(fields=("attempt", "question", "option"), name="unique_course_assessment_attempt_option"),
        ),
    ]
