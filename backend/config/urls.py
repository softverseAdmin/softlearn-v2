from re import escape

from django.contrib import admin
from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve


def media_serve_view(request, path):
    return serve(request, path, document_root=settings.MEDIA_ROOT)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]

if settings.MEDIA_URL.startswith("/") and "://" not in settings.MEDIA_URL:
    media_path = settings.MEDIA_URL.lstrip("/")
    urlpatterns += [
        re_path(
            rf"^{escape(media_path)}(?P<path>.*)$",
            media_serve_view,
        )
    ]
