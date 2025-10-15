from rest_framework import permissions


def has_any(user, codes: list[str]):
    """
    Vérifie si l'utilisateur a au moins une des permissions spécifiées
    Accepte à la fois app_label.codename et codename brut venant de rbac.Feature
    """
    for code in codes:
        if user.has_perm(f"rbac.{code}") or user.has_perm(f"warehouse.{code}"):
            return True
    return False


class WarehousePermission(permissions.BasePermission):
    """Permission générale pour le module warehouse"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return has_any(request.user, ["warehouse_view"])
        return has_any(request.user, ["warehouse_manage"])


class MaterialsPermission(permissions.BasePermission):
    """Permission pour les matières premières"""
    
    ACTION_PERMS = {
        "create": ["materials_manage"],
        "update": ["materials_manage"],
        "partial_update": ["materials_manage"],
        "destroy": ["materials_manage"],
        # Actions personnalisées
        "adjust_stock": ["stock_manage"],
        "low_stock": ["materials_view"],
        "statistics": ["materials_view"],
        # Lecture
        "list": ["materials_view"],
        "retrieve": ["materials_view"],
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
            return has_any(request.user, ["materials_view"])
        return has_any(request.user, ["materials_manage"])

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CategoriesPermission(permissions.BasePermission):
    """Permission pour les catégories"""
    
    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return has_any(request.user, ["categories_view", "materials_view"])
        return has_any(request.user, ["categories_manage"])

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class SuppliersPermission(permissions.BasePermission):
    """Permission pour les fournisseurs"""
    
    ACTION_PERMS = {
        "create": ["suppliers_manage"],
        "update": ["suppliers_manage"],
        "partial_update": ["suppliers_manage"],
        "destroy": ["suppliers_manage"],
        # Actions personnalisées
        "materials": ["suppliers_view", "materials_view"],
        # Lecture
        "list": ["suppliers_view"],
        "retrieve": ["suppliers_view"],
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
            return has_any(request.user, ["suppliers_view"])
        return has_any(request.user, ["suppliers_manage"])

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class StockMovementsPermission(permissions.BasePermission):
    """Permission pour les mouvements de stock"""
    
    ACTION_PERMS = {
        "create": ["stock_manage"],
        "update": ["stock_manage"],  # Normalement, on ne devrait pas modifier les mouvements
        "partial_update": ["stock_manage"],
        "destroy": ["stock_manage"],  # Normalement, on ne devrait pas supprimer les mouvements
        # Actions personnalisées
        "by_material": ["stock_view"],
        "statistics": ["stock_view"],
        # Lecture
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
        # Les mouvements de stock ne devraient normalement pas être modifiés/supprimés
        if request.method not in permissions.SAFE_METHODS:
            return has_any(request.user, ["stock_manage", "warehouse_admin"])
        return self.has_permission(request, view)


class PurchaseOrdersPermission(permissions.BasePermission):
    """Permission pour les bons de commande"""
    
    ACTION_PERMS = {
        "create": ["purchase_orders_manage"],
        "update": ["purchase_orders_manage"],
        "partial_update": ["purchase_orders_manage"],
        "destroy": ["purchase_orders_manage"],
        # Actions personnalisées
        "receive": ["purchase_orders_receive", "stock_manage"],
        "statistics": ["purchase_orders_view"],
        # Lecture
        "list": ["purchase_orders_view"],
        "retrieve": ["purchase_orders_view"],
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
            return has_any(request.user, ["purchase_orders_view"])
        return has_any(request.user, ["purchase_orders_manage"])

    def has_object_permission(self, request, view, obj):
        # Vérification supplémentaire : les commandes reçues ne peuvent plus être modifiées
        if obj.status == 'received' and request.method not in permissions.SAFE_METHODS:
            return has_any(request.user, ["warehouse_admin"])
        return self.has_permission(request, view)


class DashboardPermission(permissions.BasePermission):
    """Permission pour le tableau de bord"""
    
    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True
        
        # Le dashboard est en lecture seule
        return has_any(request.user, ["warehouse_view", "dashboard_view"])


# Liste des permissions à créer dans votre modèle rbac.Feature
"""
Permissions à ajouter dans votre système RBAC:

Module Warehouse:
- warehouse_view: Voir le module entrepôt
- warehouse_manage: Gérer le module entrepôt
- warehouse_admin: Administration complète de l'entrepôt

Matières premières:
- materials_view: Voir les matières premières
- materials_manage: Gérer les matières premières

Catégories:
- categories_view: Voir les catégories
- categories_manage: Gérer les catégories

Fournisseurs:
- suppliers_view: Voir les fournisseurs
- suppliers_manage: Gérer les fournisseurs

Stock:
- stock_view: Voir les stocks
- stock_manage: Gérer les stocks (ajustements, mouvements)

Bons de commande:
- purchase_orders_view: Voir les bons de commande
- purchase_orders_manage: Gérer les bons de commande
- purchase_orders_receive: Recevoir les commandes

Dashboard:
- dashboard_view: Voir le tableau de bord
"""