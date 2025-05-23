from django.db import models
import jsonfield  # 만약 안 되어 있다면 jsonfield 패키지를 설치해야 함

class Diagram(models.Model):
    keyword = models.CharField(max_length=200)
    lang = models.CharField(max_length=10)
    start_date = models.DateField()
    end_date = models.DateField()
    spec = jsonfield.JSONField()  # 또는 models.JSONField() (Django 3.1 이상이면 가능)

    created_at = models.DateTimeField(auto_now_add=True)  # 👈 이 줄 추가
