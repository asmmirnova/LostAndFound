from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'login', 'name', 'phone', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        user = User.objects.create_user(
            login=validated_data['login'],
            name=validated_data['name'],
            phone=validated_data['phone'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, data):
        login = data.get('login')
        password = data.get('password')

        # Используем встроенный метод authenticate для проверки учетных данных
        user = authenticate(login=login, password=password)
        
        if not user:
            raise serializers.ValidationError("Неверный логин или пароль")
        
        if not user.is_active:
            raise serializers.ValidationError("Пользователь деактивирован")

        return {
            'user': user,
            'login': login
        }

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Сериализатор для профиля пользователя.
    Используется для отображения информации о пользователе в личном кабинете.
    """
    class Meta:
        model = User
        fields = ['id', 'login', 'name', 'phone', 'created_at']
        read_only_fields = ['id', 'login', 'created_at']
