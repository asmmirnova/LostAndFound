from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User

class LoginBackend(ModelBackend):
    def authenticate(self, request, login=None, password=None, **kwargs):
        try:
            user = User.objects.get(login=login)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
