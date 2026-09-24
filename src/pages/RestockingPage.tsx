import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { Product, Restock } from '../types';
import { Truck, Plus, Search, CheckCircle2, Package, ArrowDownToLine } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface RestockingPageProps {
  initialProductId?: string;
}

export const RestockingPage: React.FC<RestockingPageProps> = ({ initialProductId }) => {
  const { showToast } = useToast();
  const [restocks, setRestocks] = useState<Restock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [restockForm, setRestockForm] = useState({
    product_id: '',
    quantity: '20',
    supplier: 'Lagos Wholesale Market Ltd',
    unit_cost: '',
    restock_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restocksData, productsData] = await Promise.all([
        ApiClient.getRestocks(),
        ApiClient.getProducts(),
      ]);
      setRestocks(restocksData);
      setProducts(productsData);

      if (initialProductId) {
        const prod = productsData.find((p) => p.id === initialProductId);
        if (prod) {
          setRestockForm({
            product_id: prod.id,
            quantity: String(prod.recommended_reorder_quantity || 20),
            supplier: 'Lagos Wholesale Market Ltd',
            unit_cost: String(prod.cost_price),
            restock_date: new Date().toISOString().split('T')[0],
          });
          setIsRecordModalOpen(true);
        }
      }
    } catch (err: any) {
      showToast('Error Loading Restocks', err.message, 'error');
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

    setRestockForm({
      product_id: targetProd ? targetProd.id : '',
      quantity: targetProd ? String(targetProd.recommended_reorder_quantity || 20) : '20',
      supplier: 'Lagos Wholesale Market Ltd',
      unit_cost: targetProd ? String(targetProd.cost_price) : '',
      restock_date: new Date().toISOString().split('T')[0],
    });
    setIsRecordModalOpen(true);
  };

  const handleProductSelectChange = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setRestockForm({
      ...restockForm,
      product_id: prodId,
      unit_cost: prod ? String(prod.cost_price) : restockForm.unit_cost,
      quantity: prod ? String(prod.recommended_reorder_quantity || 20) : restockForm.quantity,
    });
  };

  const handleRecordRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(restockForm.quantity);
    if (qty <= 0) {
      showToast('Validation Error', 'Restock quantity must be positive', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await ApiClient.recordRestock({
        product_id: restockForm.product_id,
        quantity: qty,
        supplier: restockForm.supplier,
        unit_cost: Number(restockForm.unit_cost),
        restock_date: restockForm.restock_date,
      });

      const prod = products.find((p) => p.id === restockForm.product_id);
      showToast(
        'Inventory Replenished',
        `Successfully added ${qty} units of ${prod?.name || 'product'} to stock.`,
        'success'
      );
      setIsRecordModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('Restock Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.name : 'Product';
  };

  const filteredRestocks = restocks.filter((r) => {
    const pName = getProductName(r.product_id).toLowerCase();
    const sup = r.supplier.toLowerCase();
    const q = search.toLowerCase();
    return pName.includes(q) || sup.includes(q) || r.restock_date.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Stock Replenishment &amp; Inbound Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Record supplier deliveries, update inventory levels, and recalculate safety buffers.
          </p>
        </div>

        <button
          onClick={() => handleOpenRecordModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Record New Restock</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restock entries by product, supplier, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Restocks Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading replenishment history...</p>
          </div>
        ) : filteredRestocks.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Restock Deliveries Recorded</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Record New Restock&quot; to log incoming supplier inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Units Added</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Delivery Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRestocks.map((r) => {
                  const pName = getProductName(r.product_id);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {r.restock_date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{pName}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">+{r.quantity}</td>
                      <td className="py-3.5 px-4 text-slate-600">{r.supplier}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        ₦{r.unit_cost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₦{r.total_cost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                        {r.id.slice(0, 16)}...
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Restock Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Inventory Delivery"
        subtitle="Increases current stock and recalculates replenishment status."
        maxWidth="md"
      >
        <form onSubmit={handleRecordRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product *
            </label>
            <select
              required
              value={restockForm.product_id}
              onChange={(e) => handleProductSelectChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.current_stock} {p.unit} • ROP: {p.reorder_point ?? p.reorder_level})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity Received *
              </label>
              <input
                type="number"
                required
                min="1"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Cost (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={restockForm.unit_cost}
                onChange={(e) => setRestockForm({ ...restockForm, unit_cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier / Source
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lagos Wholesale Market, Oyingbo Depot"
              value={restockForm.supplier}
              onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Date</label>
            <input
              type="date"
              required
              value={restockForm.restock_date}
              onChange={(e) => setRestockForm({ ...restockForm, restock_date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Cost preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Total Purchase Cost:</span>
            <span className="font-black text-sm text-slate-900">
              ₦{((Number(restockForm.quantity) || 0) * (Number(restockForm.unit_cost) || 0)).toLocaleString()}
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
              {submitting ? 'Updating...' : 'Add to Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
