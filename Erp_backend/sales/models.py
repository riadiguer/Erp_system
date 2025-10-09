import uuid
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone
from django.utils.text import slugify

# ---------- Helpers ----------
def money(value) -> Decimal:
    return (Decimal(value) if value is not None else Decimal("0.00")).quantize(Decimal("0.01"))

def next_code(prefix: str, last_number: int | None) -> str:
    """
    Simple sequence helper. En prod, préférez un modèle Sequence ou une table dédiée
    avec verrouillage (SELECT FOR UPDATE) pour éviter les collisions en concurrence.
    """
    n = (last_number or 0) + 1
    return f"{prefix}{n:06d}", n


# ---------- Bases ----------
class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ---------- Référentiel Clients / Adresses ----------
class Customer(TimeStampedModel):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=64, blank=True)  # NIF, TVA, etc.
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.name


# ---------- Produits ----------
class Product(TimeStampedModel):
    class ProductType(models.TextChoices):
        GOOD = "GOOD", "Produit"
        SERVICE = "SERVICE", "Service"

    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=10, choices=ProductType.choices, default=ProductType.GOOD)

    unit = models.CharField(max_length=16, default="unit")  # ex: unit, kg, h
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    track_stock = models.BooleanField(default=True)  # False pour services
    stock_qty = models.DecimalField(max_digits=14, decimal_places=3, default=Decimal("0.000"))

    tax_rate = models.DecimalField(  # TVA par défaut si non spécifiée sur la ligne
        max_digits=5, decimal_places=2, default=Decimal("0.00")
    )  # ex 19.00 => 19%

    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=["name"])]

    def __str__(self) -> str:
        return f"{self.sku} — {self.name}"


# ---------- Commandes ----------
class Order(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Brouillon"
        CONFIRMED = "CONFIRMED", "Confirmée"
        PARTIALLY_DELIVERED = "PART_DELIV", "Partiellement livrée"
        DELIVERED = "DELIVERED", "Livrée"
        CANCELLED = "CANCELLED", "Annulée"

    code = models.CharField(max_length=20, unique=True, editable=False)  # ORD000001
    seq = models.IntegerField(default=0, editable=False)

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)

    currency = models.CharField(max_length=8, default="DZD")
    expected_delivery_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    sales_point = models.ForeignKey(
        "sales.SalesPoint",
        on_delete=models.PROTECT,
        null=True,
        blank=False,
        related_name="orders",
        help_text="Where this order was initiated (showroom, social media, etc.)"
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self) -> str:
        return self.code

    def clean(self):
        if self.status == self.Status.CANCELLED and self.delivery_notes.exclude(status=DeliveryNote.Status.CANCELLED).exists():
            raise ValidationError("Impossible d'annuler : des BL non annulés existent.")

    def recompute_totals(self, save=True):
        sub = Decimal("0.00")
        tax = Decimal("0.00")
        for line in self.lines.all():
            sub += money(line.subtotal)
            tax += money(line.tax_amount)
        self.subtotal = money(sub)
        self.tax_amount = money(tax)
        self.total = money(sub + tax)
        if save:
            super().save(update_fields=["subtotal", "tax_amount", "total", "updated_at"])

    def confirm(self):
        if self.status != self.Status.DRAFT:
            raise ValidationError("Seules les commandes brouillon peuvent être confirmées.")
        if self.lines.count() == 0:
            raise ValidationError("Impossible de confirmer une commande vide.")
        self.status = self.Status.CONFIRMED
        self.save(update_fields=["status", "updated_at"])

    def _refresh_delivery_status(self):
        # met à jour le statut en fonction des quantités livrées
        total_qty = Decimal("0.000")
        delivered_qty = Decimal("0.000")
        for l in self.lines.all():
            total_qty += l.quantity
            delivered_qty += l.delivered_qty
        if delivered_qty == 0:
            # rester sur CONFIRMED
            pass
        elif delivered_qty < total_qty:
            if self.status in (self.Status.CONFIRMED, self.Status.DRAFT):
                self.status = self.Status.PARTIALLY_DELIVERED
                self.save(update_fields=["status", "updated_at"])
        else:
            self.status = self.Status.DELIVERED
            self.save(update_fields=["status", "updated_at"])

    def save(self, *args, **kwargs):
        if not self.code:
            # ATTENTION: pour la concurrence, verrouillez via une table Sequence.
            last_seq = Order.objects.aggregate(m=models.Max("seq"))["m"] or 0
            code, n = next_code("ORD", last_seq)
            self.code = code
            self.seq = n
        super().save(*args, **kwargs)


class OrderLine(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_lines")
    description = models.CharField(max_length=255, blank=True)

    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="TVA %")

    # totaux mis en cache (dérivés)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    # suivi livraison
    delivered_qty = models.DecimalField(max_digits=14, decimal_places=3, default=Decimal("0.000"))

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gt=0), name="orderline_qty_gt_0"),
        ]

    def __str__(self) -> str:
        return f"{self.order.code} · {self.product.sku}"

    def compute_amounts(self):
        sub = money(self.quantity * self.unit_price)
        tax = money(sub * (self.tax_rate / Decimal("100")))
        self.subtotal = sub
        self.tax_amount = tax
        self.total = money(sub + tax)

    def clean(self):
        if self.product.type == Product.ProductType.SERVICE and self.product.track_stock:
            raise ValidationError("Un service ne doit pas suivre le stock.")
        if self.tax_rate < 0:
            raise ValidationError("TVA négative interdite.")

    def save(self, *args, **kwargs):
        # Définir TVA par défaut depuis le produit si non fournie
        if self.tax_rate is None:
            self.tax_rate = self.product.tax_rate
        self.compute_amounts()
        super().save(*args, **kwargs)
        # Recalcule les totaux de la commande
        self.order.recompute_totals(save=True)


# ---------- Bons de livraison ----------
class DeliveryNote(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Brouillon"
        SENT = "SENT", "Envoyé"
        DELIVERED = "DELIVERED", "Livré"
        CANCELLED = "CANCELLED", "Annulé"

    code = models.CharField(max_length=20, unique=True, editable=False)  # BL000001
    seq = models.IntegerField(default=0, editable=False)

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="delivery_notes")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    delivered_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.code

    def clean(self):
        if self.status == self.Status.DELIVERED and self.lines.count() == 0:
            raise ValidationError("BL livré sans lignes.")
        # interdit de dépasser les quantités commandées
        for dl in self.lines.all():
            ordered = dl.order_line.quantity
            already = dl.order_line.delivered_qty
            if already - dl.quantity > ordered or dl.quantity <= 0:
                raise ValidationError("Quantités de livraison invalides.")

    def mark_delivered(self):
        if self.status == self.Status.DELIVERED:
            return
        if self.lines.count() == 0:
            raise ValidationError("Aucune ligne à livrer.")
        with transaction.atomic():
            for dl in self.lines.select_for_update():
                ol = dl.order_line
                # maj delivered_qty côté commande
                ol.delivered_qty = money(ol.delivered_qty + dl.quantity)
                ol.save(update_fields=["delivered_qty", "updated_at"])
                # décrément stock si applicable
                p = ol.product
                if p.track_stock and p.type == Product.ProductType.GOOD:
                    if p.stock_qty < dl.quantity:
                        raise ValidationError(f"Stock insuffisant pour {p.sku}.")
                    p.stock_qty = p.stock_qty - dl.quantity
                    p.save(update_fields=["stock_qty", "updated_at"])
            self.status = self.Status.DELIVERED
            self.delivered_at = timezone.now()
            super().save(update_fields=["status", "delivered_at", "updated_at"])
            # rafraîchir le statut de la commande
            self.order._refresh_delivery_status()

    def save(self, *args, **kwargs):
        if not self.code:
            last_seq = DeliveryNote.objects.aggregate(m=models.Max("seq"))["m"] or 0
            code, n = next_code("BL", last_seq)
            self.code, self.seq = code, n
        super().save(*args, **kwargs)


class DeliveryLine(TimeStampedModel):
    delivery = models.ForeignKey(DeliveryNote, on_delete=models.CASCADE, related_name="lines")
    order_line = models.ForeignKey(OrderLine, on_delete=models.PROTECT, related_name="delivery_lines")
    quantity = models.DecimalField(max_digits=14, decimal_places=3)

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gt=0), name="deliveryline_qty_gt_0"),
            models.UniqueConstraint(fields=["delivery", "order_line"], name="uniq_delivery_orderline"),
        ]

    def __str__(self) -> str:
        return f"{self.delivery.code} · {self.order_line.product.sku}"

    def clean(self):
        # ne pas dépasser le restant à livrer
        remaining = self.order_line.quantity - self.order_line.delivered_qty
        if self.quantity > remaining:
            raise ValidationError("Quantité livrée > quantité restante à livrer.")


# ---------- Factures ----------
class Invoice(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Brouillon"
        ISSUED = "ISSUED", "Émise"
        PARTIALLY_PAID = "PART_PAID", "Partiellement payée"
        PAID = "PAID", "Payée"
        CANCELLED = "CANCELLED", "Annulée"

    code = models.CharField(max_length=20, unique=True, editable=False)  # INV000001
    seq = models.IntegerField(default=0, editable=False)

    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="invoices")

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(blank=True, null=True)

    currency = models.CharField(max_length=8, default="DZD")
    notes = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    balance_due = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "issue_date"])]

    def __str__(self) -> str:
        return self.code

    def recompute_totals(self, save=True):
        sub = Decimal("0.00")
        tax = Decimal("0.00")
        for line in self.lines.all():
            sub += money(line.subtotal)
            tax += money(line.tax_amount)
        total = money(sub + tax)
        self.subtotal = money(sub)
        self.tax_amount = money(tax)
        self.total = total
        self.amount_paid = money(
            self.payments.aggregate(s=models.Sum("amount"))["s"] or Decimal("0.00")
        )
        self.balance_due = money(total - self.amount_paid)
        # maj statut
        if self.status not in (self.Status.CANCELLED, self.Status.DRAFT):
            if self.amount_paid <= 0:
                self.status = self.Status.ISSUED
            elif self.amount_paid < self.total:
                self.status = self.Status.PARTIALLY_PAID
            else:
                self.status = self.Status.PAID
        if save:
            super().save(update_fields=[
                "subtotal", "tax_amount", "total", "amount_paid", "balance_due", "status", "updated_at"
            ])

    def issue(self):
        if self.status != self.Status.DRAFT:
            raise ValidationError("Seules les factures brouillon peuvent être émises.")
        self.status = self.Status.ISSUED
        self.save(update_fields=["status", "updated_at"])

    def save(self, *args, **kwargs):
        if not self.code:
            last_seq = Invoice.objects.aggregate(m=models.Max("seq"))["m"] or 0
            code, n = next_code("INV", last_seq)
            self.code, self.seq = code, n
        super().save(*args, **kwargs)


class InvoiceLine(TimeStampedModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="invoice_lines")
    description = models.CharField(max_length=255, blank=True)

    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gt=0), name="invoiceline_qty_gt_0"),
        ]

    def __str__(self) -> str:
        return f"{self.invoice.code} · {self.product.sku}"

    def compute_amounts(self):
        sub = money(self.quantity * self.unit_price)
        tax = money(sub * (self.tax_rate / Decimal("100")))
        self.subtotal = sub
        self.tax_amount = tax
        self.total = money(sub + tax)

    def save(self, *args, **kwargs):
        if self.tax_rate is None:
            self.tax_rate = self.product.tax_rate
        self.compute_amounts()
        super().save(*args, **kwargs)
        self.invoice.recompute_totals(save=True)


# ---------- Paiements ----------
class Payment(TimeStampedModel):
    class Method(models.TextChoices):
        CASH = "CASH", "Espèces"
        CARD = "CARD", "Carte"
        TRANSFER = "TRANSFER", "Virement"
        CHECK = "CHECK", "Chèque"
        OTHER = "OTHER", "Autre"

    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    method = models.CharField(max_length=10, choices=Method.choices, default=Method.CASH)
    reference = models.CharField(max_length=64, blank=True)
    received_at = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-received_at"]
        indexes = [models.Index(fields=["method", "received_at"])]

    def __str__(self) -> str:
        return f"{self.invoice.code} · {self.amount} {self.invoice.currency}"

    def clean(self):
        if self.amount <= 0:
            raise ValidationError("Montant de paiement invalide.")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalcule les totaux et le statut de la facture
        self.invoice.recompute_totals(save=True)

# ---------- Points de vente ----------

class SalesPoint(models.Model):
    class Kind(models.TextChoices):
        SHOWROOM = "SHOWROOM", "Showroom / POS"
        SOCIAL   = "SOCIAL",   "Social media"
        WHATSAPP = "WHATSAPP", "WhatsApp / Phone"
        WEBSITE  = "WEBSITE",  "Website"
        MARKET   = "MARKET",   "Marketplace"
        FACTORY  = "FACTORY",  "Factory / Wholesale"
        DEPOT   = "DEPOT",    "Depot"
        OTHER    = "OTHER",    "Other"

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=120, unique=True)           # human name shown to staff
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.SHOWROOM, db_index=True)
    is_active = models.BooleanField(default=True)
    meta = models.JSONField(default=dict, blank=True)              # freeform: {platform, account, store, phone, etc.}
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


# ---------- Devis ----------
class Quote(models.Model):
    class Status(models.TextChoices):
        DRAFT    = "DRAFT", "Draft"
        SENT     = "SENT", "Sent"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        EXPIRED  = "EXPIRED", "Expired"

    id = models.UUIDField(primary_key=True,  default=uuid.uuid4 , editable=False)
    code = models.CharField(max_length=20, unique=True, editable=False)  # QTE000001
    seq = models.IntegerField(default=0, editable=False)

    customer = models.ForeignKey("sales.Customer", on_delete=models.PROTECT, related_name="quotes")
    sales_point = models.ForeignKey("sales.SalesPoint", on_delete=models.PROTECT, related_name="quotes", null=True, blank=True)

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT, db_index=True)
    currency = models.CharField(max_length=8, default="DZD")
    valid_until = models.DateField(blank=True, null=True)  # validity period
    notes = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    decided_at = models.DateTimeField(blank=True, null=True)  # when accepted/rejected

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"])]

    def save(self, *args, **kwargs):
        if not self.code:
            last_seq = Quote.objects.aggregate(m=models.Max("seq"))["m"] or 0
            code, n = next_code("QTE", last_seq)
            self.code, self.seq = code, n
        super().save(*args, **kwargs)

    def recompute_totals(self, save=True):
        sub = tax = Decimal("0.00")
        for line in self.lines.all():
            sub += money(line.subtotal)
            tax += money(line.tax_amount)
        self.subtotal = money(sub)
        self.tax_amount = money(tax)
        self.total = money(sub + tax)
        if save:
            super().save(update_fields=["subtotal", "tax_amount", "total", "updated_at"])

    def mark_sent(self):
        if self.status == self.Status.DRAFT:
            self.status = self.Status.SENT
            self.sent_at = timezone.now()
            self.save(update_fields=["status", "sent_at", "updated_at"])

    def accept(self):
        if self.status not in (self.Status.SENT,):
            raise ValueError("Only sent quotes can be accepted.")
        self.status = self.Status.ACCEPTED
        self.decided_at = timezone.now()
        self.save(update_fields=["status", "decided_at", "updated_at"])

    def reject(self):
        if self.status not in (self.Status.SENT,):
            raise ValueError("Only sent quotes can be rejected.")
        self.status = self.Status.REJECTED
        self.decided_at = timezone.now()
        self.save(update_fields=["status", "decided_at", "updated_at"])

    def expire(self):
        self.status = self.Status.EXPIRED
        self.save(update_fields=["status", "updated_at"])


class QuoteLine(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey("sales.Product", on_delete=models.PROTECT, related_name="quote_lines")
    description = models.CharField(max_length=255, blank=True)

    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)  # sourced from Product
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)     # sourced from Product

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gt=0), name="quoteline_qty_gt_0"),
        ]

    def compute_amounts(self):
        sub = money(self.quantity * self.unit_price)
        tax = money(sub * (self.tax_rate / Decimal("100")))
        self.subtotal = sub
        self.tax_amount = tax
        self.total = money(sub + tax)

    def save(self, *args, **kwargs):
        if self.tax_rate is None:
            self.tax_rate = self.product.tax_rate
        if self.unit_price is None:
            self.unit_price = self.product.unit_price
        self.compute_amounts()
        super().save(*args, **kwargs)
        self.quote.recompute_totals(save=True)