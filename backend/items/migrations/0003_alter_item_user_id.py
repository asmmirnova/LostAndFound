from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0002_alter_item_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='user_id',
            field=models.UUIDField(),
        ),
    ]
