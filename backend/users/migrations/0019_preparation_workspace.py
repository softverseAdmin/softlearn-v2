from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0018_exam_questions_attempts"),
    ]

    operations = [
        migrations.CreateModel(
            name="MockExamAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("exam_title", models.CharField(max_length=255)),
                ("category", models.CharField(max_length=100)),
                ("attempt_number", models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("score_percent", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ("correct_answer_count", models.PositiveSmallIntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ("total_questions", models.PositiveSmallIntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ("started_at", models.DateTimeField()),
                ("submitted_at", models.DateTimeField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("exam", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="mock_attempts", to="users.exam")),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="mock_exam_attempts", to="users.user")),
            ],
            options={
                "ordering": ["-submitted_at", "-id"],
                "constraints": [
                    models.UniqueConstraint(fields=("student", "exam", "attempt_number"), name="unique_student_mock_exam_attempt"),
                ],
            },
        ),
        migrations.CreateModel(
            name="PracticeQuestionAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_correct", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("exam", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="practice_attempts", to="users.exam")),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="practice_attempts", to="users.examquestion")),
                ("selected_option", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="practice_attempts", to="users.examansweroption")),
                ("student", models.ForeignKey(limit_choices_to={"role": "student"}, on_delete=django.db.models.deletion.CASCADE, related_name="practice_question_attempts", to="users.user")),
            ],
            options={
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.CreateModel(
            name="MockExamAttemptAnswer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_correct", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("attempt", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answers", to="users.mockexamattempt")),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="mock_attempt_answers", to="users.examquestion")),
                ("selected_option", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="selected_mock_attempt_answers", to="users.examansweroption")),
            ],
            options={
                "ordering": ["question__sequence_number", "id"],
                "constraints": [
                    models.UniqueConstraint(fields=("attempt", "question"), name="unique_mock_attempt_question_answer"),
                ],
            },
        ),
    ]
