# Generated by Django 3.0.4 on 2020-05-03 14:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0002_pics_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pics',
            name='category',
            field=models.CharField(blank=True, choices=[('Traditional', 'Traditional'), ('Accessories', 'Accessories'), ('Jeans', 'Jeans'), ('Tops', 'Tops')], max_length=50, null=True),
        ),
    ]
