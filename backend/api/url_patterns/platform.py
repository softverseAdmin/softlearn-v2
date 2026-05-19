from django.urls import path

from api import views
from api.platform_views import (
    notification_feed_view,
    notification_detail_view,
    notification_read_all_view,
    notification_read_view,
    notifications_view,
    workspace_summary_view,
)

urlpatterns = [
    path("health", views.health_view, name="api-health"),
    path("ready", views.readiness_view, name="api-ready"),
    path("notifications/feed", notification_feed_view, name="api-notifications-feed"),
    path("notifications", notifications_view, name="api-notifications"),
    path("notifications/read-all", notification_read_all_view, name="api-notifications-read-all"),
    path("notifications/<int:notification_id>", notification_detail_view, name="api-notification-detail"),
    path("notifications/<int:notification_id>/read", notification_read_view, name="api-notification-read"),
    path("notification-preferences", views.notification_preferences_view, name="api-notification-preferences"),
    path("notification-preferences/update", views.notification_preferences_update_view, name="api-notification-preferences-update"),
    path("workspace/summary", workspace_summary_view, name="api-workspace-summary"),
    path("access/me", views.access_me_view, name="api-access-me"),
    path("access/student", views.student_access_view, name="api-access-student"),
    path("access/company", views.company_access_view, name="api-access-company"),
    path("access/admin", views.admin_access_view, name="api-access-admin"),
    path("exam-categories", views.exam_categories_view, name="api-exam-categories"),
    path("exam-categories/<int:category_id>", views.exam_category_detail_view, name="api-exam-category-detail"),
    path("exams/<int:exam_id>/practice-questions", views.practice_questions_list_view, name="api-practice-questions-list"),
    path("practice-questions/<int:question_id>", views.practice_question_detail_view, name="api-practice-question-detail"),
    path("exams/<int:exam_id>/mock-exams", views.mock_exams_list_view, name="api-mock-exams-list"),
    path("study-plan", views.study_plan_view, name="api-study-plan"),
    path("interviews/<int:interview_id>", views.interview_detail_view, name="api-interview-detail"),
    path("interviews/<int:interview_id>/availability", views.interview_availability_view, name="api-interview-availability"),
    path("interviews/<int:interview_id>/reschedule", views.interview_reschedule_view, name="api-interview-reschedule"),
    path("interviews/<int:interview_id>/cancel", views.interview_cancel_view, name="api-interview-cancel"),
    path("interviews/<int:interview_id>/complete", views.interview_complete_view, name="api-interview-complete"),
    path("interviews/<int:interview_id>/meeting-link", views.interview_meeting_link_view, name="api-interview-meeting-link"),
    path("metrics/web-vitals", views.web_vitals_view, name="api-web-vitals"),
    path("logs/frontend", views.frontend_logs_view, name="api-frontend-logs"),
]
