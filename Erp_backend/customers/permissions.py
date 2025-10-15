from rest_framework import permissions

def has_any(user, codes: list[str]) -> bool:
    if not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    for code in codes:
        if "." in code and user.has_perm(code):
            return True
        # Try both namespaces to match your existing style
        if user.has_perm(f"rbac.{code}") or user.has_perm(f"customers.{code}"):
            return True
    return False

class CustomersPermission(permissions.BasePermission):
    ACTION_PERMS = {
        "create": ["customers_manage"],
        "update": ["customers_manage"],
        "partial_update": ["customers_manage"],
        "destroy": ["customers_manage"],
        "activate": ["customers_manage"],
        "deactivate": ["customers_manage"],
        "merge": ["customers_manage"],
        "list": ["customers_view"],
        "retrieve": ["customers_view"],
    }

    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True
        m = dict(self.ACTION_PERMS); m.update(getattr(view, "ACTION_PERMS", {}))
        a = getattr(view, "action", None)
        if a and a in m:
            return has_any(request.user, m[a])
        if request.method in permissions.SAFE_METHODS:
            return has_any(request.user, ["customers_view"])
        return has_any(request.user, ["customers_manage"])

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
