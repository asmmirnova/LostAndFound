from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Item, Tag
from .serializers import ItemCreateSerializer, ItemDetailSerializer, ItemListSerializer, TagSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Разрешения на чтение разрешены для любого запроса
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Разрешения на запись только владельцу объекта
        return obj.user == request.user

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Tag.objects.all()
        # Поиск по имени тега
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return ItemCreateSerializer
        elif self.action == 'retrieve':
            return ItemDetailSerializer
        return ItemListSerializer
    
    def get_queryset(self):
        queryset = Item.objects.all()
        
        # Фильтрация по типу объявления (lost/found)
        item_type = self.request.query_params.get('type', None)
        if item_type:
            queryset = queryset.filter(type=item_type)
        
        # Фильтрация по статусу
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Фильтрация по цвету
        color = self.request.query_params.get('color', None)
        if color:
            queryset = queryset.filter(color=color)
        
        # Фильтрация по тегам
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__name__icontains=tag)
        
        # Поиск по названию и описанию
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(location_event__icontains=search)
            )
        
        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Фильтрация по дате события
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(date_event__gte=date_from)
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(date_event__lte=date_to)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Пагинация с использованием offset
        offset = int(request.query_params.get('offset', 0))
        limit = int(request.query_params.get('limit', 10))
        
        # Получаем общее количество объектов
        total_count = queryset.count()
        
        # Применяем пагинацию
        queryset = queryset[offset:offset + limit]
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': total_count,
            'next': offset + limit < total_count,
            'previous': offset > 0,
            'results': serializer.data
        })
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_items(self, request):
        queryset = self.get_queryset().filter(user=request.user)
        
        # Пагинация с использованием offset
        offset = int(request.query_params.get('offset', 0))
        limit = int(request.query_params.get('limit', 10))
        
        # Получаем общее количество объектов
        total_count = queryset.count()
        
        # Применяем пагинацию
        queryset = queryset[offset:offset + limit]
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': total_count,
            'next': offset + limit < total_count,
            'previous': offset > 0,
            'results': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        item = self.get_object()
        status_param = request.data.get('status', None)
        
        if not status_param:
            return Response({'error': 'Статус не указан'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import STATUS_CHOICES
        if status_param not in [choice[0] for choice in STATUS_CHOICES]:
            return Response({'error': 'Недопустимый статус'}, status=status.HTTP_400_BAD_REQUEST)
        
        item.status = status_param
        item.save()
        
        serializer = ItemDetailSerializer(item)
        return Response(serializer.data)
