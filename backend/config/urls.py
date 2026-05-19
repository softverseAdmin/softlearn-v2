from re import escape

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif settings.MEDIA_URL.startswith("/") and "://" not in settings.MEDIA_URL:
    media_path = settings.MEDIA_URL.lstrip("/")
    urlpatterns += [
        re_path(
            rf"^{escape(media_path)}(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        )
    ]
