from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.db import transaction

# central list so you can tweak later
ROLE_PERMS = {
    "admin": [
        "sales_view", "sales_manage",
        "invoices_view", "invoices_manage",
        "stock_view", "stock_manage",
        "purchasing_view", "purchasing_manage",
        "users_manage",
    ],
    "boutic_manager": [
        "sales_view", "sales_manage",
        "invoices_view", "invoices_manage",
        "stock_view", "stock_manage",
        "purchasing_view", "purchasing_manage",
    ],
    "recepcioniste": [
        "sales_view",          # read-only Sales
        "invoices_view",       # read-only Invoices (optional)
        # no *manage* → DRF guard will block writes
    ],
}

def get_perm(app_label: str, codename: str):
    return Permission.objects.get(content_type__app_label=app_label, codename=codename)

class Command(BaseCommand):
    help = "Create default ERP roles (groups) and attach permissions."

    @transaction.atomic
    def handle(self, *args, **options):
        # fetch all rbac perms once
        perms_by_code = {
            p.codename: p
            for p in Permission.objects.filter(content_type__app_label="rbac")
        }

        for role, codes in ROLE_PERMS.items():
            group, _ = Group.objects.get_or_create(name=role)
            group.permissions.clear()
            missing = []
            for code in codes:
                perm = perms_by_code.get(code)
                if not perm:
                    missing.append(code)
                    continue
                group.permissions.add(perm)

            group.save()
            self.stdout.write(self.style.SUCCESS(
                f"→ {role}: {len(codes) - len(missing)} perms attached"
                + (f" (missing: {missing})" if missing else "")
            ))

        self.stdout.write(self.style.SUCCESS("Roles seeded ✅"))
