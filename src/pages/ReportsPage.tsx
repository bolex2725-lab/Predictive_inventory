import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { Report } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Sparkles,
  TrendingUp,
  Package,
  Truck,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchWeeklyReport = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getWeeklyReport();
      setReport(data);
    } catch (err: any) {
      showToast('Error Loading Report', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReport();
  }, []);

  const handleGenerateFresh = async () => {
    try {
      setGenerating(true);
      const data = await ApiClient.generateReport();
      setReport(data);
      showToast('Weekly Report Generated', 'Calculated 7-day inventory performance.', 'success');
    } catch (err: any) {
      showToast('Generation Failed', err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Generating weekly inventory report...</p>
        </div>
      </div>
    );
  }

  const { inventory_summary, sales_summary, restocking_summary, prediction_summary, recommendations } =
    report;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Weekly Inventory &amp; Performance Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Reporting Period: {report.period_start} to {report.period_end}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateFresh}
            disabled={generating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-black text-xl tracking-tight">StockPredict</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Official Weekly Briefing
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-2">
              Executive Inventory Decision-Support Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted for SME Retail Management • Currency: NGN (₦)
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block">Report ID: {report.id}</span>
            <span className="text-slate-500 block font-mono">
              Generated: {new Date(report.created_at).toLocaleString('en-GB')}
            </span>
          </div>
        </div>

        {/* Section 1: Executive KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Weekly Revenue</span>
            <p className="text-xl font-black text-slate-900 mt-1">
              ₦{sales_summary.total_sales_amount.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500">
              {sales_summary.total_transactions} customer orders
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inventory Value</span>
            <p className="text-xl font-black text-slate-900 mt-1">
              ₦{inventory_summary.total_inventory_value.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500">
              {inventory_summary.total_products} distinct SKUs
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Restocking Incurred</span>
            <p className="text-xl font-black text-slate-900 mt-1">
              ₦{restocking_summary.total_restocking_cost.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500">
              +{restocking_summary.total_restocked_units} incoming units
            </span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-700 uppercase">Reorders Needed</span>
            <p className="text-xl font-black text-rose-800 mt-1">
              {inventory_summary.reorder_required + inventory_summary.out_of_stock}
            </p>
            <span className="text-[11px] text-rose-600">
              {inventory_summary.out_of_stock} stockouts
            </span>
          </div>
        </div>

        {/* Section 2: Top Selling Products & Restocking Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Selling */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Top 5 Fast-Moving Items</span>
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Units Sold</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales_summary.top_selling_products.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.product_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.units} units</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800">
                        ₦{item.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Restocking Inbound */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-teal-600" />
              <span>Frequent Replenishments</span>
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Deliveries</th>
                    <th className="py-2.5 px-3 text-right">Total Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {restocking_summary.frequent_restocks.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.product_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.count} deliveries</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        +{item.units} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: Staged Prediction Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
            <span>Algorithm Distribution Breakdown</span>
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Rule-Based (ADD)</span>
              <span className="text-lg font-black text-amber-700">
                {prediction_summary.rule_based_count} Products
              </span>
              <span className="text-[10px] text-slate-500 block">Baseline safety stock</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Machine Learning Active
              </span>
              <span className="text-lg font-black text-emerald-700">
                {prediction_summary.ml_count} Products
              </span>
              <span className="text-[10px] text-slate-500 block">Random Forest / Linear Reg</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Insufficient Data</span>
              <span className="text-lg font-black text-slate-600">
                {prediction_summary.insufficient_data_count} Products
              </span>
              <span className="text-[10px] text-slate-500 block">Accumulating history</span>
            </div>
          </div>
        </div>

        {/* Section 4: Automated Recommendations for SME Retailer */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Actionable Operational Recommendations</span>
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
