from django.contrib import admin
from .models import Customer, CustomerContact

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "tax_id", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "email", "phone", "tax_id")
    ordering = ("name",)

@admin.register(CustomerContact)
class CustomerContactAdmin(admin.ModelAdmin):
    list_display = ("name", "customer", "email", "phone", "role", "is_primary")
    list_filter = ("is_primary",)
    search_fields = ("name", "email", "phone", "role")
