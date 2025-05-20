from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Image
from .serializers import ImageSerializer

class ImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ImageDetailView(APIView):
    def get(self, request, image_id):
        try:
            image = Image.objects.get(id=image_id)
            serializer = ImageSerializer(image)
            return Response(serializer.data)
        except Image.DoesNotExist:
            return Response(
                {"error": "Изображение не найдено"}, 
                status=status.HTTP_404_NOT_FOUND
            )
