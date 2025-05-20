FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    apt-get update && \
    apt-get install -y netcat-openbsd

COPY . .

# Делаем entrypoint.sh исполняемым
# Это будет работать только при сборке образа, но не при монтировании тома
RUN chmod +x entrypoint.sh

EXPOSE 8000

# Команда запуска указана в docker-compose.yml
