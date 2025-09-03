# sales/serializers.py 
from rest_framework import serializers
from .models import (
    Customer, Product, Order, OrderLine,
    DeliveryNote, DeliveryLine,
    Invoice, InvoiceLine, Payment ,SalesPoint
)

from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist

class SalesPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPoint
        fields = "__all__"

class OrderLineWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLine
        fields = ("product", "description", "quantity", "unit_price", "tax_rate")

    def validate(self, attrs):
        product = attrs["product"]
        if not product.is_active:
            raise serializers.ValidationError("Selected product is inactive.")
        # default unit_price / tax_rate from product if not provided
        if attrs.get("unit_price") is None:
            attrs["unit_price"] = product.unit_price
        if attrs.get("tax_rate") is None:
            attrs["tax_rate"] = product.tax_rate
        if attrs["quantity"] <= 0:
            raise serializers.ValidationError("Quantity must be > 0.")
        if attrs["unit_price"] < 0:
            raise serializers.ValidationError("Unit price must be >= 0.")
        return attrs

class OrderWriteSerializer(serializers.ModelSerializer):
    lines = OrderLineWriteSerializer(many=True)

    class Meta:
        model = Order
        fields = (
            "customer","currency","expected_delivery_date","notes","sales_point","lines"
        )

    def validate_lines(self, lines):
        if not lines:
            raise serializers.ValidationError("At least one line is required.")
        for ln in lines:
            if ln["quantity"] <= 0:
                raise serializers.ValidationError("Quantity must be > 0.")
            if ln["unit_price"] < 0:
                raise serializers.ValidationError("Unit price must be >= 0.")
        return lines

    @transaction.atomic
    def create(self, data):
        lines = data.pop("lines", [])
        order = Order.objects.create(**data)
        for ln in lines:
            OrderLine.objects.create(order=order, **ln)
        order.recompute_totals(save=True)
        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    lines = OrderLineWriteSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ("notes","expected_delivery_date","lines")

    def validate(self, attrs):
        inst: Order = self.instance
        if inst.status != Order.Status.DRAFT:
            raise serializers.ValidationError("Only draft orders can be modified.")
        # Defensive: if some delivered qty recorded, block edit
        has_delivery = inst.lines.filter(delivered_qty__gt=0).exists()
        if has_delivery:
            raise serializers.ValidationError("Order has delivered quantities and cannot be edited.")
        return attrs

    @transaction.atomic
    def update(self, instance, data):
        lines = data.pop("lines", None)
        for k, v in data.items():
            setattr(instance, k, v)
        instance.save()
        if lines is not None:
            instance.lines.all().delete()
            for ln in lines:
                OrderLine.objects.create(order=instance, **ln)
            instance.recompute_totals(save=True)
        return instance


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"

class OrderLineSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = OrderLine
        fields = "__all__"
        read_only_fields = ("subtotal", "tax_amount", "total", "delivered_qty")

class OrderSerializer(serializers.ModelSerializer):
    lines = OrderLineSerializer(many=True, read_only=True)
    customer_detail = CustomerSerializer(source="customer", read_only=True)
    sales_point_detail = SalesPointSerializer(source="sales_point", read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("code", "seq", "subtotal", "tax_amount", "total", "status")

class DeliveryLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryLine
        fields = "__all__"

class DeliveryNoteSerializer(serializers.ModelSerializer):
    lines = DeliveryLineSerializer(many=True, read_only=True)

    class Meta:
        model = DeliveryNote
        fields = "__all__"
        read_only_fields = ("code", "seq", "status", "delivered_at")

class DeliveryLineWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryLine
        fields = ("order_line", "quantity")

    def validate(self, attrs):
        ol = attrs["order_line"]
        if attrs["quantity"] <= 0:
            raise serializers.ValidationError("Delivery quantity must be > 0.")
        remaining = (ol.quantity - ol.delivered_qty)
        if attrs["quantity"] > remaining:
            raise serializers.ValidationError("Delivered quantity exceeds remaining to deliver.")
        # Stock check
        p = ol.product
        if p.track_stock and p.type == Product.ProductType.GOOD:
            if p.stock_qty < attrs["quantity"]:
                raise serializers.ValidationError(f"Insufficient stock for {p.sku}.")
        return attrs

class DeliveryNoteWriteSerializer(serializers.ModelSerializer):
    lines = DeliveryLineWriteSerializer(many=True)

    class Meta:
        model = DeliveryNote
        fields = ("order", "notes", "lines")

    def validate(self, attrs):
        order = attrs["order"]
        if order.status not in (Order.Status.CONFIRMED, Order.Status.PARTIALLY_DELIVERED):
            raise serializers.ValidationError("Order must be confirmed to deliver.")
        # Make sure every line belongs to this order
        lines = self.initial_data.get("lines", [])
        if not lines:
            raise serializers.ValidationError("At least one delivery line is required.")
        # We can only validate cross-line/order relationship using initial_data ids here
        ol_ids = {ln["order_line"] for ln in lines}
        count = OrderLine.objects.filter(order=order, id__in=ol_ids).count()
        if count != len(ol_ids):
            raise serializers.ValidationError("All delivery lines must reference order lines of the given order.")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        lines = validated_data.pop("lines", [])
        dn = DeliveryNote.objects.create(**validated_data)
        for ln in lines:
            DeliveryLine.objects.create(delivery=dn, **ln)
        return dn

class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = "__all__"
        read_only_fields = ("subtotal", "tax_amount", "total")

class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ("code", "seq", "subtotal", "tax_amount", "total", "amount_paid", "balance_due", "status")

class InvoiceLineWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = ("product", "description", "quantity", "unit_price", "tax_rate")

    def validate(self, attrs):
        p = attrs["product"]
        if not p.is_active:
            raise serializers.ValidationError("Selected product is inactive.")
        if attrs.get("unit_price") is None:
            attrs["unit_price"] = p.unit_price
        if attrs.get("tax_rate") is None:
            attrs["tax_rate"] = p.tax_rate
        if attrs["quantity"] <= 0:
            raise serializers.ValidationError("Quantity must be > 0.")
        if attrs["unit_price"] < 0:
            raise serializers.ValidationError("Unit price must be >= 0.")
        return attrs

class InvoiceWriteSerializer(serializers.ModelSerializer):
    lines = InvoiceLineWriteSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ("order", "customer", "issue_date", "due_date", "currency", "notes", "lines")

    def validate(self, attrs):
        order = attrs.get("order")
        customer = attrs.get("customer")
        if order:
            if customer and customer != order.customer:
                raise serializers.ValidationError("Customer must match the order's customer.")
            # Enforce same customer if not explicitly set
            attrs["customer"] = order.customer
        if not attrs.get("lines"):
            raise serializers.ValidationError("At least one invoice line is required.")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        lines = validated_data.pop("lines", [])
        inv = Invoice.objects.create(**validated_data)
        for ln in lines:
            InvoiceLine.objects.create(invoice=inv, **ln)
        inv.recompute_totals(save=True)
        return inv
    
# Optional: generate an invoice directly from an Order (copy lines)
class InvoiceFromOrderSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()

    @transaction.atomic
    def create(self, data):
        order = Order.objects.select_related("customer").prefetch_related("lines__product").get(pk=data["order_id"])
        inv = Invoice.objects.create(order=order, customer=order.customer, currency=order.currency, notes=order.notes)
        for ol in order.lines.all():
            InvoiceLine.objects.create(
                invoice=inv,
                product=ol.product,
                description=ol.description,
                quantity=ol.quantity,
                unit_price=ol.unit_price,
                tax_rate=ol.tax_rate,
            )
        inv.recompute_totals(save=True)
        return inv


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"

    def validate(self, attrs):
        inv: Invoice = attrs["invoice"]
        amount: Decimal = attrs["amount"]
        if inv.status == Invoice.Status.CANCELLED:
            raise serializers.ValidationError("Cannot pay a cancelled invoice.")
        if amount <= 0:
            raise serializers.ValidationError("Payment amount must be > 0.")
        # Ensure invoice totals are up-to-date before checking
        inv.recompute_totals(save=False)
        if amount > inv.balance_due:
            raise serializers.ValidationError("Payment exceeds invoice balance due.")
        return attrs

