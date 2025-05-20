from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, login, name, phone, password=None):
        if not login:
            raise ValueError('Users must have a login')
        
        user = self.model(
            login=login,
            name=name,
            phone=phone,
        )
        
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, login, name, phone, password=None):
        user = self.create_user(
            login=login,
            name=name,
            phone=phone,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    login = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['name', 'phone']

    def __str__(self):
        return self.login
    
    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return True
