from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers
User = get_user_model()

class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ("id","email","username","first_name","last_name","roles","permissions")
    def get_roles(self, obj):
        return list(obj.groups.values_list("name", flat=True))  # display labels
    def get_permissions(self, obj):
        # ['rbac.sales_view', ...] -> ['sales_view', ...]
        return [p.split('.',1)[1] for p in obj.get_all_permissions()]

class AdminCreateUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)          # e.g. "Receptionist"
    password = serializers.CharField(write_only=True,min_length=8)
    class Meta:
        model = User
        fields = ("username","email","first_name","last_name","password","role")
    def validate_email(self, v):
        if User.objects.filter(email__iexact=v).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return v
    def create(self, data):
        role_name = data.pop("role"); pwd = data.pop("password")
        user = User.objects.create_user(**data); user.set_password(pwd); user.save()
        group = Group.objects.get(name=role_name)
        user.groups.add(group)
        return user
