# sales/admin.py
from django.contrib import admin
from .models import (
    Customer, Product, Order, OrderLine, DeliveryNote, DeliveryLine, Invoice, InvoiceLine, Payment
)

class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("code","customer","status","total","created_at")
    list_filter = ("status",)
    search_fields = ("code","customer__name")
    inlines = [OrderLineInline]

class DeliveryLineInline(admin.TabularInline):
    model = DeliveryLine
    extra = 0

@admin.register(DeliveryNote)
class DeliveryNoteAdmin(admin.ModelAdmin):
    list_display = ("code","order","status","delivered_at","created_at")
    list_filter = ("status",)
    search_fields = ("code","order__code")
    inlines = [DeliveryLineInline]

class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 0

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("code","customer","status","total","amount_paid","balance_due","issue_date")
    list_filter = ("status",)
    search_fields = ("code","customer__name")
    inlines = [InvoiceLineInline]

admin.site.register(Customer)
admin.site.register(Product)
admin.site.register(Payment)
