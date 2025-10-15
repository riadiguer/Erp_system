from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerContactViewSet

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"customer-contacts", CustomerContactViewSet, basename="customercontact")

urlpatterns = router.urls
