from rest_framework import serializers
from .models import Image

class ImageSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Image
        fields = ['id', 'file', 'file_url', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'file_url']
    
    def get_file_url(self, obj):
        if not obj.file:
            return None
            
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        else:
            return f"http://localhost:8000{obj.file.url}"
