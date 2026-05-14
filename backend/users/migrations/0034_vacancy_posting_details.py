from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0033_messagethread_company_last_read_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="vacancy",
            name="posting_details",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
