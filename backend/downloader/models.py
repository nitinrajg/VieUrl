from django.db import models
import uuid
import os

def get_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('downloads', filename)

class VideoDownload(models.Model):
    url = models.URLField()
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='downloads/')
    quality = models.CharField(max_length=20)
    platform = models.CharField(max_length=20, default='youtube')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        # Delete the file when model is deleted
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
