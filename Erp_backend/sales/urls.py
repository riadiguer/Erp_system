from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, ProductViewSet,
    OrderViewSet, DeliveryNoteViewSet,
    InvoiceViewSet, PaymentViewSet,
    SalesPointViewSet,
)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("products", ProductViewSet, basename="product")
router.register("orders", OrderViewSet, basename="order")
router.register("delivery-notes", DeliveryNoteViewSet, basename="deliverynote")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("payments", PaymentViewSet, basename="payment")
router.register("sales-points", SalesPointViewSet, basename="salespoint")
# keep your existing routes (orders/products/...)


urlpatterns = [ path("", include(router.urls)) ]
