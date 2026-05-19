from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0042_object_storage_assets_and_course_bookmarks"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="application",
            constraint=models.UniqueConstraint(
                fields=("student", "vacancy"),
                condition=models.Q(status__in=["submitted", "under_review", "shortlisted"]),
                name="unique_active_student_vacancy_application",
            ),
        ),
    ]
