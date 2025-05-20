import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
import io
import tempfile

@pytest.fixture
def test_image():
    """Фикстура для создания тестового изображения"""
    # Создаем временный файл
    image = Image.new('RGB', (100, 100), color='red')
    temp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
    image.save(temp_file, 'JPEG')
    temp_file.seek(0)
    
    # Создаем SimpleUploadedFile для тестирования
    return SimpleUploadedFile(
        name='test_image.jpg',
        content=temp_file.read(),
        content_type='image/jpeg'
    )

@pytest.fixture
def auth_client(client):
    """Фикстура для создания авторизованного клиента"""
    # Здесь можно добавить логику для авторизации клиента, если потребуется
    return client
