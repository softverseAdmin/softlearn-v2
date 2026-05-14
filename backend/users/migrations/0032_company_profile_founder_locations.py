from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0031_company_profile_details"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="founder_name",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="company",
            name="office_locations",
            field=models.TextField(blank=True, default=""),
        ),
    ]
