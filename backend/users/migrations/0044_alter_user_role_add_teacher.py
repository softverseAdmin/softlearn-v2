from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0043_application_active_uniqueness"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("student", "Student"),
                    ("company", "Company"),
                    ("teacher", "Teacher"),
                    ("admin", "Admin"),
                ],
                max_length=20,
            ),
        ),
    ]
