from django.urls import path

from api import views
from api.jobs_views import (
    company_course_bookmark_view,
    company_course_detail_view,
    company_courses_view,
)
from api.matching_views import company_vacancy_matches_view
from api.media_views import company_course_thumbnail_upload_view, company_profile_image_upload_view
from api.message_views import (
    company_message_compose_contact_detail_view,
    company_message_compose_contacts_view,
    company_message_thread_detail_view,
    company_message_thread_messages_view,
    company_message_threads_view,
    company_messages_view,
)

urlpatterns = [
    path("dashboard", views.company_dashboard_view, name="api-company-dashboard"),
    path("courses", company_courses_view, name="api-company-courses"),
    path("courses/<int:course_id>", company_course_detail_view, name="api-company-course-detail"),
    path("courses/<int:course_id>/bookmark", company_course_bookmark_view, name="api-company-course-bookmark"),
    path("courses/<int:course_id>/thumbnail", company_course_thumbnail_upload_view, name="api-company-course-thumbnail"),
    path("courses/<int:course_id>/preview", views.company_course_preview_detail_view, name="api-company-course-preview-detail"),
    path("courses/<int:course_id>/preview/lessons/<int:lesson_id>", views.company_course_preview_lesson_detail_view, name="api-company-course-preview-lesson-detail"),
    path("courses/<int:course_id>/preview/lessons/<int:lesson_id>/exam", views.company_course_preview_lesson_assessment_detail_view, name="api-company-course-preview-lesson-assessment-detail"),
    path("courses/<int:course_id>/preview/lessons/<int:lesson_id>/exam/submit", views.company_course_preview_lesson_assessment_submit_view, name="api-company-course-preview-lesson-assessment-submit"),
    path("courses/<int:course_id>/preview/final-exam", views.company_course_preview_final_assessment_detail_view, name="api-company-course-preview-final-assessment-detail"),
    path("courses/<int:course_id>/preview/final-exam/submit", views.company_course_preview_final_assessment_submit_view, name="api-company-course-preview-final-assessment-submit"),
    path("courses/<int:course_id>/lessons", views.company_course_lessons_view, name="api-company-course-lessons"),
    path("youtube-transcript", views.company_youtube_transcript_view, name="api-company-youtube-transcript"),
    path("lessons/<int:lesson_id>", views.company_lesson_detail_view, name="api-company-lesson-detail"),
    path("profile", views.company_profile_view, name="api-company-profile"),
    path("profile/images/<str:image_kind>", company_profile_image_upload_view, name="api-company-profile-image"),
    path("messages", company_messages_view, name="api-company-messages"),
    path("messages/contacts", company_message_compose_contacts_view, name="api-company-message-compose-contacts"),
    path(
        "messages/contacts/<int:participant_user_id>",
        company_message_compose_contact_detail_view,
        name="api-company-message-compose-contact-detail",
    ),
    path("messages/threads", company_message_threads_view, name="api-company-message-threads"),
    path("messages/threads/<int:thread_id>", company_message_thread_detail_view, name="api-company-message-thread-detail"),
    path("messages/threads/<int:thread_id>/messages", company_message_thread_messages_view, name="api-company-message-thread-messages"),
    path("hiring-preferences", views.company_hiring_preferences_view, name="api-company-hiring-preferences"),
    path("members", views.company_members_view, name="api-company-members"),
    path("members/<int:member_id>", views.company_member_detail_view, name="api-company-member-detail"),
    path("vacancies", views.company_vacancies_view, name="api-company-vacancies"),
    path("vacancies/<int:vacancy_id>", views.company_vacancy_detail_view, name="api-company-vacancy-detail"),
    path("vacancies/<int:vacancy_id>/matches", company_vacancy_matches_view, name="api-company-vacancy-matches"),
    path("applications", views.company_applications_view, name="api-company-applications"),
    path("applications/<int:application_id>/shortlist", views.company_application_shortlist_view, name="api-company-application-shortlist"),
    path("applications/<int:application_id>/reject", views.company_application_reject_view, name="api-company-application-reject"),
    path("candidates", views.company_candidates_view, name="api-company-candidates"),
    path("interviews", views.company_interviews_view, name="api-company-interviews"),
    path("shortlist", views.company_shortlist_view, name="api-company-shortlist"),
    path("candidates/<int:candidate_access_id>/interviews", views.company_candidate_interviews_view, name="api-company-candidate-interviews"),
    path("candidates/<int:candidate_access_id>/shortlist", views.company_candidate_shortlist_view, name="api-company-candidate-shortlist"),
    path("candidates/<int:candidate_access_id>/notes", views.company_candidate_notes_view, name="api-company-candidate-notes"),
    path("candidates/<int:candidate_access_id>/preview", views.company_candidate_preview_view, name="api-company-candidate-preview"),
    path("candidates/<int:candidate_access_id>/learning-record", views.company_candidate_learning_record_view, name="api-company-candidate-learning-record"),
    path("candidates/<int:candidate_access_id>/exam-results", views.company_candidate_exam_results_view, name="api-company-candidate-exam-results"),
    path("interviews/<int:interview_id>/confirm", views.company_interview_confirm_view, name="api-company-interview-confirm"),
    path("dashboard-data", views.company_dashboard_data_view, name="api-company-dashboard-data"),
    path("dashboard-data/pipeline", views.company_dashboard_pipeline_view, name="api-company-dashboard-pipeline"),
]
