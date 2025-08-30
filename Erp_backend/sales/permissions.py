from rest_framework import permissions

def has_any(user, codes: list[str]):
    # accept both app_label.codename and raw codename coming from rbac.Feature
    for code in codes:
        if user.has_perm(f"rbac.{code}") or user.has_perm(f"sales.{code}"):
            return True
    return False

class SalesPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return has_any(request.user, ["sales_view"])
        return has_any(request.user, ["sales_manage"])

class InvoicesPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return has_any(request.user, ["invoices_view"])
        return has_any(request.user, ["invoices_manage"])
