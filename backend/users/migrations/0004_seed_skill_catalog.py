from django.db import migrations


DEFAULT_SKILLS = [
    "AWS",
    "CSS",
    "Django",
    "Docker",
    "Git",
    "HTML",
    "JavaScript",
    "Linux",
    "PostgreSQL",
    "Python",
    "React",
    "REST API",
    "SQL",
    "TypeScript",
]


def seed_skill_catalog(apps, schema_editor):
    Skill = apps.get_model("users", "Skill")

    for skill_name in DEFAULT_SKILLS:
        Skill.objects.get_or_create(
            name=skill_name,
            defaults={"slug": skill_name.lower().replace(" ", "-")},
        )


def unseed_skill_catalog(apps, schema_editor):
    Skill = apps.get_model("users", "Skill")
    Skill.objects.filter(name__in=DEFAULT_SKILLS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0003_skill_company_description_studentskill"),
    ]

    operations = [
        migrations.RunPython(seed_skill_catalog, unseed_skill_catalog),
    ]
