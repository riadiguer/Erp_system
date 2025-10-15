from rest_framework import viewsets, decorators, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q

from .models import Customer, CustomerContact
from .serializers import (
    CustomerSerializer, CustomerWriteSerializer,
    CustomerContactSerializer, CustomerContactWriteSerializer,
)
from .permissions import CustomersPermission

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("name").prefetch_related("contacts")
    permission_classes = [IsAuthenticated, CustomersPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ("is_active",)
    search_fields = ("name", "email", "phone", "tax_id", "billing_address", "shipping_address")
    ordering_fields = ("name", "created_at", "updated_at")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CustomerWriteSerializer
        return CustomerSerializer

    @decorators.action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        c = self.get_object()
        c.is_active = True
        c.save(update_fields=["is_active", "updated_at"])
        return Response({"ok": True})

    @decorators.action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        c = self.get_object()
        c.is_active = False
        c.save(update_fields=["is_active", "updated_at"])
        return Response({"ok": True})

    @decorators.action(detail=False, methods=["post"])
    @transaction.atomic
    def merge(self, request):
        """
        Merge duplicate customers:
        Body:
        {
          "source_id":  "...",
          "target_id":  "...",
          "fields": { "email": "keep_source"|"keep_target"|"concat", "notes": "concat" }
        }
        """
        src_id = request.data.get("source_id")
        tgt_id = request.data.get("target_id")
        if not src_id or not tgt_id or src_id == tgt_id:
            return Response({"detail": "IDs invalides."}, status=400)

        src = Customer.objects.select_for_update().get(pk=src_id)
        tgt = Customer.objects.select_for_update().get(pk=tgt_id)

        policy = request.data.get("fields", {})
        def merge_field(field, default="keep_target"):
            strat = policy.get(field, default)
            sv = getattr(src, field, None)
            tv = getattr(tgt, field, None)
            if strat == "keep_source": return sv or tv
            if strat == "concat": return " | ".join([x for x in [tv, sv] if x])
            return tv or sv

        tgt.email = merge_field("email")
        tgt.phone = merge_field("phone")
        tgt.tax_id = merge_field("tax_id")
        tgt.notes = merge_field("notes", default="concat")
        tgt.billing_address = merge_field("billing_address", default="concat")
        tgt.shipping_address = merge_field("shipping_address", default="concat")
        tgt.save()

        # reassign contacts
        CustomerContact.objects.filter(customer=src).update(customer=tgt)
        # TODO: reassign foreign keys from other apps (orders, quotes, invoices) if needed.

        src.delete()
        return Response({"ok": True, "target_id": str(tgt.id)})

class CustomerContactViewSet(viewsets.ModelViewSet):
    queryset = CustomerContact.objects.select_related("customer").all()
    permission_classes = [IsAuthenticated, CustomersPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ("customer", "is_primary")
    search_fields = ("name", "email", "phone", "role")
    ordering_fields = ("created_at", "updated_at", "name")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CustomerContactWriteSerializer
        return CustomerContactSerializer
