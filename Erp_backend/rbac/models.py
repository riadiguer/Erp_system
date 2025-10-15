from django.db import models

class Feature(models.Model):
    """Dummy model to host custom permissions (we won't use the table)."""
    class Meta:
        permissions = [
            # Sales permissions
            ("sales_view",        "Can view sales"),
            ("sales_manage",      "Can manage sales"),
            ("invoices_view",     "Can view invoices"),
            ("invoices_manage",   "Can manage invoices"),
            
            # Stock/Products permissions (existantes)
            ("stock_view",        "Can view stock"),
            ("stock_manage",      "Can manage stock"),
            
            # Purchasing permissions
            ("purchasing_view",   "Can view purchasing"),
            ("purchasing_manage", "Can manage purchasing"),
            
            # Users permissions
            ("users_manage",      "Can manage users & roles"),
            
            # ========== WAREHOUSE PERMISSIONS (NOUVEAU) ==========
            
            # Module général
            ("warehouse_view",    "Can view warehouse module"),
            ("warehouse_manage",  "Can manage warehouse module"),
            ("warehouse_admin",   "Can administrate warehouse module"),
            
            # Matières premières
            ("materials_view",    "Can view materials"),
            ("materials_manage",  "Can manage materials"),
            
            # Catégories
            ("categories_view",   "Can view categories"),
            ("categories_manage", "Can manage categories"),
            
            # Fournisseurs
            ("suppliers_view",    "Can view suppliers"),
            ("suppliers_manage",  "Can manage suppliers"),
            
            # Mouvements de stock (warehouse)
            ("stock_movements_view",   "Can view stock movements"),
            ("stock_movements_manage", "Can manage stock movements"),
            
            # Bons de commande
            ("purchase_orders_view",    "Can view purchase orders"),
            ("purchase_orders_manage",  "Can manage purchase orders"),
            ("purchase_orders_receive", "Can receive purchase orders"),
            
            # Dashboard
            ("dashboard_view",    "Can view warehouse dashboard"),
        ]