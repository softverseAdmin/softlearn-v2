from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0017_lesson_lessonprogress"),
    ]

    operations = [
        migrations.AddField(
            model_name="exam",
            name="max_attempts",
            field=models.PositiveSmallIntegerField(default=3, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.CreateModel(
            name="ExamAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("attempt_number", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("status", models.CharField(choices=[("submitted", "Submitted"), ("scored", "Scored")], default="submitted", max_length=20)),
                ("score_percent", models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ("passed", models.BooleanField(blank=True, null=True)),
                ("started_at", models.DateTimeField()),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("exam", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="users.exam")),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="exam_attempts", to="users.user")),
            ],
            options={
                "ordering": ["-started_at", "-id"],
                "constraints": [
                    models.UniqueConstraint(fields=("student", "exam", "attempt_number"), name="unique_student_exam_attempt"),
                ],
            },
        ),
        migrations.CreateModel(
            name="ExamQuestion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("prompt", models.TextField()),
                ("instructions", models.TextField(blank=True, default="")),
                ("question_type", models.CharField(choices=[("single_choice", "Single choice")], default="single_choice", max_length=30)),
                ("sequence_number", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ("points", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("active", "Active"), ("inactive", "Inactive")], default="draft", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("exam", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="questions", to="users.exam")),
            ],
            options={
                "ordering": ["exam_id", "sequence_number", "id"],
                "constraints": [
                    models.UniqueConstraint(fields=("exam", "sequence_number"), name="unique_exam_question_sequence"),
                ],
            },
        ),
        migrations.CreateModel(
            name="ExamAttemptAnswer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("attempt", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answers", to="users.examattempt")),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempt_answers", to="users.examquestion")),
            ],
            options={
                "ordering": ["question__sequence_number", "id"],
                "constraints": [
                    models.UniqueConstraint(fields=("attempt", "question"), name="unique_attempt_question_answer"),
                ],
            },
        ),
        migrations.CreateModel(
            name="ExamAnswerOption",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("option_text", models.CharField(max_length=255)),
                ("sequence_number", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ("is_correct", models.BooleanField(default=False)),
                ("status", models.CharField(choices=[("active", "Active"), ("inactive", "Inactive")], default="active", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answer_options", to="users.examquestion")),
            ],
            options={
                "ordering": ["question_id", "sequence_number", "id"],
                "constraints": [
                    models.UniqueConstraint(fields=("question", "sequence_number"), name="unique_question_option_sequence"),
                ],
            },
        ),
        migrations.AddField(
            model_name="examresult",
            name="attempt",
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="result", to="users.examattempt"),
        ),
        migrations.AddField(
            model_name="examattemptanswer",
            name="selected_option",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="selected_attempt_answers", to="users.examansweroption"),
        ),
    ]
