from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0038_lesson_transcript"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="thumbnail_alt_text",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="course",
            name="thumbnail_image",
            field=models.TextField(blank=True, default=""),
        ),
    ]
