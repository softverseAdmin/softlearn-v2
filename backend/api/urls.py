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
    path("v1/access/me", views.access_me_view, name="api-access-me"),
    path("v1/access/student", views.student_access_view, name="api-access-student"),
    path("v1/access/company", views.company_access_view, name="api-access-company"),
    path("v1/access/admin", views.admin_access_view, name="api-access-admin"),
]
