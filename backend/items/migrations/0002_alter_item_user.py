from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_delete_userpassword'),
        ('items', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='users.user', verbose_name='Пользователь'),
        ),
    ]
