from django.db import migrations, models

import users.media


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0045_teacherprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="teacherprofile",
            name="cover_image",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="teacherprofile",
            name="cover_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.teacher_cover_image_upload_to),
        ),
        migrations.AddField(
            model_name="teacherprofile",
            name="profile_image",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="teacherprofile",
            name="profile_image_file",
            field=models.FileField(blank=True, default="", upload_to=users.media.teacher_profile_image_upload_to),
        ),
    ]
