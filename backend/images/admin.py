from django.contrib import admin
from .models import Image

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('id',)
    readonly_fields = ('id', 'uploaded_at')
    date_hierarchy = 'uploaded_at'
