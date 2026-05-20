from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0044_alter_user_role_add_teacher"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeacherProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("overview", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(on_delete=models.deletion.CASCADE, related_name="teacher_profile", to="users.user"),
                ),
            ],
            options={
                "ordering": ["user_id"],
            },
        ),
    ]
