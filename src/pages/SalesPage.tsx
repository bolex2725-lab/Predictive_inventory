import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { Product, Sale } from '../types';
import {
  ShoppingCart,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Send,
  Package,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface SalesPageProps {
  initialProductId?: string;
}

export const SalesPage: React.FC<SalesPageProps> = ({ initialProductId }) => {
  const { showToast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');

  // Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({
    product_id: '',
    quantity: '1',
    selling_price: '',
    sale_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [oversellError, setOversellError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        ApiClient.getSales(),
        ApiClient.getProducts(),
      ]);
      setSales(salesData);
      setProducts(productsData);

      if (initialProductId) {
        const prod = productsData.find((p) => p.id === initialProductId);
        if (prod) {
          setSaleForm({
            product_id: prod.id,
            quantity: '1',
            selling_price: String(prod.selling_price),
            sale_date: new Date().toISOString().split('T')[0],
          });
          setIsRecordModalOpen(true);
        }
      }
    } catch (err: any) {
      showToast('Error Loading Sales', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [initialProductId]);

  const handleOpenRecordModal = (prodId?: string) => {
    const targetProd = prodId
      ? products.find((p) => p.id === prodId)
      : products.length > 0
      ? products[0]
      : null;

    setOversellError(null);
    setSaleForm({
      product_id: targetProd ? targetProd.id : '',
      quantity: '1',
      selling_price: targetProd ? String(targetProd.selling_price) : '',
      sale_date: new Date().toISOString().split('T')[0],
    });
    setIsRecordModalOpen(true);
  };

  const handleProductSelectChange = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setOversellError(null);
    setSaleForm({
      ...saleForm,
      product_id: prodId,
      selling_price: prod ? String(prod.selling_price) : saleForm.selling_price,
    });
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setOversellError(null);
    const prod = products.find((p) => p.id === saleForm.product_id);

    if (!prod) {
      setOversellError('Please select a valid product.');
      return;
    }

    const qty = Number(saleForm.quantity);
    if (qty <= 0) {
      setOversellError('Quantity must be greater than 0.');
      return;
    }

    if (qty > prod.current_stock) {
      setOversellError(
        `Insufficient Stock! Cannot record sale of ${qty} units. Only ${prod.current_stock} units currently available in stock.`
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await ApiClient.recordSale({
        product_id: saleForm.product_id,
        quantity: qty,
        selling_price: Number(saleForm.selling_price),
        sale_date: saleForm.sale_date,
      });

      let alertNote = '';
      if (res.notification_sent) {
        alertNote = ' Current stock dropped below reorder point: WhatsApp reorder alert triggered!';
      }

      showToast(
        'Sale Recorded Successfully',
        `Sold ${qty} units of ${prod.name}.${alertNote}`,
        res.notification_sent ? 'warning' : 'success'
      );

      setIsRecordModalOpen(false);
      fetchData();
    } catch (err: any) {
      setOversellError(err.message);
      showToast('Sale Recording Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.name : 'Product';
  };

  const filteredSales = sales.filter((s) => {
    const pName = getProductName(s.product_id).toLowerCase();
    const matchesProduct =
      selectedProductFilter === 'ALL' || s.product_id === selectedProductFilter;
    const matchesSearch =
      pName.includes(search.toLowerCase()) || s.sale_date.includes(search);
    return matchesProduct && matchesSearch;
  });

  const selectedFormProduct = products.find((p) => p.id === saleForm.product_id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sales Recording &amp; Depletion
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log real-time retail sales transactions with automated stock decrement and reorder monitoring.
          </p>
        </div>

        <button
          onClick={() => handleOpenRecordModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sales transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Product:</span>
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading sales records...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Sales Transactions Recorded</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Record New Sale&quot; to log your first transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Quantity Sold</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSales.map((sale) => {
                  const pName = getProductName(sale.product_id);

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {sale.sale_date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{pName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sale.quantity}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        ₦{sale.selling_price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-800">
                        ₦{sale.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                        {sale.id.slice(0, 16)}...
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Sale Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Customer Sale"
        subtitle="Deducts stock automatically and checks reorder threshold."
        maxWidth="md"
      >
        <form onSubmit={handleRecordSale} className="space-y-4">
          {oversellError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{oversellError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product *
            </label>
            <select
              required
              value={saleForm.product_id}
              onChange={(e) => handleProductSelectChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.current_stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {selectedFormProduct && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Available Stock:</span>
                <span
                  className={`ml-1.5 font-bold ${
                    selectedFormProduct.current_stock <= 0
                      ? 'text-rose-600'
                      : selectedFormProduct.current_stock <=
                        (selectedFormProduct.reorder_point ?? selectedFormProduct.reorder_level)
                      ? 'text-amber-700'
                      : 'text-slate-900'
                  }`}
                >
                  {selectedFormProduct.current_stock} {selectedFormProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Reorder Point:</span>
                <span className="ml-1.5 font-bold text-slate-700">
                  {selectedFormProduct.reorder_point ?? selectedFormProduct.reorder_level}{' '}
                  {selectedFormProduct.unit}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity to Sell *
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedFormProduct ? selectedFormProduct.current_stock : 9999}
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={saleForm.selling_price}
                onChange={(e) => setSaleForm({ ...saleForm, selling_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sale Date</label>
            <input
              type="date"
              required
              value={saleForm.sale_date}
              onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Total calculation preview */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900">Total Transaction Value:</span>
            <span className="font-black text-sm text-emerald-800">
              ₦{((Number(saleForm.quantity) || 0) * (Number(saleForm.selling_price) || 0)).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
