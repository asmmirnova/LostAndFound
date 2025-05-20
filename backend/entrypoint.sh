#!/bin/sh

# Ждем, пока база данных будет готова
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Применяем миграции
python manage.py makemigrations
python manage.py migrate

# Запускаем сервер
exec "$@"
