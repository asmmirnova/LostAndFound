from rest_framework import status
from .models import Image
import uuid
import pytest

@pytest.mark.django_db
class TestImageAPI:
    def setup_method(self):
        self.upload_url = '/api/images/upload/'
        
    def test_upload_image(self, auth_client, test_image):
        """Тест загрузки изображения"""
        response = auth_client.post(
            self.upload_url,
            {'file': test_image},
            format='multipart'
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
        assert 'file' in response.data
        assert 'uploaded_at' in response.data
        
        # Проверяем, что изображение создано в базе
        image_id = response.data['id']
        assert Image.objects.filter(id=image_id).exists()
        
    def test_get_image(self, auth_client, test_image):
        """Тест получения информации об изображении"""
        # Сначала загружаем изображение
        upload_response = auth_client.post(
            self.upload_url,
            {'file': test_image},
            format='multipart'
        )
        
        image_id = upload_response.data['id']
        
        # Затем получаем информацию о нем
        response = auth_client.get(f'/api/images/{image_id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == image_id
        assert 'file' in response.data
        assert 'uploaded_at' in response.data
        
    def test_get_nonexistent_image(self, auth_client):
        """Тест получения несуществующего изображения"""
        non_existent_id = uuid.uuid4()
        response = auth_client.get(f'/api/images/{non_existent_id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'error' in response.data
