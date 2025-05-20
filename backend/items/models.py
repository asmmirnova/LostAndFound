from django.db import models
from django.conf import settings
from images.models import Image

# Список доступных цветов
COLOR_CHOICES = [
    ('red', 'Красный'),
    ('orange', 'Оранжевый'),
    ('yellow', 'Желтый'),
    ('green', 'Зеленый'),
    ('blue', 'Синий'),
    ('purple', 'Фиолетовый'),
    ('pink', 'Розовый'),
    ('brown', 'Коричневый'),
    ('black', 'Черный'),
    ('white', 'Белый'),
    ('gray', 'Серый'),
    ('gold', 'Золотой'),
    ('silver', 'Серебряный'),
    ('beige', 'Бежевый'),
    ('navy', 'Темно-синий'),
    ('teal', 'Бирюзовый'),
    ('olive', 'Оливковый'),
    ('maroon', 'Бордовый'),
    ('lime', 'Лаймовый'),
    ('aqua', 'Аквамарин'),
    ('coral', 'Коралловый'),
    ('magenta', 'Пурпурный'),
    ('cyan', 'Голубой'),
    ('lavender', 'Лавандовый'),
    ('salmon', 'Лососевый'),
    ('tan', 'Загар'),
    ('khaki', 'Хаки'),
    ('indigo', 'Индиго'),
    ('turquoise', 'Бирюзовый'),
    ('violet', 'Фиалковый'),
    ('crimson', 'Малиновый'),
    ('plum', 'Сливовый'),
    ('chocolate', 'Шоколадный'),
    ('charcoal', 'Угольный'),
    ('cream', 'Кремовый'),
    ('mint', 'Мятный'),
    ('emerald', 'Изумрудный'),
    ('ruby', 'Рубиновый'),
    ('sapphire', 'Сапфировый'),
    ('amber', 'Янтарный'),
]

# Типы объявлений
ITEM_TYPES = [
    ('lost', 'Потерянная вещь'),
    ('found', 'Найденная вещь'),
]

# Статусы объявлений
STATUS_CHOICES = [
    ('active', 'Активно'),
    ('resolved', 'Решено'),
    ('closed', 'Закрыто'),
]

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Item(models.Model):
    # Основная информация
    type = models.CharField(max_length=10, choices=ITEM_TYPES, verbose_name="Тип объявления")
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, verbose_name="Цвет")
    
    # Даты и местоположение
    date_event = models.DateField(verbose_name="Дата потери/находки")
    location_event = models.CharField(max_length=255, verbose_name="Место потери/находки")
    
    # Связи
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='items', verbose_name="Пользователь")
    images = models.ManyToManyField(Image, related_name='items', blank=True, verbose_name="Изображения")
    tags = models.ManyToManyField(Tag, related_name='items', blank=True, verbose_name="Теги")
    
    # Статус и дополнительная информация
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active', verbose_name="Статус")
    reward = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Вознаграждение")
    storage_location = models.CharField(max_length=255, null=True, blank=True, verbose_name="Место хранения")
    hidden_details = models.TextField(null=True, blank=True, verbose_name="Скрытые детали для верификации")
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Объявление"
        verbose_name_plural = "Объявления"
    
    def __str__(self):
        return f"{self.get_type_display()}: {self.title}"
