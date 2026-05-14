from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0029_messagethread_message"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="cover_image",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="company",
            name="profile_image",
            field=models.TextField(blank=True, default=""),
        ),
    ]
