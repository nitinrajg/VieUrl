from django.urls import path
from .views import ExtractVideoInfoView, DownloadVideoView

urlpatterns = [
    path('extract-info/', ExtractVideoInfoView.as_view(), name='extract-info'),
    path('download/', DownloadVideoView.as_view(), name='download'),
]
