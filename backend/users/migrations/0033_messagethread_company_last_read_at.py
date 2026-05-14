from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0032_company_profile_founder_locations"),
    ]

    operations = [
        migrations.AddField(
            model_name="messagethread",
            name="company_last_read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
