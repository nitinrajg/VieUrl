# Generated by Django 5.1.6 on 2025-02-25 18:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("downloader", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="videodownload",
            name="file",
            field=models.FileField(upload_to="downloads/"),
        ),
        migrations.AlterField(
            model_name="videodownload",
            name="platform",
            field=models.CharField(default="youtube", max_length=20),
        ),
    ]
