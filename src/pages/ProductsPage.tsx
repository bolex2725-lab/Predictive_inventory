import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { Product, ProductCategory, StockStatus } from '../types';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ShoppingCart,
  Truck,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface ProductsPageProps {
  onOpenRecordSale: (productId: string) => void;
  onOpenRecordRestock: (productId: string) => void;
  onNavigateToPredictions: (productId?: string) => void;
  initialSelectedProductId?: string;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onOpenRecordSale,
  onOpenRecordRestock,
  onNavigateToPredictions,
  initialSelectedProductId,
}) => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    category: 'FOODS' as ProductCategory,
    selling_price: '',
    cost_price: '',
    current_stock: '',
    lead_time_days: '5',
    buffer_quantity: '10',
    unit: 'units',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getProducts();
      setProducts(data);

      if (initialSelectedProductId) {
        const match = data.find((p) => p.id === initialSelectedProductId);
        if (match) setDetailsProduct(match);
      }
    } catch (err: any) {
      showToast('Error Loading Products', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setFormState({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'FOODS',
      selling_price: '',
      cost_price: '',
      current_stock: '25',
      lead_time_days: '5',
      buffer_quantity: '10',
      unit: 'units',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormState({
      name: product.name,
      sku: product.sku,
      category: product.category,
      selling_price: String(product.selling_price),
      cost_price: String(product.cost_price),
      current_stock: String(product.current_stock),
      lead_time_days: String(product.lead_time_days),
      buffer_quantity: String(product.buffer_quantity),
      unit: product.unit,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createProduct({
        ...formState,
        selling_price: Number(formState.selling_price),
        cost_price: Number(formState.cost_price),
        current_stock: Number(formState.current_stock),
        lead_time_days: Number(formState.lead_time_days),
        buffer_quantity: Number(formState.buffer_quantity),
      });
      showToast('Product Created', `Added ${formState.name} to inventory.`, 'success');
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast('Creation Failed', err.message, 'error');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await ApiClient.updateProduct(selectedProduct.id, {
        name: formState.name,
        sku: formState.sku,
        category: formState.category,
        selling_price: Number(formState.selling_price),
        cost_price: Number(formState.cost_price),
        lead_time_days: Number(formState.lead_time_days),
        buffer_quantity: Number(formState.buffer_quantity),
        unit: formState.unit,
      });
      showToast('Product Updated', `Saved changes for ${formState.name}.`, 'success');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await ApiClient.deleteProduct(id);
      showToast('Product Deactivated', `${name} deactivated from inventory view.`, 'info');
      if (detailsProduct?.id === id) setDetailsProduct(null);
      fetchProducts();
    } catch (err: any) {
      showToast('Deactivation Failed', err.message, 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.stock_status === statusFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Inventory &amp; Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track real-time stock levels, lead times, safety stocks, and replenishment parameters.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="FOODS">FOODS</option>
            <option value="HOUSEHOLD">HOUSEHOLD</option>
            <option value="HOBBIES">HOBBIES</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">HEALTHY</option>
            <option value="LOW STOCK">LOW STOCK</option>
            <option value="REORDER NOW">REORDER NOW</option>
            <option value="OUT OF STOCK">OUT OF STOCK</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Products Found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or add a new retail product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product &amp; SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Prediction Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                      HEALTHY
                    </span>
                  );
                  if (product.stock_status === 'OUT OF STOCK') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                        OUT OF STOCK
                      </span>
                    );
                  } else if (product.stock_status === 'REORDER NOW') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-red-100 text-red-900 border border-red-300 animate-pulse">
                        REORDER NOW
                      </span>
                    );
                  } else if (product.stock_status === 'LOW STOCK') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                        LOW STOCK
                      </span>
                    );
                  }

                  let methodBadge = (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                      RULE_BASED
                    </span>
                  );
                  if (product.prediction_method === 'RANDOM_FOREST') {
                    methodBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RANDOM_FOREST
                      </span>
                    );
                  } else if (product.prediction_method === 'LINEAR_REGRESSION') {
                    methodBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        LINEAR_REGRESSION
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setDetailsProduct(product)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {product.sku}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{product.category}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ₦{product.selling_price.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Cost: ₦{product.cost_price.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-black ${
                            product.current_stock <= 0
                              ? 'text-rose-600'
                              : product.current_stock <= (product.reorder_point ?? product.reorder_level)
                              ? 'text-rose-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {product.current_stock} {product.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {product.reorder_point ?? product.reorder_level} {product.unit}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {product.lead_time_days} days
                      </td>
                      <td className="py-3.5 px-4">{methodBadge}</td>
                      <td className="py-3.5 px-4">{statusBadge}</td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenRecordSale(product.id)}
                            title="Record Sale"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenRecordRestock(product.id)}
                            title="Record Restock"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDetailsProduct(product)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            title="Deactivate Product"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Details Drawer / Modal */}
      {detailsProduct && (
        <Modal
          isOpen={!!detailsProduct}
          onClose={() => setDetailsProduct(null)}
          title={detailsProduct.name}
          subtitle={`SKU: ${detailsProduct.sku} • Category: ${detailsProduct.category}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Stock</span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {detailsProduct.current_stock} {detailsProduct.unit}
                </p>
                <span className="text-[10px] text-slate-500">{detailsProduct.stock_status}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Reorder Point</span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {detailsProduct.reorder_point ?? detailsProduct.reorder_level} {detailsProduct.unit}
                </p>
                <span className="text-[10px] text-slate-500">LTD + Safety Stock</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Recommended Order</span>
                <p className="text-xl font-black text-emerald-800 mt-1">
                  +{detailsProduct.recommended_reorder_quantity || 0} {detailsProduct.unit}
                </p>
                <span className="text-[10px] text-emerald-600">ROP + Buffer - Stock</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Lead Time</span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {detailsProduct.lead_time_days} Days
                </p>
                <span className="text-[10px] text-slate-500">Buffer: {detailsProduct.buffer_quantity} units</span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Selling Price</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  ₦{detailsProduct.selling_price.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Cost Price</span>
                <p className="text-base font-bold text-slate-700 mt-0.5">
                  ₦{detailsProduct.cost_price.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-600">Gross Margin</span>
                <p className="text-base font-black text-emerald-700 mt-0.5">
                  ₦{(detailsProduct.selling_price - detailsProduct.cost_price).toLocaleString()} (
                  {(
                    ((detailsProduct.selling_price - detailsProduct.cost_price) /
                      detailsProduct.selling_price) *
                    100
                  ).toFixed(1)}
                  %)
                </p>
              </div>
            </div>

            {/* Prediction Engine & Decision Explainability */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Decision Support &amp; Active Algorithm
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  {detailsProduct.prediction_method || 'RULE_BASED'}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {detailsProduct.prediction_reason ||
                  'Initial state: using transparent Rule-Based baseline (Average Daily Demand) pending sufficient historical transaction data.'}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Forecast Daily Demand: ~{detailsProduct.forecast_demand || 2.0} units/day
                </span>
                <button
                  onClick={() => {
                    setDetailsProduct(null);
                    onNavigateToPredictions(detailsProduct.id);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Inspect Chronological ML Comparison &rarr;
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setDetailsProduct(null);
                  onOpenRecordSale(detailsProduct.id);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Record Sale</span>
              </button>
              <button
                onClick={() => {
                  setDetailsProduct(null);
                  onOpenRecordRestock(detailsProduct.id);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Restock Units</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Retail Product"
        subtitle="Specify category, pricing, lead time, and buffer stock parameters."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Milo Refill Pack 500g"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Barcode *
              </label>
              <input
                type="text"
                required
                value={formState.sku}
                onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formState.category}
                onChange={(e) =>
                  setFormState({ ...formState, category: e.target.value as ProductCategory })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="FOODS">FOODS</option>
                <option value="HOUSEHOLD">HOUSEHOLD</option>
                <option value="HOBBIES">HOBBIES</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="2500"
                value={formState.selling_price}
                onChange={(e) => setFormState({ ...formState, selling_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="2000"
                value={formState.cost_price}
                onChange={(e) => setFormState({ ...formState, cost_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opening Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formState.current_stock}
                onChange={(e) => setFormState({ ...formState, current_stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <input
                type="text"
                placeholder="e.g. bags, tins, packs"
                value={formState.unit}
                onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formState.lead_time_days}
                onChange={(e) => setFormState({ ...formState, lead_time_days: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buffer Quantity (Units)
              </label>
              <input
                type="number"
                min="0"
                value={formState.buffer_quantity}
                onChange={(e) => setFormState({ ...formState, buffer_quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
        subtitle={`Updating ${selectedProduct?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                required
                value={formState.sku}
                onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formState.category}
                onChange={(e) =>
                  setFormState({ ...formState, category: e.target.value as ProductCategory })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="FOODS">FOODS</option>
                <option value="HOUSEHOLD">HOUSEHOLD</option>
                <option value="HOBBIES">HOBBIES</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₦)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formState.selling_price}
                onChange={(e) => setFormState({ ...formState, selling_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (₦)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formState.cost_price}
                onChange={(e) => setFormState({ ...formState, cost_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={formState.lead_time_days}
                onChange={(e) => setFormState({ ...formState, lead_time_days: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buffer Quantity (Units)
              </label>
              <input
                type="number"
                min="0"
                value={formState.buffer_quantity}
                onChange={(e) => setFormState({ ...formState, buffer_quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
