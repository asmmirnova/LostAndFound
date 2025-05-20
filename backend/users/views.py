from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Q
from .serializers import UserSerializer, LoginSerializer, UserProfileSerializer
from .models import User
from items.models import Item

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Пользователь успешно зарегистрирован',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Создаем JWT токены
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'login': user.login
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, login=None):
        try:
            if login:
                user = User.objects.get(login=login)
            else:
                user = request.user
                
            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request, login=None):
    try:
        if login:
            user = User.objects.get(login=login)
        else:
            user = request.user
        
        # Получаем статистику по объявлениям пользователя
        active_count = Item.objects.filter(user=user, status='active').count()
        resolved_count = Item.objects.filter(user=user, status='resolved').count()
        closed_count = Item.objects.filter(user=user, status='closed').count()
        
        # Получаем общее количество объявлений
        total_count = active_count + resolved_count + closed_count
        
        return Response({
            'active_count': active_count,
            'resolved_count': resolved_count,
            'closed_count': closed_count,
            'total_count': total_count
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_items(request, login=None):
    try:
        if login:
            user = User.objects.get(login=login)
        else:
            user = request.user
        
        # Получаем объявления пользователя
        items = Item.objects.filter(user=user).order_by('-created_at')
        
        # Используем сериализатор из приложения items
        from items.serializers import ItemListSerializer
        serializer = ItemListSerializer(items, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
