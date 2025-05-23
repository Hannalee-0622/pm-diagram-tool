from rest_framework import serializers
from .models import Diagram

class DiagramSerializer(serializers.ModelSerializer):
    # force DRF to treat spec as JSON, not as a CharField
    spec = serializers.JSONField()

    class Meta:
        model = Diagram
        fields = [
            "id",
            "keyword",
            "lang",
            "start_date",
            "end_date",
            "spec",
            # you can omit created_at from write if you never POST it
        ]
        read_only_fields = ["id", "created_at"]