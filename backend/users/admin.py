from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from users.models import (
    Application,
    ApplicationStatusHistory,
    CandidateNote,
    CandidateReviewAccess,
    CandidateShortlist,
    Company,
    Course,
    Exam,
    ExamResult,
    Interview,
    InterviewAvailability,
    InterviewEvent,
    JobBookmark,
    LearningRecord,
    Notification,
    NotificationDelivery,
    Skill,
    StudentProfile,
    StudentSkill,
    StudentVisibilityEvent,
    StudentVisibilitySettings,
    User,
    Vacancy,
    VacancyLanguageRequirement,
    VacancySkillRequirement,
)


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


@admin.register(StudentVisibilitySettings)
class StudentVisibilitySettingsAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "share_profile_preview", "share_learning_record", "share_exam_results", "updated_at")
    list_filter = ("share_profile_preview", "share_learning_record", "share_exam_results")
    search_fields = ("student__email", "student__full_name")


@admin.register(LearningRecord)
class LearningRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "course", "course_title", "category", "progress_percent", "status", "updated_at")
    list_filter = ("status", "category")
    search_fields = ("student__email", "student__full_name", "course__title", "course_title", "category")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "difficulty_level", "estimated_hours", "status", "updated_at")
    list_filter = ("status", "category", "difficulty_level")
    search_fields = ("title", "description", "category", "difficulty_level")


@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "exam", "exam_title", "category", "score_percent", "passed", "taken_at")
    list_filter = ("passed", "category")
    search_fields = ("student__email", "student__full_name", "exam__title", "exam_title", "category")


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "duration_minutes", "passing_score_percent", "question_count", "status", "updated_at")
    list_filter = ("status", "category")
    search_fields = ("title", "description", "category")


@admin.register(CandidateReviewAccess)
class CandidateReviewAccessAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "student", "source", "is_active", "updated_at")
    list_filter = ("source", "is_active")
    search_fields = ("company__name", "student__email", "student__full_name")


@admin.register(StudentVisibilityEvent)
class StudentVisibilityEventAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "share_profile_preview", "share_learning_record", "share_exam_results", "created_at")
    list_filter = ("share_profile_preview", "share_learning_record", "share_exam_results")
    search_fields = ("student__email", "student__full_name")


@admin.register(CandidateShortlist)
class CandidateShortlistAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "student", "created_by", "updated_at")
    search_fields = ("company__name", "student__email", "student__full_name", "created_by__email")


@admin.register(CandidateNote)
class CandidateNoteAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "student", "author", "created_at")
    search_fields = ("company__name", "student__email", "student__full_name", "author__email", "body")


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "student", "status", "purpose", "meeting_provider", "scheduled_start", "updated_at")
    list_filter = ("status",)
    search_fields = ("company__name", "student__email", "student__full_name", "purpose", "role_context")


@admin.register(InterviewAvailability)
class InterviewAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("id", "interview", "submitted_by", "start_at", "end_at", "updated_at")
    search_fields = ("interview__student__email", "interview__company__name", "submitted_by__email", "note")


@admin.register(InterviewEvent)
class InterviewEventAdmin(admin.ModelAdmin):
    list_display = ("id", "interview", "event_type", "actor", "created_at")
    list_filter = ("event_type",)
    search_fields = ("interview__student__email", "interview__company__name", "description", "actor__email")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "recipient", "notification_type", "title", "read_at", "created_at")
    list_filter = ("notification_type", "read_at")
    search_fields = ("recipient__email", "recipient__full_name", "title", "message")


@admin.register(NotificationDelivery)
class NotificationDeliveryAdmin(admin.ModelAdmin):
    list_display = ("id", "notification", "channel", "status", "created_at")
    list_filter = ("channel", "status")
    search_fields = ("notification__recipient__email", "payload_summary")


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "company", "employment_type", "experience_level", "location", "work_style", "status", "updated_at")
    list_filter = ("status", "employment_type", "experience_level", "work_style", "relocation_support")
    search_fields = ("title", "company__name", "location", "description")


@admin.register(VacancySkillRequirement)
class VacancySkillRequirementAdmin(admin.ModelAdmin):
    list_display = ("id", "vacancy", "skill", "requirement_type", "updated_at")
    list_filter = ("requirement_type",)
    search_fields = ("vacancy__title", "vacancy__company__name", "skill__name")


@admin.register(VacancyLanguageRequirement)
class VacancyLanguageRequirementAdmin(admin.ModelAdmin):
    list_display = ("id", "vacancy", "language", "minimum_level", "requirement_type", "updated_at")
    list_filter = ("language", "minimum_level", "requirement_type")
    search_fields = ("vacancy__title", "vacancy__company__name")


@admin.register(JobBookmark)
class JobBookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "vacancy", "created_at")
    search_fields = ("student__email", "student__full_name", "vacancy__title", "vacancy__company__name")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "vacancy", "company", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("student__email", "student__full_name", "vacancy__title", "company__name")


@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "application", "from_status", "to_status", "actor", "created_at")
    list_filter = ("to_status",)
    search_fields = ("application__student__email", "application__vacancy__title", "actor__email", "note")
