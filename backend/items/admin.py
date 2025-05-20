from django.contrib import admin
from .models import Item, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'title', 'user', 'status', 'date_event', 'created_at')
    list_filter = ('type', 'status', 'color', 'date_event', 'created_at')
    search_fields = ('title', 'description', 'location_event')
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('images', 'tags')
    fieldsets = (
        ('Основная информация', {
            'fields': ('type', 'title', 'description', 'color')
        }),
        ('Даты и местоположение', {
            'fields': ('date_event', 'location_event')
        }),
        ('Связи', {
            'fields': ('user', 'images', 'tags')
        }),
        ('Статус и дополнительная информация', {
            'fields': ('status', 'reward', 'storage_location', 'hidden_details')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
