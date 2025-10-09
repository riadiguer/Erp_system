from django.db import transaction
from django.forms import ValidationError
from rest_framework import viewsets, decorators, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import DeliveryLine, Order, DeliveryNote, Invoice, Payment, Product, Customer ,SalesPoint ,Quote,OrderLine
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
    # Quotes
    QuoteSerializer, QuoteWriteSerializer, QuoteLineSerializer, QuoteLineWriteSerializer,
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
    permission_classes = [SalesPermission , IsAuthenticated]   # view requires sales_view, mutate requires sales_manage



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
        DeliveryNote.objects
        .select_related("order", "order__customer")
        .prefetch_related("lines__order_line__product")
        .all()
    )
    permission_classes = [IsAuthenticated, SalesPermission]
    filterset_fields = ("status", "order")
    search_fields = ("code", "order__code", "notes")
    ordering_fields = ("created_at", "delivered_at", "status", "code")

    ACTION_PERMS = {
        "add_lines": ["sales_manage"],
        "mark_delivered": ["sales_manage"],
    }

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DeliveryNoteWriteSerializer
        return DeliveryNoteSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            write = DeliveryNoteWriteSerializer(
                data=request.data, context=self.get_serializer_context()
            )
            write.is_valid(raise_exception=True)
            dn = write.save()
            read = DeliveryNoteSerializer(instance=dn, context=self.get_serializer_context())
            headers = self.get_success_headers(read.data)
            return Response(read.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            write = DeliveryNoteWriteSerializer(
                instance, 
                data=request.data, 
                partial=partial,
                context=self.get_serializer_context()
            )
            write.is_valid(raise_exception=True)
            dn = write.save()
            read = DeliveryNoteSerializer(instance=dn, context=self.get_serializer_context())
            return Response(read.data)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @decorators.action(detail=True, methods=["post"], url_path="lines")
    @transaction.atomic
    def add_lines(self, request, pk=None):
        """
        Body:
        {
          "lines": [
            {"order_line": "<uuid>", "quantity": 2.5},
            ...
          ]
        }
        """
        try:
            dn = self.get_object()
            if dn.status != DeliveryNote.Status.DRAFT:
                return Response({"detail": "Only draft notes can be edited."}, status=400)

            payload = request.data.get("lines")
            if not isinstance(payload, list) or not payload:
                return Response({"detail": 'Provide "lines" as a non-empty list.'}, status=400)

            for item in payload:
                ol_id = item.get("order_line")
                qty = item.get("quantity")
                if not ol_id or qty is None:
                    return Response({"detail": "Each line needs order_line and quantity."}, status=400)

                try:
                    # ensure the order line belongs to the same order
                    ol = dn.order.lines.select_related("product").get(id=ol_id)
                except OrderLine.DoesNotExist:
                    return Response({"detail": f"Order line {ol_id} not found on this order."}, status=404)

                # validate with model.clean() constraints
                from .models import DeliveryLine  # local import to avoid cycles
                dl = DeliveryLine(delivery=dn, order_line=ol, quantity=qty)
                dl.full_clean()     # will raise if quantity > remaining, <=0, etc.
                dl.save()

            # re-serialize the updated note
            dn.refresh_from_db()
            read = DeliveryNoteSerializer(dn, context=self.get_serializer_context())
            return Response(read.data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @decorators.action(detail=True, methods=["post"])
    @transaction.atomic
    def mark_delivered(self, request, pk=None):
        try:
            dn = self.get_object()
            dn.mark_delivered()
            return Response({"ok": True, "status": dn.status, "delivered_at": dn.delivered_at})
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=["delete"], url_path="lines/(?P<line_id>[^/.]+)")
    @transaction.atomic
    def remove_line(self, request, pk=None, line_id=None):
        """Remove a specific delivery line from a draft delivery note"""
        try:
            dn = self.get_object()
            if dn.status != DeliveryNote.Status.DRAFT:
                return Response({"detail": "Only draft notes can be edited."}, status=400)
            
            line = dn.lines.get(id=line_id)
            line.delete()
            
            # Re-serialize the updated note
            dn.refresh_from_db()
            read = DeliveryNoteSerializer(dn, context=self.get_serializer_context())
            return Response(read.data)
            
        except DeliveryLine.DoesNotExist:
            return Response({"detail": "Delivery line not found."}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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

# ---------- Devis ----------
class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.select_related("customer","sales_point").prefetch_related("lines__product").all()
    permission_classes = [SalesPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["code","customer__name"]
    ordering_fields = ["created_at","total","code"]
    filterset_fields = ["status","sales_point"]

    ACTION_PERMS = {
        "send": ["sales_manage"],
        "accept": ["sales_manage"],
        "reject": ["sales_manage"],
        "expire": ["sales_manage"],
        "to_order": ["sales_manage"],
    }

    def get_serializer_class(self):
        if self.action in ("create","update","partial_update"):
            return QuoteWriteSerializer
        return QuoteSerializer

    @decorators.action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        q = self.get_object()
        q.mark_sent()
        return Response({"ok": True, "status": q.status, "sent_at": q.sent_at})

    @decorators.action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        q = self.get_object()
        q.accept()
        return Response({"ok": True, "status": q.status})

    @decorators.action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        q = self.get_object()
        q.reject()
        return Response({"ok": True, "status": q.status})

    @decorators.action(detail=True, methods=["post"])
    def expire(self, request, pk=None):
        q = self.get_object()
        q.expire()
        return Response({"ok": True, "status": q.status})

    @decorators.action(detail=True, methods=["post"], url_path="to-order")
    def to_order(self, request, pk=None):
        q = self.get_object()
        if q.status not in (q.Status.SENT, q.Status.ACCEPTED):
            return Response({"detail":"Only SENT or ACCEPTED quotes can convert."}, status=400)
        # create an Order with same customer, sales_point, currency, notes
        order = Order.objects.create(
            customer=q.customer,
            sales_point=q.sales_point,
            currency=q.currency,
            notes=f"From quote {q.code}: {q.notes or ''}".strip(),
        )
        for l in q.lines.all():
            OrderLine.objects.create(
                order=order,
                product=l.product,
                description=l.description,
                quantity=l.quantity,
                unit_price=l.unit_price,
                tax_rate=l.tax_rate,
            )
        order.recompute_totals(save=True)
        return Response({"ok": True, "order_id": order.id}, status=status.HTTP_201_CREATED)
    
    def create(self, request, *args, **kwargs):
        write = QuoteWriteSerializer(data=request.data, context=self.get_serializer_context())
        write.is_valid(raise_exception=True)
        quote = write.save()
        read = QuoteSerializer(instance=quote, context=self.get_serializer_context())
        headers = self.get_success_headers(read.data)
        return Response(read.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        write = QuoteWriteSerializer(instance, data=request.data, partial=False, context=self.get_serializer_context())
        write.is_valid(raise_exception=True)
        quote = write.save()
        read = QuoteSerializer(instance=quote, context=self.get_serializer_context())
        return Response(read.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        write = QuoteWriteSerializer(instance, data=request.data, partial=True, context=self.get_serializer_context())
        write.is_valid(raise_exception=True)
        quote = write.save()
        read = QuoteSerializer(instance=quote, context=self.get_serializer_context())
        return Response(read.data)