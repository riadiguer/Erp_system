from django.db import models
from django.core.exceptions import ValidationError

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Customer(TimeStampedModel):
    name = models.CharField(max_length=200, db_index=True)
    email = models.EmailField(blank=True, null=True, unique=False)   # unique optional (some clients share inboxes)
    phone = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        # Example guard: if email provided, avoid exact duplicates on (lowercase email, name)
        if self.email:
            existing = Customer.objects.filter(email__iexact=self.email.strip())
            if self.pk:
                existing = existing.exclude(pk=self.pk)
            # Allow duplicates if business wants; else raise ValidationError here.

class CustomerContact(TimeStampedModel):
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE, related_name="contacts")
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=80, blank=True)   # e.g. Achat, Comptabilité
    is_primary = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["customer", "name"]),
            models.Index(fields=["customer", "is_primary"]),
        ]

    def __str__(self):
        return f"{self.customer.name} – {self.name}"

    def clean(self):
        if self.is_primary:
            qs = CustomerContact.objects.filter(customer=self.customer, is_primary=True)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            if qs.exists():
                raise ValidationError("Ce client a déjà un contact principal.")
