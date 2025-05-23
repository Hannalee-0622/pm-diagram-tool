from django.urls import path, include
from .views import GeneratePlan, DiagramCreateView, DiagramDetailView
app_name = "api" 
urlpatterns = [
    path('generate-plan/', GeneratePlan.as_view(), name='generate-plan'),
    path('diagrams/', DiagramCreateView.as_view(), name='create-diagram'),
    path('diagrams/<int:id>/', DiagramDetailView.as_view(), name='diagram-detail'),
]
