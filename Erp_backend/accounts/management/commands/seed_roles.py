from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

ROLE_DEF = {
    "Admin": [
        "sales_view","sales_manage",
        "invoices_view","invoices_manage",
        "stock_view","stock_manage",
        "purchasing_view","purchasing_manage",
        "users_manage",
    ],
    "Boutique Manager": [
        "sales_view","sales_manage",
        "invoices_view","invoices_manage",
        "stock_view","stock_manage",
        "purchasing_view","purchasing_manage",
    ],
    "Receptionist": [
        "sales_view","invoices_view","stock_view","purchasing_view",
    ],
}

class Command(BaseCommand):
    help = "Create groups (roles) and attach stable permission codes"

    def handle(self, *args, **kwargs):
        for role_name, codes in ROLE_DEF.items():
            group, _ = Group.objects.get_or_create(name=role_name)
            added = 0
            for code in codes:
                try:
                    p = Permission.objects.get(codename=code)
                    group.permissions.add(p); added += 1
                except Permission.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Missing permission: {code}"))
            self.stdout.write(self.style.SUCCESS(f"{role_name}: ensured {added} permissions"))
        self.stdout.write(self.style.SUCCESS("Roles seeding completed."))
