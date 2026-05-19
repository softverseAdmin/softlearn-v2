from django.urls import path

from api import views

urlpatterns = [
    path("csrf", views.csrf_view, name="api-auth-csrf"),
    path("session", views.session_view, name="api-auth-session"),
    path("signup", views.signup_view, name="api-auth-signup"),
    path("login", views.login_view, name="api-auth-login"),
    path("logout", views.logout_view, name="api-auth-logout"),
    path("password/change", views.password_change_view, name="api-auth-password-change"),
    path("password/reset", views.password_reset_request_view, name="api-auth-password-reset"),
    path("password/reset/confirm", views.password_reset_confirm_view, name="api-auth-password-reset-confirm"),
]
