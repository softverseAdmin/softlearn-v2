from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from users.models import Company, Skill, StudentProfile, StudentSkill, User


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "updated_at", "created_at")
    search_fields = ("name", "description")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("email",)
    list_display = ("id", "email", "full_name", "role", "company", "is_staff", "is_active")
    search_fields = ("email", "full_name")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "role", "company")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "role", "company", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )
    readonly_fields = ("date_joined", "created_at", "updated_at", "last_login")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "desired_job_type",
        "desired_work_location",
        "japanese_level",
        "english_level",
        "updated_at",
    )
    search_fields = ("user__email", "user__full_name", "desired_job_type", "desired_work_location")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "updated_at")
    search_fields = ("name", "slug")
    readonly_fields = ("slug", "created_at", "updated_at")


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "skill", "proficiency_level", "updated_at")
    list_filter = ("proficiency_level",)
    search_fields = ("student__email", "student__full_name", "skill__name")
