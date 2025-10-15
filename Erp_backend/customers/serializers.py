from rest_framework import serializers
from .models import Customer, CustomerContact

class CustomerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = (
            "name", "email", "phone", "tax_id",
            "billing_address", "shipping_address",
            "notes", "is_active",
        )

    def validate_email(self, v):
        if v:
            qs = Customer.objects.filter(email__iexact=v.strip())
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            # If you want to block exact duplicates:
            # if qs.exists():
            #     raise serializers.ValidationError("Un client avec cet e-mail existe déjà.")
        return v

class CustomerSerializer(serializers.ModelSerializer):
    contacts = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = "__all__"

    def get_contacts(self, obj):
        # Avoid N+1 by .prefetch_related('contacts') in the ViewSet
        return [
            {
                "id": c.id, "name": c.name, "email": c.email,
                "phone": c.phone, "role": c.role, "is_primary": c.is_primary,
            }
            for c in getattr(obj, "contacts", []).all()
        ]

class CustomerContactWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerContact
        fields = ("customer", "name", "email", "phone", "role", "is_primary")

class CustomerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerContact
        fields = "__all__"
