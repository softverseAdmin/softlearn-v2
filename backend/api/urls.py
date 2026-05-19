from django.urls import include, path

urlpatterns = [
    path("v1/auth/", include("api.url_patterns.auth")),
    path("v1/student/", include("api.url_patterns.student")),
    path("v1/company/", include("api.url_patterns.company")),
    path("v1/admin/", include("api.url_patterns.admin")),
    path("v1/", include("api.url_patterns.platform")),
]
