from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Count, F
from django.db.models.functions import TruncMonth
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from decimal import Decimal

from .models import Category, Supplier, Material, StockMovement, PurchaseOrder
from .permissions import (
    CategoriesPermission,
    SuppliersPermission,
    MaterialsPermission,
    StockMovementsPermission,
    PurchaseOrdersPermission,
    DashboardPermission,
)
from .serializers import (
    CategorySerializer,
    SupplierSerializer,
    MaterialListSerializer,
    MaterialDetailSerializer,
    MaterialCreateUpdateSerializer,
    StockMovementSerializer,
    StockMovementCreateSerializer,
    PurchaseOrderListSerializer,
    PurchaseOrderDetailSerializer,
    PurchaseOrderCreateUpdateSerializer,
    DashboardStatsSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet pour les catégories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet pour les fournisseurs"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contact_name', 'email', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def materials(self, request, pk=None):
        """Récupère toutes les matières d'un fournisseur"""
        supplier = self.get_object()
        materials = supplier.materials.all()
        serializer = MaterialListSerializer(materials, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques sur les fournisseurs"""
        # Statistiques de base
        total_suppliers = Supplier.objects.count()
        active_suppliers = Supplier.objects.filter(materials__isnull=False).distinct().count()
        inactive_suppliers = total_suppliers - active_suppliers
        
        # Fournisseurs avec commandes en attente (approximation pour "avec dette")
        suppliers_with_pending_orders = PurchaseOrder.objects.filter(
            status__in=['sent', 'confirmed']
        ).values('supplier').distinct().count()
        
        # Données mensuelles (9 derniers mois)
        nine_months_ago = datetime.now() - timedelta(days=270)
        
        # Achats par mois (basé sur les purchase orders)
        monthly_purchases = PurchaseOrder.objects.filter(
            order_date__gte=nine_months_ago
        ).annotate(
            month=TruncMonth('order_date')
        ).values('month').annotate(
            total=Sum('total_amount')
        ).order_by('month')
        
        # Formater les données mensuelles
        monthly_data = []
        months_fr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
        
        # Créer un dictionnaire des données existantes
        purchases_dict = {}
        for item in monthly_purchases:
            month_key = item['month'].strftime('%Y-%m')
            purchases_dict[month_key] = float(item['total'] or 0)
        
        # Générer les 9 derniers mois avec données ou 0
        current_date = datetime.now()
        for i in range(8, -1, -1):
            target_date = current_date - timedelta(days=30 * i)
            month_key = target_date.strftime('%Y-%m')
            month_num = target_date.month - 1
            
            achats = purchases_dict.get(month_key, 0)
            # Approximation: 90% des achats sont payés
            paiements = achats * 0.9
            
            monthly_data.append({
                'month': months_fr[month_num],
                'achats': achats,
                'paiements': paiements,
            })
        
        # Totaux
        total_achats = sum(item['achats'] for item in monthly_data)
        total_paiements = sum(item['paiements'] for item in monthly_data)
        solde = total_achats - total_paiements
        
        stats = {
            'total_suppliers': total_suppliers,
            'active_suppliers': active_suppliers,
            'inactive_suppliers': inactive_suppliers,
            'suppliers_with_debt': suppliers_with_pending_orders,
            'monthly_data': monthly_data,
            'total_achats': total_achats,
            'total_paiements': total_paiements,
            'solde': solde,
        }
        
        return Response(stats)


class MaterialViewSet(viewsets.ModelViewSet):
    """ViewSet pour les matières premières"""
    queryset = Material.objects.select_related('category', 'supplier').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'supplier', 'unit']
    search_fields = ['name', 'reference', 'supplier__name']
    ordering_fields = ['name', 'stock', 'created_at', 'price']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MaterialDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MaterialCreateUpdateSerializer
        return MaterialListSerializer

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Récupère toutes les matières avec un stock bas"""
        materials = Material.objects.select_related('category', 'supplier').filter(
            stock__lt=F('min_stock')
        ).order_by('stock')
        serializer = MaterialListSerializer(materials, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques générales sur les matières"""
        stats = {
            'total_count': Material.objects.count(),
            'low_stock_count': Material.objects.filter(stock__lt=F('min_stock')).count(),
            'total_value': Material.objects.aggregate(
                total=Sum(F('stock') * F('price'))
            )['total'] or 0,
            'by_category': list(
                Material.objects.values('category__name')
                .annotate(count=Count('id'), total_value=Sum(F('stock') * F('price')))
                .order_by('-count')
            ),
            'by_supplier': list(
                Material.objects.values('supplier__name')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Ajuster le stock d'une matière"""
        material = self.get_object()
        serializer = StockMovementCreateSerializer(data={
            'material': material.id,
            'movement_type': request.data.get('movement_type'),
            'quantity': request.data.get('quantity'),
            'notes': request.data.get('notes', ''),
            'created_by': request.data.get('created_by', 'System'),
        })

        if serializer.is_valid():
            serializer.save()
            # Retourner la matière mise à jour
            material.refresh_from_db()
            return Response(MaterialDetailSerializer(material).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StockMovementViewSet(viewsets.ModelViewSet):
    """ViewSet pour les mouvements de stock"""
    queryset = StockMovement.objects.select_related('material', 'material__category').all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['material', 'movement_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return StockMovementCreateSerializer
        return StockMovementSerializer

    @action(detail=False, methods=['get'])
    def by_material(self, request):
        """Récupère les mouvements par matière"""
        material_id = request.query_params.get('material_id')
        if not material_id:
            return Response(
                {'error': 'material_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        movements = self.queryset.filter(material_id=material_id)
        serializer = self.get_serializer(movements, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques sur les mouvements de stock"""
        stats = {
            'total_movements': self.queryset.count(),
            'entries': self.queryset.filter(movement_type='in').count(),
            'exits': self.queryset.filter(movement_type='out').count(),
            'adjustments': self.queryset.filter(movement_type='adjustment').count(),
            'recent_movements': StockMovementSerializer(
                self.queryset[:10], many=True
            ).data,
        }
        return Response(stats)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """ViewSet pour les bons de commande"""
    queryset = PurchaseOrder.objects.select_related('supplier').prefetch_related('items__material').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status']
    search_fields = ['order_number', 'supplier__name']
    ordering_fields = ['order_date', 'created_at']
    ordering = ['-order_date']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PurchaseOrderDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PurchaseOrderCreateUpdateSerializer
        return PurchaseOrderListSerializer

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Marquer une commande comme reçue et mettre à jour le stock"""
        purchase_order = self.get_object()

        if purchase_order.status == 'received':
            return Response(
                {'error': 'Cette commande a déjà été reçue'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mettre à jour le stock pour chaque item
        for item in purchase_order.items.all():
            # Créer un mouvement de stock
            StockMovement.objects.create(
                material=item.material,
                movement_type='in',
                quantity=item.quantity,
                previous_stock=item.material.stock,
                new_stock=item.material.stock + item.quantity,
                notes=f"Réception commande {purchase_order.order_number}",
                created_by=request.data.get('created_by', 'System')
            )

            # Mettre à jour le stock
            item.material.stock += item.quantity
            item.material.save()

            # Marquer l'item comme reçu
            item.received_quantity = item.quantity
            item.save()

        # Mettre à jour le statut de la commande
        purchase_order.status = 'received'
        purchase_order.actual_delivery_date = request.data.get('delivery_date')
        purchase_order.save()

        serializer = PurchaseOrderDetailSerializer(purchase_order)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler une commande"""
        purchase_order = self.get_object()
        
        if purchase_order.status == 'received':
            return Response(
                {'error': 'Impossible d\'annuler une commande déjà reçue'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if purchase_order.status == 'cancelled':
            return Response(
                {'error': 'Cette commande est déjà annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        purchase_order.status = 'cancelled'
        purchase_order.save()
        
        serializer = PurchaseOrderDetailSerializer(purchase_order)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def receive_partial(self, request, pk=None):
        """Réception partielle d'une commande"""
        purchase_order = self.get_object()
        
        if purchase_order.status == 'received':
            return Response(
                {'error': 'Cette commande a déjà été entièrement reçue'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if purchase_order.status == 'cancelled':
            return Response(
                {'error': 'Impossible de recevoir une commande annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        received_items = request.data.get('items', [])
        
        if not received_items:
            return Response(
                {'error': 'Aucun article à recevoir'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for item_data in received_items:
            try:
                item = purchase_order.items.get(id=item_data.get('id'))
                quantity = Decimal(str(item_data.get('quantity', 0)))
                
                if quantity <= 0:
                    continue
                
                # Vérifier qu'on ne reçoit pas plus que commandé
                remaining = item.quantity - item.received_quantity
                if quantity > remaining:
                    quantity = remaining
                
                # Créer un mouvement de stock
                StockMovement.objects.create(
                    material=item.material,
                    movement_type='in',
                    quantity=quantity,
                    previous_stock=item.material.stock,
                    new_stock=item.material.stock + quantity,
                    notes=f"Réception partielle commande {purchase_order.order_number}",
                    created_by=request.data.get('created_by', 'System')
                )
                
                # Mettre à jour le stock
                item.material.stock += quantity
                item.material.save()
                
                # Mettre à jour la quantité reçue
                item.received_quantity += quantity
                item.save()
                
            except Exception as e:
                return Response(
                    {'error': f'Erreur lors de la réception de l\'article: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Vérifier si tout est reçu
        all_received = all(item.is_fully_received for item in purchase_order.items.all())
        if all_received:
            purchase_order.status = 'received'
            if not purchase_order.actual_delivery_date:
                purchase_order.actual_delivery_date = request.data.get('delivery_date')
            purchase_order.save()
        
        serializer = PurchaseOrderDetailSerializer(purchase_order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques sur les commandes"""
        stats = {
            'total_orders': self.queryset.count(),
            'by_status': list(
                self.queryset.values('status')
                .annotate(count=Count('id'))
                .order_by('status')
            ),
            'total_amount': self.queryset.aggregate(total=Sum('total_amount'))['total'] or 0,
            'pending_orders': self.queryset.filter(
                status__in=['draft', 'sent', 'confirmed']
            ).count(),
        }
        return Response(stats)


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet pour le tableau de bord"""

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Récupère toutes les statistiques du tableau de bord"""
        # Statistiques générales
        total_materials = Material.objects.count()
        low_stock_materials = Material.objects.filter(stock__lt=F('min_stock'))
        low_stock_count = low_stock_materials.count()
        
        total_value = Material.objects.aggregate(
            total=Sum(F('stock') * F('price'))
        )['total'] or 0

        categories_count = Category.objects.count()

        # Mouvements récents
        recent_movements = StockMovement.objects.select_related(
            'material', 'material__category'
        ).all()[:10]

        data = {
            'total_materials': total_materials,
            'low_stock_count': low_stock_count,
            'total_value': float(total_value),
            'categories_count': categories_count,
            'recent_movements': StockMovementSerializer(recent_movements, many=True).data,
            'low_stock_materials': MaterialListSerializer(low_stock_materials[:10], many=True).data,
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)