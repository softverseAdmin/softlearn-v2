from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0030_company_profile_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="additional_company_info",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="company",
            name="business_domains",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="company",
            name="business_models",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="company",
            name="capital_label",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="company",
            name="company_features",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="company",
            name="company_points",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="company",
            name="employee_count_label",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="company",
            name="founded_at",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="company",
            name="headquarters_address",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="company",
            name="industry",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="company",
            name="job_posting_id",
            field=models.CharField(blank=True, default="", max_length=50),
        ),
        migrations.AddField(
            model_name="company",
            name="market_category",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="company",
            name="revenue_label",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="company",
            name="tagline",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="company",
            name="website_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
