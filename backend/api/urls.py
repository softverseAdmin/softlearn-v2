from django.urls import path

from api import views

urlpatterns = [
    path("v1/health", views.health_view, name="api-health"),
    path("v1/auth/csrf", views.csrf_view, name="api-auth-csrf"),
    path("v1/auth/session", views.session_view, name="api-auth-session"),
    path("v1/auth/signup", views.signup_view, name="api-auth-signup"),
    path("v1/auth/login", views.login_view, name="api-auth-login"),
    path("v1/auth/logout", views.logout_view, name="api-auth-logout"),
    path("v1/auth/password/change", views.password_change_view, name="api-auth-password-change"),
    path("v1/student/profile", views.student_profile_view, name="api-student-profile"),
    path("v1/student/skills", views.student_skills_view, name="api-student-skills"),
    path("v1/student/skills/<int:student_skill_id>", views.student_skill_detail_view, name="api-student-skill-detail"),
    path("v1/company/profile", views.company_profile_view, name="api-company-profile"),
    path("v1/access/me", views.access_me_view, name="api-access-me"),
    path("v1/access/student", views.student_access_view, name="api-access-student"),
    path("v1/access/company", views.company_access_view, name="api-access-company"),
    path("v1/access/admin", views.admin_access_view, name="api-access-admin"),
]
