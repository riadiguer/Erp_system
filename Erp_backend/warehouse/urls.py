from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    SupplierViewSet,
    MaterialViewSet,
    StockMovementViewSet,
    PurchaseOrderViewSet,
    DashboardViewSet,
)

# Créer le router
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'stock-movements', StockMovementViewSet, basename='stockmovement')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]

# Structure des URLs disponibles :
"""
# Categories
GET    /api/categories/                  - Liste des catégories
POST   /api/categories/                  - Créer une catégorie
GET    /api/categories/{id}/             - Détail d'une catégorie
PUT    /api/categories/{id}/             - Modifier une catégorie
PATCH  /api/categories/{id}/             - Modifier partiellement une catégorie
DELETE /api/categories/{id}/             - Supprimer une catégorie

# Suppliers
GET    /api/suppliers/                   - Liste des fournisseurs
POST   /api/suppliers/                   - Créer un fournisseur
GET    /api/suppliers/{id}/              - Détail d'un fournisseur
PUT    /api/suppliers/{id}/              - Modifier un fournisseur
PATCH  /api/suppliers/{id}/              - Modifier partiellement un fournisseur
DELETE /api/suppliers/{id}/              - Supprimer un fournisseur
GET    /api/suppliers/{id}/materials/    - Matières d'un fournisseur

# Materials
GET    /api/materials/                   - Liste des matières
POST   /api/materials/                   - Créer une matière
GET    /api/materials/{id}/              - Détail d'une matière
PUT    /api/materials/{id}/              - Modifier une matière
PATCH  /api/materials/{id}/              - Modifier partiellement une matière
DELETE /api/materials/{id}/              - Supprimer une matière
GET    /api/materials/low_stock/         - Matières avec stock bas
GET    /api/materials/statistics/        - Statistiques sur les matières
POST   /api/materials/{id}/adjust_stock/ - Ajuster le stock d'une matière

# Stock Movements
GET    /api/stock-movements/             - Liste des mouvements
POST   /api/stock-movements/             - Créer un mouvement
GET    /api/stock-movements/{id}/        - Détail d'un mouvement
GET    /api/stock-movements/by_material/ - Mouvements par matière (?material_id=X)
GET    /api/stock-movements/statistics/  - Statistiques sur les mouvements

# Purchase Orders
GET    /api/purchase-orders/             - Liste des commandes
POST   /api/purchase-orders/             - Créer une commande
GET    /api/purchase-orders/{id}/        - Détail d'une commande
PUT    /api/purchase-orders/{id}/        - Modifier une commande
PATCH  /api/purchase-orders/{id}/        - Modifier partiellement une commande
DELETE /api/purchase-orders/{id}/        - Supprimer une commande
POST   /api/purchase-orders/{id}/receive/ - Recevoir une commande
GET    /api/purchase-orders/statistics/  - Statistiques sur les commandes

# Dashboard
GET    /api/dashboard/stats/             - Statistiques du tableau de bord

# Paramètres de recherche disponibles :
# - search: Recherche textuelle
# - ordering: Tri (ex: ordering=name ou ordering=-created_at)
# - category: Filtrer par catégorie (ID)
# - supplier: Filtrer par fournisseur (ID)
# - unit: Filtrer par unité
# - status: Filtrer par statut (pour les commandes)
# - movement_type: Filtrer par type de mouvement
"""