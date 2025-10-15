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
    
class ProductsPermission(permissions.BasePermission):
    ACTION_PERMS = {
        "create": ["stock_manage"],
        "update": ["stock_manage"],
        "partial_update": ["stock_manage"],
        "destroy": ["stock_manage"],
        # custom actions
        "set_price": ["stock_manage"],
        "adjust_stock": ["stock_manage"],
        "activate": ["stock_manage"],
        "deactivate": ["stock_manage"],
        # read
        "list": ["stock_view"],
        "retrieve": ["stock_view"],
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True
        m = dict(self.ACTION_PERMS)
        m.update(getattr(view, "ACTION_PERMS", {}))
        action = getattr(view, "action", None)
        if action and action in m:
            return has_any(request.user, m[action])
        if request.method in permissions.SAFE_METHODS:
            return has_any(request.user, ["stock_view"])
        return has_any(request.user, ["stock_manage"])

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)