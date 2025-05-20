from rest_framework import serializers
from .models import Item, Tag
from images.models import Image
from images.serializers import ImageSerializer

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ItemCreateSerializer(serializers.ModelSerializer):
    # Используем SerializerMethodField для изображений
    images = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )
    
    # Используем SerializerMethodField для тегов
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        write_only=True
    )
    
    # Поля для входных данных при создании (для обратной совместимости)
    images_data = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )
    
    tags_data = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        write_only=True
    )
    
    # Поля для чтения
    images_output = serializers.SerializerMethodField()
    tags_output = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'type', 'title', 'description', 'color', 'date_event', 
            'location_event', 'images', 'tags', 'images_data', 'tags_data', 
            'images_output', 'tags_output',
            'status', 'reward', 'storage_location', 'hidden_details'
        ]
        read_only_fields = ['id', 'images_output', 'tags_output']
    
    def get_images_output(self, obj):
        if hasattr(obj, 'images') and hasattr(obj.images, 'all'):
            return [str(image.id) for image in obj.images.all()]
        return []
    
    def get_tags_output(self, obj):
        if hasattr(obj, 'tags') and hasattr(obj.tags, 'all'):
            return [tag.name for tag in obj.tags.all()]
        return []
    
    def get_images(self, obj):
        if hasattr(obj, 'images') and hasattr(obj.images, 'all'):
            return [str(image.id) for image in obj.images.all()]
        return []
    
    def get_tags(self, obj):
        if hasattr(obj, 'tags') and hasattr(obj.tags, 'all'):
            return [tag.name for tag in obj.tags.all()]
        return []
    
    def create(self, validated_data):
        # Извлекаем теги и изображения из validated_data
        tags_data = validated_data.pop('tags_data', [])
        images_data = validated_data.pop('images_data', [])
        
        # Извлекаем теги и изображения из новых полей
        tags = validated_data.pop('tags', [])
        images = validated_data.pop('images', [])
        
        # Объединяем данные из старых и новых полей
        all_tags = list(set(tags_data + tags))
        all_images = list(set(images_data + images))
        
        # Создаем объявление
        item = Item.objects.create(**validated_data)
        
        # Добавляем теги
        for tag_name in all_tags:
            tag, created = Tag.objects.get_or_create(name=tag_name.lower())
            item.tags.add(tag)
        
        # Добавляем изображения
        for image_id in all_images:
            try:
                image = Image.objects.get(id=image_id)
                item.images.add(image)
            except Image.DoesNotExist:
                pass
        
        return item
    
    def update(self, instance, validated_data):
        # Извлекаем теги и изображения из validated_data
        tags_data = validated_data.pop('tags_data', [])
        images_data = validated_data.pop('images_data', [])
        
        # Извлекаем теги и изображения из новых полей
        tags = validated_data.pop('tags', [])
        images = validated_data.pop('images', [])
        
        # Объединяем данные из старых и новых полей
        all_tags = list(set(tags_data + tags))
        all_images = list(set(images_data + images))
        
        # Обновляем основные поля объявления
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Обновляем теги
        if all_tags:
            # Очищаем существующие теги
            instance.tags.clear()
            # Добавляем новые теги
            for tag_name in all_tags:
                tag, created = Tag.objects.get_or_create(name=tag_name.lower())
                instance.tags.add(tag)
        
        # Обновляем изображения
        if all_images:
            # Очищаем существующие изображения
            instance.images.clear()
            # Добавляем новые изображения
            for image_id in all_images:
                try:
                    image = Image.objects.get(id=image_id)
                    instance.images.add(image)
                except Image.DoesNotExist:
                    pass
        
        return instance
    
    def to_representation(self, instance):
        # Получаем стандартное представление
        representation = super().to_representation(instance)
        
        # Добавляем изображения в правильном формате
        representation['images'] = self.get_images(instance)
        
        # Добавляем теги в правильном формате
        representation['tags'] = self.get_tags(instance)
        
        # Удаляем ненужные поля
        if 'images_output' in representation:
            del representation['images_output']
        if 'tags_output' in representation:
            del representation['tags_output']
        if 'images_data' in representation:
            del representation['images_data']
        if 'tags_data' in representation:
            del representation['tags_data']
        
        return representation

class ItemDetailSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'type', 'title', 'description', 'color', 'date_event', 
            'location_event', 'user', 'images', 'tags', 'status', 'reward', 
            'storage_location', 'hidden_details', 'created_at', 'updated_at'
        ]
    
    def get_images(self, obj):
        # Возвращаем все изображения с контекстом
        if obj.images.exists():
            return [ImageSerializer(image, context=self.context).data for image in obj.images.all()]
        return []

class ItemListSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'type', 'title', 'description', 'color', 'date_event', 
            'location_event', 'user', 'images', 'tags', 'status', 'reward', 
            'created_at'
        ]
    
    def get_images(self, obj):
        # Возвращаем все изображения для списка
        if obj.images.exists():
            # Если есть только одно изображение, все равно возвращаем его в массиве
            return [ImageSerializer(image, context=self.context).data for image in obj.images.all()]
        return []
