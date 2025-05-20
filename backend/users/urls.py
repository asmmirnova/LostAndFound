from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, user_stats, user_items
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Профиль пользователя
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/<str:login>/', UserProfileView.as_view(), name='user_profile_by_login'),
    
    # Статистика пользователя
    path('stats/', user_stats, name='user_stats'),
    path('stats/<str:login>/', user_stats, name='user_stats_by_login'),
    
    # Объявления пользователя
    path('items/', user_items, name='user_items'),
    path('items/<str:login>/', user_items, name='user_items_by_login'),
]
