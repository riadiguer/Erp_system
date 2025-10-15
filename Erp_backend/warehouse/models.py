from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class Category(models.Model):
    """Catégorie de matières premières"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Fournisseur"""
    name = models.CharField(max_length=200, unique=True, verbose_name="Nom")
    contact_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Nom du contact")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    address = models.TextField(blank=True, null=True, verbose_name="Adresse")
    
    # 🆕 NOUVEAUX CHAMPS
    nif = models.CharField(max_length=50, blank=True, null=True, verbose_name="NIF")
    rc = models.CharField(max_length=50, blank=True, null=True, verbose_name="RC")
    iban = models.CharField(max_length=100, blank=True, null=True, verbose_name="IBAN/RIB")
    payment_mode = models.CharField(
        max_length=20,
        choices=[
            ('cash', 'Espèces'),
            ('bank', 'Virement bancaire'),
            ('check', 'Chèque'),
            ('credit', 'Crédit'),
        ],
        blank=True,
        null=True,
        verbose_name="Mode de paiement"
    )
    payment_delay = models.IntegerField(
        blank=True, 
        null=True, 
        verbose_name="Délai de paiement (jours)",
        help_text="Nombre de jours pour le paiement"
    )
    
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Fournisseur"
        verbose_name_plural = "Fournisseurs"
        ordering = ['name']

    def __str__(self):
        return self.name


class Material(models.Model):
    """Matière première"""
    UNIT_CHOICES = [
        ('mètre', 'Mètre'),
        ('rouleau', 'Rouleau'),
        ('litre', 'Litre'),
        ('kg', 'Kilogramme'),
        ('pièce', 'Pièce'),
        ('boîte', 'Boîte'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nom")
    reference = models.CharField(max_length=50, unique=True, verbose_name="Référence")
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='materials',
        verbose_name="Catégorie"
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='materials',
        verbose_name="Fournisseur"
    )
    stock = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Stock actuel"
    )
    min_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        validators=[MinValueValidator(0)],
        verbose_name="Stock minimum"
    )
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='pièce',
        verbose_name="Unité"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Prix unitaire"
    )
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Matière première"
        verbose_name_plural = "Matières premières"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.reference})"

    @property
    def is_low_stock(self):
        """Vérifie si le stock est en dessous du minimum"""
        return self.stock < self.min_stock

    @property
    def stock_percentage(self):
        """Pourcentage du stock par rapport au minimum"""
        if self.min_stock > 0:
            return round((self.stock / self.min_stock) * 100, 2)
        return 0

    @property
    def stock_status(self):
        """Retourne le statut du stock"""
        percentage = self.stock_percentage
        if percentage < 50:
            return 'Critique'
        elif percentage < 100:
            return 'Bas'
        return 'Normal'

    @property
    def total_value(self):
        """Valeur totale du stock"""
        return self.stock * self.price


class StockMovement(models.Model):
    """Mouvement de stock (entrée/sortie)"""
    MOVEMENT_TYPE_CHOICES = [
        ('in', 'Entrée'),
        ('out', 'Sortie'),
        ('adjustment', 'Ajustement'),
    ]

    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name='movements',
        verbose_name="Matière première"
    )
    movement_type = models.CharField(
        max_length=20,
        choices=MOVEMENT_TYPE_CHOICES,
        verbose_name="Type de mouvement"
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Quantité"
    )
    previous_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Stock précédent"
    )
    new_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Nouveau stock"
    )
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    created_by = models.CharField(max_length=200, blank=True, null=True, verbose_name="Créé par")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.material.name} - {self.quantity} {self.material.unit}"


class PurchaseOrder(models.Model):
    """Bon de commande"""
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyé'),
        ('confirmed', 'Confirmé'),
        ('received', 'Reçu'),
        ('cancelled', 'Annulé'),
    ]

    order_number = models.CharField(max_length=50, unique=True, verbose_name="Numéro de commande")
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name="Fournisseur"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Statut"
    )
    order_date = models.DateField(default=timezone.now, verbose_name="Date de commande")
    expected_delivery_date = models.DateField(blank=True, null=True, verbose_name="Date de livraison prévue")
    actual_delivery_date = models.DateField(blank=True, null=True, verbose_name="Date de livraison réelle")
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Montant total"
    )
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bon de commande"
        verbose_name_plural = "Bons de commande"
        ordering = ['-order_date']

    def __str__(self):
        return f"{self.order_number} - {self.supplier.name}"


class PurchaseOrderItem(models.Model):
    """Ligne de commande"""
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Bon de commande"
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='purchase_order_items',
        verbose_name="Matière première"
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Quantité"
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Prix unitaire"
    )
    received_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Quantité reçue"
    )

    class Meta:
        verbose_name = "Ligne de commande"
        verbose_name_plural = "Lignes de commande"

    def __str__(self):
        return f"{self.material.name} - {self.quantity} {self.material.unit}"

    @property
    def total_price(self):
        """Prix total de la ligne"""
        return self.quantity * self.unit_price

    @property
    def is_fully_received(self):
        """Vérifie si la quantité complète a été reçue"""
        return self.received_quantity >= self.quantity