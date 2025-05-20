from django.urls import path
from .views import ImageUploadView, ImageDetailView

urlpatterns = [
    path('upload/', ImageUploadView.as_view(), name='image-upload'),
    path('<uuid:image_id>/', ImageDetailView.as_view(), name='image-detail'),
]
