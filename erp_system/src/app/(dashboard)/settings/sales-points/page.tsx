'use client';

import { useState, useMemo } from 'react';
import { useSalesPoints, useOrders } from '@/lib/features/sales/hooks';
import { SalesApi } from '@/lib/features/sales/api';
import { PermissionGate } from '@/components/guards/PermissionGate';
import type { SalesPoint } from '@/lib/features/sales/api';

const kindLabels = {
  SHOWROOM: 'Showroom / POS',
  SOCIAL: 'Social Media',
  WHATSAPP: 'WhatsApp / Phone',
  WEBSITE: 'Website',
  MARKET: 'Marketplace',
  DEPOT: 'Depot',
  FACTORY: 'Factory',
  OTHER: 'Other'
};

const kindIcons = {
  SHOWROOM: '🪟',
  SOCIAL: '📱',
  WHATSAPP: '💬',
  WEBSITE: '🌐',
  MARKET: '🛒',
  OTHER: '📌',
  DEPOT: '🏬',
  FACTORY: '🏭',
};

const kindColors = {
  SHOWROOM: 'bg-blue-100 text-blue-800 border-blue-200',
  SOCIAL: 'bg-pink-100 text-pink-800 border-pink-200',
  WHATSAPP: 'bg-green-100 text-green-800 border-green-200',
  WEBSITE: 'bg-purple-100 text-purple-800 border-purple-200',
  MARKET: 'bg-orange-100 text-orange-800 border-orange-200',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-200',
  DEPOT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  FACTORY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function SalesPointsPage() {
  const { salesPoints, refresh, loading, error } = useSalesPoints();
  const { orders } = useOrders();
  
  // Form states
  const [name, setName] = useState('');
  const [kind, setKind] = useState<SalesPoint['kind']>('SHOWROOM');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState('');
  const [editKind, setEditKind] = useState<SalesPoint['kind']>('SHOWROOM');
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKind, setFilterKind] = useState<SalesPoint['kind'] | 'ALL'>('ALL');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'kind' | 'created_at' | 'orders'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Calculate sales point statistics
  const salesPointStats = useMemo(() => {
    if (!orders || !salesPoints) return {};
    
    const stats: Record<string, { orderCount: number; totalRevenue: string }> = {};
    
    salesPoints.forEach(sp => {
      const spOrders = orders.filter(order => order.sales_point_detail?.id === sp.id);
      const totalRevenue = spOrders
        .reduce((sum, order) => sum + parseFloat(order.total || '0'), 0)
        .toFixed(2);
      
      stats[sp.id] = {
        orderCount: spOrders.length,
        totalRevenue
      };
    });
    
    return stats;
  }, [orders, salesPoints]);

  // Filter and sort sales points
  const filteredAndSortedSalesPoints = useMemo(() => {
    let filtered = salesPoints.filter(sp => {
      const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sp.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKind = filterKind === 'ALL' || sp.kind === filterKind;
      const matchesActive = filterActive === 'ALL' || 
                           (filterActive === 'ACTIVE' && sp.is_active) ||
                           (filterActive === 'INACTIVE' && !sp.is_active);
      
      return matchesSearch && matchesKind && matchesActive;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'kind':
          comparison = a.kind.localeCompare(b.kind);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'orders':
          const aOrders = salesPointStats[a.id]?.orderCount || 0;
          const bOrders = salesPointStats[b.id]?.orderCount || 0;
          comparison = aOrders - bOrders;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [salesPoints, searchTerm, filterKind, filterActive, sortBy, sortOrder, salesPointStats]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = salesPoints.length;
    const active = salesPoints.filter(sp => sp.is_active).length;
    const inactive = total - active;
    const totalOrders = Object.values(salesPointStats).reduce((sum, stat) => sum + stat.orderCount, 0);
    const totalRevenue = Object.values(salesPointStats)
      .reduce((sum, stat) => sum + parseFloat(stat.totalRevenue), 0)
      .toFixed(2);

    return { total, active, inactive, totalOrders, totalRevenue };
  }, [salesPoints, salesPointStats]);

  async function add() {
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      await SalesApi.salesPoints.create({ name, kind, is_active: true, meta: {} });
      setName(''); 
      setKind('SHOWROOM'); 
      await refresh();
    } catch (error) {
      console.error('Error adding sales point:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteSalesPoint(id: string, name: string) {
    const orderCount = salesPointStats[id]?.orderCount || 0;
    const warningMessage = orderCount > 0 
      ? `"${name}" has ${orderCount} associated orders. Are you sure you want to delete it? This action cannot be undone.`
      : `Are you sure you want to delete "${name}"? This action cannot be undone.`;
    
    if (!confirm(warningMessage)) {
      return;
    }
    
    setDeletingId(id);
    try {
      await SalesApi.salesPoints.delete(Number(id));
      await refresh();
    } catch (error) {
      console.error('Error deleting sales point:', error);
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    setUpdatingId(id);
    try {
      await SalesApi.salesPoints.update(Number(id), { is_active: !currentStatus });
      await refresh();
    } catch (error) {
      console.error('Error updating sales point status:', error);
    } finally {
      setUpdatingId(null);
    }
  }

  function startEdit(sp: SalesPoint) {
    setEditingId(sp.id);
    setEditName(sp.name);
    setEditKind(sp.kind);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    
    setUpdatingId(id);
    try {
      await SalesApi.salesPoints.update(Number(id), { 
        name: editName, 
        kind: editKind 
      });
      setEditingId(null);
      await refresh();
    } catch (error) {
      console.error('Error updating sales point:', error);
    } finally {
      setUpdatingId(null);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditKind('SHOWROOM');
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      add();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Error loading sales points</h3>
            <p className="mt-1 text-sm">{error.message || 'Something went wrong'}</p>
            <button 
              onClick={() => refresh()} 
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header with Summary Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Points</h1>
          <p className="text-gray-600 mt-1">Manage your sales channels and points of contact</p>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-600 text-2xl font-bold">{summary.total}</div>
              <div className="text-blue-800 text-sm font-medium">Total Points</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-600 text-2xl font-bold">{summary.active}</div>
              <div className="text-green-800 text-sm font-medium">Active</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-gray-600 text-2xl font-bold">{summary.inactive}</div>
              <div className="text-gray-800 text-sm font-medium">Inactive</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-purple-600 text-2xl font-bold">{summary.totalOrders}</div>
              <div className="text-purple-800 text-sm font-medium">Total Orders</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-orange-600 text-2xl font-bold">${summary.totalRevenue}</div>
              <div className="text-orange-800 text-sm font-medium">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <PermissionGate need="sales_manage">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Sales Point</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input 
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors" 
                placeholder="Enter sales point name" 
                value={name} 
                onChange={e => setName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select 
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors" 
                value={kind} 
                onChange={e => setKind(e.target.value as SalesPoint['kind'])}
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed" 
                onClick={add}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Sales Point'}
              </button>
            </div>
          </div>
        </div>
      </PermissionGate>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filterKind}
              onChange={e => setFilterKind(e.target.value as SalesPoint['kind'] | 'ALL')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              {Object.entries(kindLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterActive}
              onChange={e => setFilterActive(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'kind' | 'created_at' | 'orders')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="kind">Type</option>
              <option value="created_at">Created Date</option>
              <option value="orders">Order Count</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Points Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Points ({filteredAndSortedSalesPoints.length})
          </h2>
          {searchTerm || filterKind !== 'ALL' || filterActive !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterKind('ALL');
                setFilterActive('ALL');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          ) : null}
        </div>
        
        {filteredAndSortedSalesPoints.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🪟</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {salesPoints.length === 0 ? 'No sales points yet' : 'No matching sales points'}
            </h3>
            <p className="text-gray-600">
              {salesPoints.length === 0 
                ? 'Add your first sales point to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedSalesPoints.map(sp => {
              const stats = salesPointStats[sp.id] || { orderCount: 0, totalRevenue: '0.00' };
              const isEditing = editingId === sp.id;
              const isUpdating = updatingId === sp.id;
              
              return (
                <div 
                  key={sp.id} 
                  className={`group relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                    sp.is_active 
                      ? 'border-gray-200 hover:border-blue-300' 
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  {/* Gradient Header */}
                  <div className={`h-2 w-full ${
                    sp.is_active 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}></div>
                  
                  <div className="p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Icon with background */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border ${kindColors[sp.kind]}`}>
                          {kindIcons[sp.kind]}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyPress={e => handleEditKeyPress(e, sp.id)}
                                className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                                placeholder="Sales point name"
                              />
                              <select
                                value={editKind}
                                onChange={e => setEditKind(e.target.value as SalesPoint['kind'])}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                              >
                                {Object.entries(kindLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-900 transition-colors">
                                {sp.name}
                              </h3>
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${kindColors[sp.kind]}`}>
                                <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-60"></span>
                                {kindLabels[sp.kind]}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border ${
                        sp.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          sp.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}></span>
                        {sp.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="text-xs font-medium text-blue-700">Orders</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{stats.orderCount}</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-xs font-medium text-emerald-700">Revenue</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-900">${stats.totalRevenue}</div>
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          Slug
                        </span>
                        <code className="bg-white px-3 py-1.5 rounded-md text-gray-800 font-mono text-sm border shadow-sm">
                          {sp.slug}
                        </code>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0a1 1 0 01-1 1v9a2 2 0 002 2h8a2 2 0 002-2V8a1 1 0 01-1-1" />
                        </svg>
                        Created {new Date(sp.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <PermissionGate need="sales_manage">
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveEdit(sp.id)}
                              disabled={!editName.trim() || isUpdating}
                              className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed shadow-sm"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isUpdating}
                              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(sp)}
                              disabled={isUpdating}
                              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                              title="Edit sales point"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            
                            <button
                              onClick={() => toggleActive(sp.id, sp.is_active)}
                              disabled={isUpdating}
                              className={`flex items-center px-3 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium ${
                                sp.is_active 
                                  ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={sp.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : sp.is_active ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Activate
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteSalesPoint(sp.id, sp.name)}
                              disabled={deletingId === sp.id}
                              className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                              title="Delete sales point"
                            >
                              {deletingId === sp.id ? (
                                <div className="w-4 h-4 mr-1 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </PermissionGate>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}