from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0034_vacancy_posting_details"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="video_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
