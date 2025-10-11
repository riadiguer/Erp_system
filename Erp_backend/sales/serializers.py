# sales/serializers.py 
from rest_framework import serializers
from .models import (
    Customer, Product, Order, OrderLine,
    DeliveryNote, DeliveryLine,
    Invoice, InvoiceLine, Payment ,SalesPoint ,Quote, QuoteLine
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

class ProductLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("id", "sku", "name")

class OrderLineLiteSerializer(serializers.ModelSerializer):
    product_detail = ProductLiteSerializer(source="product", read_only=True)

    class Meta:
        model = OrderLine
        fields = (
            "id",
            "product", "product_detail",
            "description",
            "quantity",
            "delivered_qty",
        )

class CustomerLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ("id", "name", "email", "phone")

class OrderLiteSerializer(serializers.ModelSerializer):
    customer_detail = CustomerLiteSerializer(source="customer", read_only=True)
    lines = OrderLineLiteSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "code", "customer", "customer_detail", "currency", "lines")


# =========================
# Delivery Notes (READ)
# =========================

class DeliveryLineReadSerializer(serializers.ModelSerializer):
    # Include rich details for the referenced order line (with product detail)
    order_line_detail = OrderLineLiteSerializer(source="order_line", read_only=True)

    class Meta:
        model = DeliveryLine
        fields = "__all__"

class DeliveryNoteSerializer(serializers.ModelSerializer):
    lines = DeliveryLineReadSerializer(many=True, read_only=True)
    order_detail = OrderLiteSerializer(source="order", read_only=True)

    class Meta:
        model = DeliveryNote
        fields = "__all__"
        read_only_fields = ("code", "seq", "status", "delivered_at")


# =========================
# Delivery Notes (WRITE)
# =========================

class DeliveryNoteLineInputSerializer(serializers.Serializer):
    order_line = serializers.UUIDField()
    quantity = serializers.DecimalField(max_digits=14, decimal_places=3)

    def validate_quantity(self, v: Decimal):
        if v is None or v <= 0:
            raise serializers.ValidationError("Quantity must be > 0.")
        return v

class DeliveryNoteWriteSerializer(serializers.ModelSerializer):
    """
    Accepts:
    {
      "order": "<order_uuid>",
      "notes": "...",
      "lines": [
        {"order_line": "<order_line_uuid>", "quantity": 2.5},
        ...
      ]
    }
    """
    lines = DeliveryNoteLineInputSerializer(many=True, write_only=True)

    class Meta:
        model = DeliveryNote
        fields = ("order", "notes", "lines")

    def validate(self, attrs):
        order = attrs.get("order")
        lines = attrs.get("lines") or []

        if not order:
            raise serializers.ValidationError({"order": "This field is required."})
        if not isinstance(lines, list) or len(lines) == 0:
            raise serializers.ValidationError({"lines": "Provide at least one line."})

        # For updates, ensure we're still in DRAFT status
        if self.instance and self.instance.status != DeliveryNote.Status.DRAFT:
            raise serializers.ValidationError("Only draft delivery notes can be modified.")

        # Sanity: ensure all order_line IDs belong to the same order
        # Keep as UUID objects for proper comparison
        from uuid import UUID
        ol_ids = [item["order_line"] if isinstance(item["order_line"], UUID) else UUID(str(item["order_line"])) 
                for item in lines if "order_line" in item]
        
        linked = set(
            OrderLine.objects.filter(order=order, id__in=ol_ids).values_list("id", flat=True)
        )
        
        # Compare UUIDs directly
        missing = [str(ol) for ol in ol_ids if ol not in linked]
        if missing:
            raise serializers.ValidationError(
                {"lines": f"Some order lines do not belong to order {order.code}: {missing}"}
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop("lines", [])
        dn: DeliveryNote = DeliveryNote.objects.create(**validated_data)

        # Create DeliveryLine entries; rely on model.clean() for business rules:
        # - qty > 0
        # - not exceeding remaining qty
        for item in lines_data:
            ol = OrderLine.objects.get(id=item["order_line"])
            dl = DeliveryLine(delivery=dn, order_line=ol, quantity=item["quantity"])
            dl.full_clean()   # triggers model-level checks
            dl.save()

        return dn

    @transaction.atomic
    def update(self, instance, validated_data):
        lines_data = validated_data.pop("lines", None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If lines are provided, replace all existing lines
        if lines_data is not None:
            # Delete existing lines
            instance.lines.all().delete()
            
            # Create new lines
            for item in lines_data:
                ol = OrderLine.objects.get(id=item["order_line"])
                dl = DeliveryLine(delivery=instance, order_line=ol, quantity=item["quantity"])
                dl.full_clean()   # triggers model-level checks
                dl.save()

        return instance

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

# ---------- Devis ----------
class QuoteLineWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteLine
        fields = ("product", "description", "quantity")  # unit_price/tax_rate come from Product

class QuoteWriteSerializer(serializers.ModelSerializer):
    lines = QuoteLineWriteSerializer(many=True)

    class Meta:
        model = Quote
        fields = ("customer","sales_point","currency","valid_until","notes","lines")

    @transaction.atomic
    def create(self, data):
        lines = data.pop("lines", [])
        quote = Quote.objects.create(**data)
        for ln in lines:
            product = ln["product"] if isinstance(ln["product"], Product) else Product.objects.get(pk=ln["product"])
            QuoteLine.objects.create(
                quote=quote,
                product=product,
                description=ln.get("description",""),
                quantity=ln["quantity"],
                unit_price=product.unit_price,
                tax_rate=product.tax_rate,
            )
        quote.recompute_totals(save=True)
        return quote

class QuoteLineSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    class Meta:
        model = QuoteLine
        fields = "__all__"

class QuoteSerializer(serializers.ModelSerializer):
    lines = QuoteLineSerializer(many=True, read_only=True)
    customer_detail = CustomerSerializer(source="customer", read_only=True)
    sales_point_detail = SalesPointSerializer(source="sales_point", read_only=True)

    class Meta:
        model = Quote
        fields = "__all__"
        read_only_fields = ("code","seq","subtotal","tax_amount","total","status","sent_at","decided_at")