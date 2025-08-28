# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User, Group

# Unregister the default User admin if present
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Extends the default User admin:
    - Adds a 'Roles' column (Django Groups)
    - Keeps default fieldsets/forms from BaseUserAdmin
    """
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "list_roles")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)

    def list_roles(self, obj):
        return ", ".join(g.name for g in obj.groups.all())
    list_roles.short_description = "Roles"

# Ensure Group is registered (it usually is by default, but this is safe)
try:
    admin.site.register(Group)
except admin.sites.AlreadyRegistered:
    pass
