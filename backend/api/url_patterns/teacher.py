from django.urls import path

from api import teacher_views as views
from api.media_views import (
    teacher_course_preview_thumbnail_upload_view,
    teacher_course_thumbnail_upload_view,
    teacher_profile_image_upload_view,
)

urlpatterns = [
    path("dashboard", views.teacher_dashboard_view, name="api-teacher-dashboard"),
    path("profile", views.teacher_profile_view, name="api-teacher-profile"),
    path("profile/images/<str:image_kind>", teacher_profile_image_upload_view, name="api-teacher-profile-image"),
    path("progress", views.teacher_progress_view, name="api-teacher-progress"),
    path("courses", views.teacher_courses_view, name="api-teacher-courses"),
    path("courses/<int:course_id>", views.teacher_course_detail_view, name="api-teacher-course-detail"),
    path("courses/<int:course_id>/thumbnail", teacher_course_thumbnail_upload_view, name="api-teacher-course-thumbnail"),
    path(
        "courses/<int:course_id>/preview-thumbnail",
        teacher_course_preview_thumbnail_upload_view,
        name="api-teacher-course-preview-thumbnail",
    ),
    path("courses/<int:course_id>/preview", views.teacher_course_preview_detail_view, name="api-teacher-course-preview-detail"),
    path("courses/<int:course_id>/preview/lessons/<int:lesson_id>", views.teacher_course_preview_lesson_detail_view, name="api-teacher-course-preview-lesson-detail"),
    path("courses/<int:course_id>/preview/lessons/<int:lesson_id>/exam", views.teacher_course_preview_lesson_assessment_detail_view, name="api-teacher-course-preview-lesson-assessment-detail"),
    path("courses/<int:course_id>/preview/lessons/<int:lesson_id>/exam/submit", views.teacher_course_preview_lesson_assessment_submit_view, name="api-teacher-course-preview-lesson-assessment-submit"),
    path("courses/<int:course_id>/preview/final-exam", views.teacher_course_preview_final_assessment_detail_view, name="api-teacher-course-preview-final-assessment-detail"),
    path("courses/<int:course_id>/preview/final-exam/submit", views.teacher_course_preview_final_assessment_submit_view, name="api-teacher-course-preview-final-assessment-submit"),
    path("courses/<int:course_id>/lessons", views.teacher_course_lessons_view, name="api-teacher-course-lessons"),
    path("exams", views.teacher_exams_view, name="api-teacher-exams"),
    path("students", views.teacher_students_view, name="api-teacher-students"),
    path("youtube-transcript", views.teacher_youtube_transcript_view, name="api-teacher-youtube-transcript"),
    path("lessons/<int:lesson_id>", views.teacher_lesson_detail_view, name="api-teacher-lesson-detail"),
]
