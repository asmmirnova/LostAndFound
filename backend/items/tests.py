import json
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Item, Tag
from images.models import Image

class TagModelTest(TestCase):
    """Тесты для модели Tag"""
    
    def setUp(self):
        Tag.objects.create(name="ключи")
        Tag.objects.create(name="документы")
    
    def test_tag_creation(self):
        """Тест создания тега"""
        tag = Tag.objects.get(name="ключи")
        self.assertEqual(tag.name, "ключи")
    
    def test_tag_str(self):
        """Тест строкового представления тега"""
        tag = Tag.objects.get(name="документы")
        self.assertEqual(str(tag), "документы")

class ItemModelTest(TestCase):
    """Тесты для модели Item"""
    
    def setUp(self):
        # Создаем пользователя
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        
        # Создаем теги
        self.tag1 = Tag.objects.create(name="ключи")
        self.tag2 = Tag.objects.create(name="документы")
        
        # Создаем объявление
        self.item = Item.objects.create(
            type='lost',
            title='Потерян кошелек',
            description='Красный кошелек с документами',
            color='red',
            date_event='2025-05-15',
            location_event='Парк Горького',
            user=self.user,
            status='active',
            reward=1000,
            hidden_details='Внутри паспорт на имя Иванов И.И.'
        )
        
        # Добавляем теги
        self.item.tags.add(self.tag1, self.tag2)
    
    def test_item_creation(self):
        """Тест создания объявления"""
        item = Item.objects.get(title='Потерян кошелек')
        self.assertEqual(item.type, 'lost')
        self.assertEqual(item.color, 'red')
        self.assertEqual(item.user, self.user)
        self.assertEqual(item.status, 'active')
        self.assertEqual(item.reward, 1000)
    
    def test_item_tags(self):
        """Тест связи объявления с тегами"""
        item = Item.objects.get(title='Потерян кошелек')
        self.assertEqual(item.tags.count(), 2)
        self.assertIn(self.tag1, item.tags.all())
        self.assertIn(self.tag2, item.tags.all())
    
    def test_item_str(self):
        """Тест строкового представления объявления"""
        item = Item.objects.get(title='Потерян кошелек')
        self.assertEqual(str(item), "Потерянная вещь: Потерян кошелек")

class ItemAPITest(TestCase):
    """Тесты для API объявлений"""
    
    def setUp(self):
        # Создаем пользователей
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='password1'
        )
        
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='password2'
        )
        
        # Создаем теги
        self.tag1 = Tag.objects.create(name="ключи")
        self.tag2 = Tag.objects.create(name="документы")
        
        # Создаем объявления
        self.lost_item = Item.objects.create(
            type='lost',
            title='Потерян кошелек',
            description='Красный кошелек с документами',
            color='red',
            date_event='2025-05-15',
            location_event='Парк Горького',
            user=self.user1,
            status='active',
            reward=1000,
            hidden_details='Внутри паспорт на имя Иванов И.И.'
        )
        self.lost_item.tags.add(self.tag1, self.tag2)
        
        self.found_item = Item.objects.create(
            type='found',
            title='Найден кошелек',
            description='Черный кошелек с ключами',
            color='black',
            date_event='2025-05-16',
            location_event='Метро Охотный ряд',
            user=self.user2,
            status='active',
            storage_location='У меня дома',
            hidden_details='Внутри ключи от машины'
        )
        self.found_item.tags.add(self.tag1)
        
        # Создаем клиент API
        self.client = APIClient()
    
    def test_get_items_list_authenticated(self):
        """Тест получения списка объявлений авторизованным пользователем"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_get_items_list_unauthenticated(self):
        """Тест получения списка объявлений неавторизованным пользователем"""
        response = self.client.get(reverse('item-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_item_detail_authenticated(self):
        """Тест получения детальной информации об объявлении авторизованным пользователем"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-detail', args=[self.lost_item.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Потерян кошелек')
    
    def test_create_item_authenticated(self):
        """Тест создания объявления авторизованным пользователем"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'type': 'lost',
            'title': 'Потерян телефон',
            'description': 'iPhone 13 Pro',
            'color': 'black',
            'date_event': '2025-05-17',
            'location_event': 'Кафе "Пушкин"',
            'reward': 5000,
            'hidden_details': 'Пароль 1234',
            'tags': ['телефон', 'apple']
        }
        response = self.client.post(
            reverse('item-list'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Item.objects.count(), 3)
        
        # Проверяем, что теги были созданы
        self.assertTrue(Tag.objects.filter(name='телефон').exists())
        self.assertTrue(Tag.objects.filter(name='apple').exists())
    
    def test_update_own_item(self):
        """Тест обновления своего объявления"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'Потерян кошелек (обновлено)',
            'reward': 2000
        }
        response = self.client.patch(
            reverse('item-detail', args=[self.lost_item.id]),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lost_item.refresh_from_db()
        self.assertEqual(self.lost_item.title, 'Потерян кошелек (обновлено)')
        self.assertEqual(self.lost_item.reward, 2000)
    
    def test_update_other_user_item(self):
        """Тест обновления чужого объявления"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'Найден кошелек (обновлено)'
        }
        response = self.client.patch(
            reverse('item-detail', args=[self.found_item.id]),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_change_status(self):
        """Тест изменения статуса объявления"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'status': 'resolved'
        }
        response = self.client.post(
            reverse('item-change-status', args=[self.lost_item.id]),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lost_item.refresh_from_db()
        self.assertEqual(self.lost_item.status, 'resolved')
    
    def test_filter_by_type(self):
        """Тест фильтрации объявлений по типу"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-list') + '?type=lost')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Потерян кошелек')
    
    def test_filter_by_color(self):
        """Тест фильтрации объявлений по цвету"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-list') + '?color=black')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Найден кошелек')
    
    def test_filter_by_tags(self):
        """Тест фильтрации объявлений по тегам"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-list') + '?tags=документы')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Потерян кошелек')
    
    def test_search(self):
        """Тест поиска объявлений"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-list') + '?search=Охотный')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Найден кошелек')
    
    def test_my_items(self):
        """Тест получения своих объявлений"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('item-my-items'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Потерян кошелек')

class TagAPITest(TestCase):
    """Тесты для API тегов"""
    
    def setUp(self):
        # Создаем пользователя
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        
        # Создаем теги
        Tag.objects.create(name="ключи")
        Tag.objects.create(name="документы")
        Tag.objects.create(name="телефон")
        
        # Создаем клиент API
        self.client = APIClient()
    
    def test_get_tags_list_authenticated(self):
        """Тест получения списка тегов авторизованным пользователем"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('tag-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
    
    def test_get_tags_list_unauthenticated(self):
        """Тест получения списка тегов неавторизованным пользователем"""
        response = self.client.get(reverse('tag-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_filter_tags_by_name(self):
        """Тест фильтрации тегов по имени"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('tag-list') + '?name=ключ')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'ключи')
