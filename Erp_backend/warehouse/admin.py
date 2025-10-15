from django.contrib import admin
from django.utils.html import format_html
from warehouse import models
from warehouse.models import Category, Supplier, Material, StockMovement, PurchaseOrder, PurchaseOrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'materials_count', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']

    def materials_count(self, obj):
        return obj.materials.count()
    materials_count.short_description = "Nombre de matières"


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_name', 'email', 'phone', 'materials_count', 'created_at']
    search_fields = ['name', 'contact_name', 'email']
    list_filter = ['created_at']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'contact_name')
        }),
        ('Contact', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Informations supplémentaires', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def materials_count(self, obj):
        return obj.materials.count()
    materials_count.short_description = "Nombre de matières"


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = [
        'reference', 'name', 'category', 'supplier', 
        'stock_display', 'stock_status_badge', 'price', 
        'total_value_display', 'created_at'
    ]
    list_filter = ['category', 'supplier', 'unit', 'created_at']
    search_fields = ['name', 'reference', 'supplier__name']
    readonly_fields = ['created_at', 'updated_at', 'stock_percentage', 'total_value']
    list_per_page = 25

    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'reference', 'category', 'supplier', 'description')
        }),
        ('Stock', {
            'fields': ('stock', 'min_stock', 'unit', 'stock_percentage')
        }),
        ('Prix', {
            'fields': ('price', 'total_value')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def stock_display(self, obj):
        return f"{obj.stock} / {obj.min_stock} {obj.unit}"
    stock_display.short_description = "Stock (actuel / min)"

    def stock_status_badge(self, obj):
        status = obj.stock_status
        if status == 'Critique':
            color = 'red'
        elif status == 'Bas':
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, status
        )
    stock_status_badge.short_description = "Statut"

    def total_value_display(self, obj):
        return f"{obj.total_value:.2f} €"
    total_value_display.short_description = "Valeur totale"

    actions = ['mark_as_low_stock']

    def mark_as_low_stock(self, request, queryset):
        """Action personnalisée pour identifier les stocks bas"""
        low_stock = queryset.filter(stock__lt= models.F('min_stock'))
        self.message_user(
            request,
            f"{low_stock.count()} matière(s) avec stock bas identifiée(s)."
        )
    mark_as_low_stock.short_description = "Identifier les stocks bas"


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'material', 'movement_type_badge', 
        'quantity_display', 'stock_change', 'created_by'
    ]
    list_filter = ['movement_type', 'created_at', 'material__category']
    search_fields = ['material__name', 'material__reference', 'notes']
    readonly_fields = ['previous_stock', 'new_stock', 'created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    fieldsets = (
        ('Mouvement', {
            'fields': ('material', 'movement_type', 'quantity')
        }),
        ('Stock', {
            'fields': ('previous_stock', 'new_stock')
        }),
        ('Informations supplémentaires', {
            'fields': ('notes', 'created_by', 'created_at')
        }),
    )

    def movement_type_badge(self, obj):
        colors = {
            'in': 'green',
            'out': 'red',
            'adjustment': 'orange'
        }
        color = colors.get(obj.movement_type, 'gray')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.get_movement_type_display()
        )
    movement_type_badge.short_description = "Type"

    def quantity_display(self, obj):
        return f"{obj.quantity} {obj.material.unit}"
    quantity_display.short_description = "Quantité"

    def stock_change(self, obj):
        change = obj.new_stock - obj.previous_stock
        symbol = '+' if change > 0 else ''
        color = 'green' if change > 0 else 'red' if change < 0 else 'gray'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}{}</span>',
            color, symbol, change
        )
    stock_change.short_description = "Changement"

    def has_add_permission(self, request):
        # Empêcher l'ajout manuel depuis l'admin
        # Les mouvements doivent être créés via l'API
        return False

    def has_delete_permission(self, request, obj=None):
        # Empêcher la suppression des mouvements
        return False


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    fields = ['material', 'quantity', 'unit_price', 'received_quantity']
    readonly_fields = []


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'supplier', 'status_badge', 
        'order_date', 'expected_delivery_date', 
        'total_amount_display', 'items_count'
    ]
    list_filter = ['status', 'order_date', 'supplier']
    search_fields = ['order_number', 'supplier__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'order_date'
    inlines = [PurchaseOrderItemInline]

    fieldsets = (
        ('Commande', {
            'fields': ('order_number', 'supplier', 'status')
        }),
        ('Dates', {
            'fields': ('order_date', 'expected_delivery_date', 'actual_delivery_date')
        }),
        ('Montant', {
            'fields': ('total_amount',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'draft': 'gray',
            'sent': 'blue',
            'confirmed': 'orange',
            'received': 'green',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'gray')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Statut"

    def total_amount_display(self, obj):
        return f"{obj.total_amount:.2f} €"
    total_amount_display.short_description = "Montant total"

    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = "Nombre d'articles"

    actions = ['mark_as_received']

    def mark_as_received(self, request, queryset):
        """Marquer les commandes comme reçues"""
        updated = queryset.filter(status='confirmed').update(status='received')
        self.message_user(
            request,
            f"{updated} commande(s) marquée(s) comme reçue(s)."
        )
    mark_as_received.short_description = "Marquer comme reçu"


# Configuration du site admin
admin.site.site_header = "Administration Entrepôt"
admin.site.site_title = "Gestion Entrepôt"
admin.site.index_title = "Tableau de bord"