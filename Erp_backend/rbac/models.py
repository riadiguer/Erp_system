from django.db import models

class Feature(models.Model):
    """Dummy model to host custom permissions (we won't use the table)."""
    class Meta:
        permissions = [
            ("sales_view",        "Can view sales"),
            ("sales_manage",      "Can manage sales"),
            ("invoices_view",     "Can view invoices"),
            ("invoices_manage",   "Can manage invoices"),
            ("stock_view",        "Can view stock"),
            ("stock_manage",      "Can manage stock"),
            ("purchasing_view",   "Can view purchasing"),
            ("purchasing_manage", "Can manage purchasing"),
            ("users_manage",      "Can manage users & roles"),
        ]
