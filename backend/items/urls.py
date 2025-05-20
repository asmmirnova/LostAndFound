from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, TagViewSet

router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
