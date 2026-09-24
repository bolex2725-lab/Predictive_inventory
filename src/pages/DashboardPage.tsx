import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight,
  Plus,
  Truck,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface DashboardProps {
  onNavigate: (tab: string, productId?: string) => void;
  onOpenRecordSale: (productId?: string) => void;
  onOpenRecordRestock: (productId?: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenRecordSale,
  onOpenRecordRestock,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [salesSummary, setSalesSummary] = useState<any[]>([]);
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summary, sales] = await Promise.all([
        ApiClient.getDashboardSummary(),
        ApiClient.getSalesSummary(14),
      ]);
      setData(summary);
      setSalesSummary(sales);
    } catch (err: any) {
      showToast('Error Loading Dashboard', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTriggerQuickAlert = async (productId: string, productName: string) => {
    try {
      setSendingAlertId(productId);
      const res = await ApiClient.sendTestNotification(
        undefined,
        `🔔 *Urgent Reorder Alert*\nProduct: *${productName}*\nStock is critically depleted. Please restock immediately.`
      );
      showToast(
        'WhatsApp Notification Dispatched',
        `Reorder notification sent to registered WhatsApp number (${res.recipient}).`,
        'success'
      );
    } catch (err: any) {
      showToast('Notification Failed', err.message, 'error');
    } finally {
      setSendingAlertId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading business dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const attention = data?.attention_required || [];
  const preds = data?.prediction_breakdown || {};

  // Find max sales for SVG chart
  const maxSales = Math.max(...salesSummary.map((s) => s.amount), 1000);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero with Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Live SME Operations
            </span>
            <span className="text-xs text-emerald-200/80">• Staged Prediction Engine Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
            Predictive Inventory & Decision Support
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mt-1 leading-relaxed">
            Automated stock monitoring with transparent Average Daily Demand baseline and 
            self-transitioning Machine Learning models (Linear Regression & Random Forest).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onOpenRecordSale()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={() => onOpenRecordRestock()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>Record Restock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{kpis.total_products || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active SKU catalog</span>
        </div>

        {/* Current Stock Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Stock Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
            ₦{(kpis.current_stock_value || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Selling value</span>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs cursor-pointer group hover:bg-amber-50/40 transition-all"
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{kpis.low_stock_products || 0}</p>
          <span className="text-[11px] text-amber-600/90 mt-1 block">Within 30% of ROP</span>
        </div>

        {/* Reorder Required */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs cursor-pointer group hover:bg-rose-50/40 transition-all"
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Reorder Now</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">{kpis.reorder_required || 0}</p>
          <span className="text-[11px] text-rose-600/90 mt-1 block">Below Reorder Point</span>
        </div>

        {/* Today's Sales */}
        <div
          onClick={() => onNavigate('sales')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer group hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Sales</span>
            <ShoppingCart className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
            ₦{(kpis.today_sales || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Recorded transactions</span>
        </div>

        {/* Weekly Sales */}
        <div
          onClick={() => onNavigate('sales')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer group hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Weekly Sales</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
            ₦{(kpis.weekly_sales || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Past 7 days</span>
        </div>
      </div>

      {/* Row: Sales Chart & Staged Prediction Engine Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (14 days) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">14-Day Sales Velocity</h2>
              <p className="text-xs text-slate-500">Daily retail sales revenue & unit transaction spikes</p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1">
            {salesSummary.map((item, idx) => {
              const heightPercent = Math.max(8, Math.round((item.amount / maxSales) * 100));
              const dateLabel = new Date(item.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              });
              const dayName = new Date(item.date).toLocaleDateString('en-GB', { weekday: 'narrow' });

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
                    <span>{dateLabel}</span>
                    <span className="font-bold text-emerald-400">₦{item.amount.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-300">{item.units} units sold</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-t-sm h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        idx === salesSummary.length - 1
                          ? 'bg-emerald-600'
                          : 'bg-emerald-500/70 group-hover:bg-emerald-600'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 group-hover:text-slate-700 font-medium">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction Method Summary (Staged Strategy Core) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Staged Prediction Status</h2>
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
                <BrainCircuit className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of active algorithms across product series
            </p>

            <div className="space-y-3 mt-4">
              {/* Random Forest */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Random Forest</span>
                  </div>
                  <span className="text-xs font-black text-emerald-800">
                    {preds.random_forest || 0} Products
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Ensemble ML activated after meeting 90-day threshold &amp; 10% MAE improvement.
                </p>
              </div>

              {/* Linear Regression */}
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    <span className="text-xs font-bold text-slate-900">Linear Regression</span>
                  </div>
                  <span className="text-xs font-black text-teal-800">
                    {preds.linear_regression || 0} Products
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Trend &amp; calendar regression candidate active.
                </p>
              </div>

              {/* Rule-Based Baseline */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Rule-Based Baseline</span>
                  </div>
                  <span className="text-xs font-black text-amber-800">
                    {preds.rule_based || 0} Products
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Average Daily Demand + Safety Stock used during data accumulation period.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('predictions')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Prediction Decision Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Attention Required Table (Section 21) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Attention Required Products</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {attention.length} Critical
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock levels depleted below or near calculated Reorder Points
            </p>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {attention.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">All Stock Levels Healthy</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              No products currently require urgent restocking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Point (ROP)</th>
                  <th className="py-3 px-4">Recommended Order</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attention.map((item: any) => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                      LOW STOCK
                    </span>
                  );
                  if (item.status === 'OUT OF STOCK') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                        OUT OF STOCK
                      </span>
                    );
                  } else if (item.status === 'REORDER NOW') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-red-100 text-red-900 border border-red-300 animate-pulse">
                        REORDER NOW
                      </span>
                    );
                  }

                  let methodBadge = (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                      RULE_BASED
                    </span>
                  );
                  if (item.prediction_method === 'RANDOM_FOREST') {
                    methodBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RANDOM_FOREST
                      </span>
                    );
                  } else if (item.prediction_method === 'LINEAR_REGRESSION') {
                    methodBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        LINEAR_REGRESSION
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <button
                          onClick={() => onNavigate('products', item.id)}
                          className="hover:text-emerald-700 hover:underline text-left"
                        >
                          {item.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{item.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            item.current_stock <= 0
                              ? 'text-rose-600'
                              : item.current_stock <= item.reorder_point
                              ? 'text-rose-700 font-black'
                              : 'text-amber-700'
                          }`}
                        >
                          {item.current_stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{item.reorder_point}</td>
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        +{item.recommended_reorder_quantity} units
                      </td>
                      <td className="py-3 px-4">{methodBadge}</td>
                      <td className="py-3 px-4">{statusBadge}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenRecordRestock(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => handleTriggerQuickAlert(item.id, item.name)}
                            disabled={sendingAlertId === item.id}
                            title="Send WhatsApp Reorder Alert"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Send className={`w-3.5 h-3.5 ${sendingAlertId === item.id ? 'animate-spin' : ''}`} />
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
    </div>
  );
};
