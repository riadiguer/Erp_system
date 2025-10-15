from rest_framework import serializers
from .models import Category, Supplier, Material, StockMovement, PurchaseOrder, PurchaseOrderItem


class CategorySerializer(serializers.ModelSerializer):
    materials_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'materials_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_materials_count(self, obj):
        return obj.materials.count()


class SupplierSerializer(serializers.ModelSerializer):
    materials_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_name', 'email', 'phone', 
            'address', 'nif', 'rc', 'iban', 'payment_mode', 
            'payment_delay', 'notes', 'materials_count', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_materials_count(self, obj):
        return obj.materials.count()


class MaterialListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des matières (optimisé)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    stock_status = serializers.CharField(read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'name', 'reference', 'category', 'category_name',
            'supplier', 'supplier_name', 'stock', 'min_stock', 'unit',
            'price', 'is_low_stock', 'stock_percentage', 'stock_status',
            'total_value', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MaterialDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une matière première"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    stock_status = serializers.CharField(read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    recent_movements = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'name', 'reference', 'category', 'category_name',
            'supplier', 'supplier_name', 'stock', 'min_stock', 'unit',
            'price', 'description', 'is_low_stock', 'stock_percentage', 
            'stock_status', 'total_value', 'recent_movements',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_recent_movements(self, obj):
        movements = obj.movements.all()[:10]
        return StockMovementSerializer(movements, many=True).data


class MaterialCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier une matière première"""
    
    class Meta:
        model = Material
        fields = [
            'id', 'name', 'reference', 'category', 'supplier',
            'stock', 'min_stock', 'unit', 'price', 'description'
        ]

    def validate_min_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock minimum ne peut pas être négatif")
        if value == 0:
            raise serializers.ValidationError("Le stock minimum doit être supérieur à 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif")
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_reference = serializers.CharField(source='material.reference', read_only=True)
    material_unit = serializers.CharField(source='material.unit', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'material', 'material_name', 'material_reference', 'material_unit',
            'movement_type', 'quantity', 'previous_stock', 'new_stock',
            'notes', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_at', 'previous_stock', 'new_stock']


class StockMovementCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un mouvement de stock"""
    
    class Meta:
        model = StockMovement
        fields = ['material', 'movement_type', 'quantity', 'notes', 'created_by']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("La quantité doit être supérieure à 0")
        return value

    def validate(self, data):
        material = data['material']
        movement_type = data['movement_type']
        quantity = data['quantity']

        # Vérifier si le stock est suffisant pour une sortie
        if movement_type == 'out' and material.stock < quantity:
            raise serializers.ValidationError({
                'quantity': f"Stock insuffisant. Stock actuel: {material.stock} {material.unit}"
            })

        return data

    def create(self, validated_data):
        material = validated_data['material']
        movement_type = validated_data['movement_type']
        quantity = validated_data['quantity']

        # Enregistrer l'ancien stock
        validated_data['previous_stock'] = material.stock

        # Calculer le nouveau stock
        if movement_type == 'in':
            new_stock = material.stock + quantity
        elif movement_type == 'out':
            new_stock = material.stock - quantity
        else:  # adjustment
            new_stock = quantity

        validated_data['new_stock'] = new_stock

        # Créer le mouvement
        movement = StockMovement.objects.create(**validated_data)

        # Mettre à jour le stock du matériel
        material.stock = new_stock
        material.save()

        return movement


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_reference = serializers.CharField(source='material.reference', read_only=True)
    material_unit = serializers.CharField(source='material.unit', read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_fully_received = serializers.BooleanField(read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id', 'material', 'material_name', 'material_reference', 'material_unit',
            'quantity', 'unit_price', 'received_quantity', 'total_price', 'is_fully_received'
        ]


class PurchaseOrderListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'order_number', 'supplier', 'supplier_name', 'status',
            'order_date', 'expected_delivery_date', 'actual_delivery_date',
            'total_amount', 'items_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()


class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'order_number', 'supplier', 'supplier_name', 'status',
            'order_date', 'expected_delivery_date', 'actual_delivery_date',
            'total_amount', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PurchaseOrderCreateUpdateSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'order_number', 'supplier', 'status', 'order_date',
            'expected_delivery_date', 'actual_delivery_date', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)

        # Créer les lignes de commande
        total = 0
        for item_data in items_data:
            item = PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
            total += item.total_price

        # Mettre à jour le montant total
        purchase_order.total_amount = total
        purchase_order.save()

        return purchase_order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Mettre à jour les champs de base
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Si des items sont fournis, les mettre à jour
        if items_data is not None:
            # Supprimer les anciens items
            instance.items.all().delete()

            # Créer les nouveaux items
            total = 0
            for item_data in items_data:
                item = PurchaseOrderItem.objects.create(purchase_order=instance, **item_data)
                total += item.total_price

            # Mettre à jour le montant total
            instance.total_amount = total

        instance.save()
        return instance


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques du tableau de bord"""
    total_materials = serializers.IntegerField()
    low_stock_count = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    categories_count = serializers.IntegerField()
    recent_movements = StockMovementSerializer(many=True)
    low_stock_materials = MaterialListSerializer(many=True)