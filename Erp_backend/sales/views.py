from django.db import transaction
from rest_framework import viewsets, decorators, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order, DeliveryNote, Invoice, Payment, Product, Customer ,SalesPoint
from .serializers import (
    # Orders
    OrderSerializer, OrderWriteSerializer, OrderUpdateSerializer,
    # Delivery
    DeliveryNoteSerializer, DeliveryNoteWriteSerializer,
    # Invoices/Payments
    InvoiceSerializer, InvoiceWriteSerializer, InvoiceFromOrderSerializer,
    PaymentSerializer,
    # Refs
    ProductSerializer, CustomerSerializer,
    # Sales Points
    SalesPointSerializer,

)
from .permissions import SalesPermission, InvoicesPermission


# --------- Read-only “reference” sets ----------
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by("sku")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, SalesPermission]
    filterset_fields = ("type",)
    search_fields = ("sku", "name")
    ordering_fields = ("sku", "name", "unit_price", "stock_qty")


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("name")
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, SalesPermission]
    search_fields = ("name", "email", "phone")
    ordering_fields = ("name", "created_at")

class SalesPointViewSet(viewsets.ModelViewSet):
    queryset = SalesPoint.objects.all().order_by("name")
    serializer_class = SalesPointSerializer
    permission_classes = [SalesPermission]  # view requires sales_view, mutate requires sales_manage



# --------- Orders ----------
class OrderViewSet(viewsets.ModelViewSet):
    queryset = (
        Order.objects.select_related("customer", "sales_point")
        .prefetch_related("lines__product")
        .all()
    )
    permission_classes = [IsAuthenticated, SalesPermission]
    filterset_fields = ("status", "customer", "currency")
    search_fields = ("code", "customer__name", "customer__email", "notes")
    ordering_fields = ("created_at", "total", "status", "code")

    def get_serializer_class(self):
        if self.action == "create":
            return OrderWriteSerializer
        if self.action in ("update", "partial_update"):
            return OrderUpdateSerializer
        return OrderSerializer

    @decorators.action(detail=True, methods=["post"])
    @transaction.atomic
    def confirm(self, request, pk=None):
        order = self.get_object()
        order.confirm()
        return Response({"ok": True, "status": order.status})

    @decorators.action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        """
        Simple cancel: allowed only when no active non-cancelled BL exist (guard is in model.clean()).
        """
        order = self.get_object()
        order.status = Order.Status.CANCELLED
        order.full_clean()  # will raise if BL exist
        order.save(update_fields=["status", "updated_at"])
        return Response({"ok": True, "status": order.status})


# --------- Delivery Notes ----------
class DeliveryNoteViewSet(viewsets.ModelViewSet):
    queryset = (
        DeliveryNote.objects.select_related("order")
        .prefetch_related("lines__order_line__product")
        .all()
    )
    permission_classes = [IsAuthenticated, SalesPermission]
    filterset_fields = ("status", "order")
    search_fields = ("code", "order__code", "notes")
    ordering_fields = ("created_at", "delivered_at", "status", "code")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DeliveryNoteWriteSerializer
        return DeliveryNoteSerializer

    @decorators.action(detail=True, methods=["post"])
    @transaction.atomic
    def mark_delivered(self, request, pk=None):
        dn = self.get_object()
        dn.mark_delivered()
        return Response({"ok": True, "status": dn.status})


# --------- Invoices & Payments ----------
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = (
        Invoice.objects.select_related("order", "customer")
        .prefetch_related("lines__product", "payments")
        .all()
    )
    permission_classes = [IsAuthenticated, InvoicesPermission]
    filterset_fields = ("status", "customer", "currency")
    search_fields = ("code", "customer__name", "customer__email", "notes")
    ordering_fields = ("issue_date", "total", "amount_paid", "balance_due", "status", "code")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return InvoiceWriteSerializer
        return InvoiceSerializer

    @decorators.action(detail=False, methods=["post"], url_path="from-order")
    @transaction.atomic
    def from_order(self, request):
        s = InvoiceFromOrderSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        inv = s.save()
        return Response({"ok": True, "invoice_id": str(inv.id)}, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=["post"])
    @transaction.atomic
    def issue(self, request, pk=None):
        inv = self.get_object()
        inv.issue()
        return Response({"ok": True, "status": inv.status})

    @decorators.action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        inv = self.get_object()
        if inv.status == inv.Status.PAID:
            return Response({"ok": False, "error": "Cannot cancel a paid invoice."}, status=400)
        inv.status = inv.Status.CANCELLED
        inv.save(update_fields=["status", "updated_at"])
        return Response({"ok": True, "status": inv.status})


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("invoice").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, InvoicesPermission]
    filterset_fields = ("method", "invoice")
    search_fields = ("invoice__code", "reference",)
    ordering_fields = ("received_at", "amount")
