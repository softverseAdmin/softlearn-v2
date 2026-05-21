from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0047_course_preview_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="archived_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
