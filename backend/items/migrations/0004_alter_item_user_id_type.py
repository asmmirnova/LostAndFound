from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0003_alter_item_user_id'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE items_item ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;",
            reverse_sql="ALTER TABLE items_item ALTER COLUMN user_id TYPE integer USING user_id::text::integer;"
        ),
    ]
