from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, UserPassword
from items.models import Item
import json
import pytest

@pytest.mark.django_db
class TestUserAPI:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = '/api/users/register/'
        self.login_url = '/api/users/login/'
        self.user_data = {
            'login': 'testuser',
            'name': 'Test User',
            'phone': '+79991234567',
            'password': 'testpassword123'
        }

    def test_register_user(self):
        """Тест регистрации пользователя"""
        response = self.client.post(
            self.register_url,
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user_id' in response.data
        assert 'message' in response.data
        
        # Проверяем, что пользователь создан в базе
        user = User.objects.get(login=self.user_data['login'])
        assert user.name == self.user_data['name']
        assert user.phone == self.user_data['phone']
        
        # Проверяем, что пароль сохранен
        user_password = UserPassword.objects.get(user=user)
        assert user_password is not None

    def test_login_user(self):
        """Тест входа пользователя"""
        # Сначала регистрируем пользователя
        self.client.post(
            self.register_url,
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        # Затем пытаемся войти
        login_data = {
            'login': self.user_data['login'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user_id' in response.data
        assert 'login' in response.data
        assert response.data['login'] == self.user_data['login']

    def test_login_invalid_credentials(self):
        """Тест входа с неверными учетными данными"""
        # Сначала регистрируем пользователя
        self.client.post(
            self.register_url,
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        # Пытаемся войти с неверным паролем
        login_data = {
            'login': self.user_data['login'],
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
class TestUserProfileAPI:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = '/api/users/register/'
        self.login_url = '/api/users/login/'
        self.profile_url = '/api/users/profile/'
        self.stats_url = '/api/users/stats/'
        self.items_url = '/api/users/items/'
        
        # Создаем тестового пользователя
        self.user_data = {
            'login': 'testuser',
            'name': 'Test User',
            'phone': '+79991234567',
            'password': 'testpassword123'
        }
        
        # Регистрируем пользователя
        self.client.post(
            self.register_url,
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        # Входим и получаем токен
        login_data = {
            'login': self.user_data['login'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.token = response.data['access']
        self.user_id = response.data['user_id']
        self.user = User.objects.get(id=self.user_id)
        
        # Создаем тестовые объявления
        self.create_test_items()
    
    def create_test_items(self):
        """Создание тестовых объявлений для пользователя"""
        # Активное объявление
        Item.objects.create(
            title='Активное объявление',
            description='Описание активного объявления',
            type='lost',
            color='red',
            date_event='2025-05-01',
            location_event='Москва',
            status='active',
            user=self.user
        )
        
        # Решенное объявление
        Item.objects.create(
            title='Решенное объявление',
            description='Описание решенного объявления',
            type='found',
            color='blue',
            date_event='2025-05-02',
            location_event='Санкт-Петербург',
            status='resolved',
            user=self.user
        )
        
        # Закрытое объявление
        Item.objects.create(
            title='Закрытое объявление',
            description='Описание закрытого объявления',
            type='lost',
            color='green',
            date_event='2025-05-03',
            location_event='Казань',
            status='closed',
            user=self.user
        )
    
    def test_get_user_profile(self):
        """Тест получения профиля пользователя"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(self.profile_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['login'] == self.user_data['login']
        assert response.data['name'] == self.user_data['name']
        assert response.data['phone'] == self.user_data['phone']
        assert 'created_at' in response.data
    
    def test_get_user_profile_by_login(self):
        """Тест получения профиля пользователя по логину"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(f"{self.profile_url}{self.user_data['login']}/")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['login'] == self.user_data['login']
        assert response.data['name'] == self.user_data['name']
        assert response.data['phone'] == self.user_data['phone']
        assert 'created_at' in response.data
    
    def test_get_user_stats(self):
        """Тест получения статистики пользователя"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(self.stats_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['active_count'] == 1
        assert response.data['resolved_count'] == 1
        assert response.data['closed_count'] == 1
        assert response.data['total_count'] == 3
    
    def test_get_user_stats_by_login(self):
        """Тест получения статистики пользователя по логину"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(f"{self.stats_url}{self.user_data['login']}/")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['active_count'] == 1
        assert response.data['resolved_count'] == 1
        assert response.data['closed_count'] == 1
        assert response.data['total_count'] == 3
    
    def test_get_user_items(self):
        """Тест получения объявлений пользователя"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(self.items_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        
        # Проверяем, что объявления отсортированы по дате создания (от новых к старым)
        assert response.data[0]['status'] == 'closed'
        assert response.data[1]['status'] == 'resolved'
        assert response.data[2]['status'] == 'active'
    
    def test_get_user_items_by_login(self):
        """Тест получения объявлений пользователя по логину"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(f"{self.items_url}{self.user_data['login']}/")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
