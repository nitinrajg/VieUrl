from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'ok',
        'message': 'VieUrl Backend API is running!',
        'endpoints': {
            'extract_info': '/api/extract-info/',
            'download': '/api/download/',
        }
    })

urlpatterns = [
    path('', health_check, name='health_check'),  # Root URL health check
    path('admin/', admin.site.urls),
    path('api/', include('downloader.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
