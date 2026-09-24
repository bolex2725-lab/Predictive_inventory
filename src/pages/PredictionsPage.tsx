import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { Product, StagedPredictionResult } from '../types';
import {
  BrainCircuit,
  Play,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Search,
  RefreshCw,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface PredictionsPageProps {
  initialProductId?: string;
  onNavigateToProducts: (productId: string) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  initialProductId,
  onNavigateToProducts,
}) => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Interactive evaluation state
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<StagedPredictionResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getProducts();
      setProducts(data);

      if (initialProductId) {
        handleInspectPrediction(initialProductId);
      }
    } catch (err: any) {
      showToast('Error Loading Predictions', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [initialProductId]);

  const handleInspectPrediction = async (productId: string) => {
    try {
      setEvaluatingId(productId);
      const result = await ApiClient.getProductPrediction(productId);
      setSelectedResult(result);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showToast('Failed Loading Prediction Details', err.message, 'error');
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleRunStagedEvaluation = async (productId: string, productName: string) => {
    try {
      setEvaluatingId(productId);
      const response = await ApiClient.trainModel(productId);
      setSelectedResult(response.result);
      setIsDetailModalOpen(true);
      showToast(
        'Staged Evaluation Completed',
        `Evaluated candidates for ${productName}. Active method: ${response.result.prediction_method}`,
        'success'
      );
      // Refresh list to update cached badges
      const updatedProds = await ApiClient.getProducts();
      setProducts(updatedProds);
    } catch (err: any) {
      showToast('Evaluation Error', err.message, 'error');
    } finally {
      setEvaluatingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesMethod =
      methodFilter === 'ALL' || p.prediction_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner explaining the Staged Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Core Research Methodology
              </span>
              <span className="text-xs text-slate-300">• Staged Prediction Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
              Staged Prediction Strategy &amp; Model Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Low-data products strictly employ a transparent <strong>Average Daily Demand (ADD)</strong> baseline.
              Upon reaching <strong>&ge;90 historical days &amp; &ge;60 sales</strong>, the system triggers chronological
              ML candidate training (Linear Regression vs Random Forest) and only switches if ML demonstrates
              at least a <strong>10% MAE improvement</strong> over the baseline.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/10 text-xs">
            <Layers className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Product-Level Transition</p>
              <p className="text-[11px] text-emerald-200">
                Each product series transitions independently based on empirical readiness.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Stepper */}
        <div className="mt-6 pt-5 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 1</span>
            <p className="font-semibold text-white mt-0.5">Data Readiness Check</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Verifies &ge;90 days &amp; &ge;60 sales transactions without data leakage.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 2 (Low Data)</span>
            <p className="font-semibold text-white mt-0.5">Rule-Based Baseline</p>
            <p className="text-[11px] text-slate-400 mt-1">
              ADD + Safety Stock: Transparent, immediate, zero cold-start failure risk.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-teal-400 uppercase">Step 3 (Data Ready)</span>
            <p className="font-semibold text-white mt-0.5">Train ML Candidates</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Trains Linear Regression &amp; Random Forest with lag/rolling features.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 4 (Decision)</span>
            <p className="font-semibold text-white mt-0.5">Staged Comparison &amp; ROP</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Requires &ge;10% MAE gain. Calculates final ROP &amp; recommended order.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products to inspect predictions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Active Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Methods</option>
            <option value="RULE_BASED">RULE_BASED</option>
            <option value="RANDOM_FOREST">RANDOM_FOREST</option>
            <option value="LINEAR_REGRESSION">LINEAR_REGRESSION</option>
            <option value="INSUFFICIENT_DATA">INSUFFICIENT_DATA</option>
          </select>
        </div>
      </div>

      {/* Products & Staged Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading prediction metrics...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Matching Products</p>
            <p className="text-xs text-slate-500 mt-1">Adjust search or filter parameters.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isEvaluating = evaluatingId === p.id;

            let methodBadge = (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                RULE_BASED (ADD)
              </span>
            );
            if (p.prediction_method === 'RANDOM_FOREST') {
              methodBadge = (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  RANDOM_FOREST (ML)
                </span>
              );
            } else if (p.prediction_method === 'LINEAR_REGRESSION') {
              methodBadge = (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                  LINEAR_REGRESSION (ML)
                </span>
              );
            }

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                    </div>
                    {methodBadge}
                  </div>

                  {/* Decision Parameters Bar */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        Daily Demand
                      </span>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        ~{p.forecast_demand ? p.forecast_demand.toFixed(1) : '2.0'} {p.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">ROP</span>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        {p.reorder_point ?? p.reorder_level} {p.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-emerald-700">Order Qty</span>
                      <p className="text-xs font-black text-emerald-800 mt-0.5">
                        +{p.recommended_reorder_quantity || 0}
                      </p>
                    </div>
                  </div>

                  {/* Method reason */}
                  <p className="text-[11px] text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {p.prediction_reason ||
                      'Average Daily Demand rule-based baseline active.'}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectPrediction(p.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Inspect Metrics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRunStagedEvaluation(p.id, p.name)}
                    disabled={isEvaluating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                    <span>{isEvaluating ? 'Evaluating...' : 'Train & Compare'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Model Detail & Comparison Modal */}
      {selectedResult && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Staged ML Evaluation & Replenishment Decision"
          subtitle={`Model evaluation on chronological holdout for product ${selectedResult.product_id}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Step 1: Data Readiness Status Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Stage 1: Data Readiness Evaluation
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedResult.data_readiness.ready
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedResult.data_readiness.ready ? 'DATA READY (>=90 Days)' : 'LOW DATA (<90 Days)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">History Span</span>
                  <span className="font-bold text-slate-900">
                    {selectedResult.data_readiness.history_days} Days
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    (Req: &ge;{selectedResult.data_readiness.required_days})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Sales Records</span>
                  <span className="font-bold text-slate-900">
                    {selectedResult.data_readiness.sales_records} Records
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    (Req: &ge;{selectedResult.data_readiness.required_records})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Daily Series</span>
                  <span className="font-bold text-slate-900">
                    {selectedResult.data_readiness.daily_series_length} Days
                  </span>
                  <span className="text-[9px] text-slate-500 block">Aggregated</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Split Strategy</span>
                  <span className="font-bold text-slate-900">Chronological</span>
                  <span className="text-[9px] text-slate-500 block">Holdout (No Leakage)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {selectedResult.data_readiness.reason}
              </p>
            </div>

            {/* Step 2 & 3: Model Comparison Table (Rule-Based vs Linear Regression vs Random Forest) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Stage 2: Model Comparison &amp; Performance Metrics
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Target: &ge;10% MAE improvement over baseline
                </span>
              </div>

              {selectedResult.evaluation ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Candidate Model</th>
                        <th className="py-2.5 px-3">MAE (Mean Absolute Error)</th>
                        <th className="py-2.5 px-3">RMSE (Root Mean Sq. Error)</th>
                        <th className="py-2.5 px-3">R² Score</th>
                        <th className="py-2.5 px-3">Improvement vs Baseline</th>
                        <th className="py-2.5 px-3">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Rule-Based Baseline */}
                      <tr
                        className={
                          selectedResult.prediction_method === 'RULE_BASED'
                            ? 'bg-amber-50/70 font-semibold'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900">Rule-Based Baseline (ADD)</span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Average Daily Demand
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {selectedResult.evaluation.rule_based.mae.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {selectedResult.evaluation.rule_based.rmse.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {selectedResult.evaluation.rule_based.r2.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">Baseline (0%)</td>
                        <td className="py-2.5 px-3">
                          {selectedResult.prediction_method === 'RULE_BASED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                              SELECTED
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Surpassed</span>
                          )}
                        </td>
                      </tr>

                      {/* Linear Regression */}
                      {selectedResult.evaluation.linear_regression && (
                        <tr
                          className={
                            selectedResult.prediction_method === 'LINEAR_REGRESSION'
                              ? 'bg-teal-50/70 font-semibold'
                              : 'hover:bg-slate-50'
                          }
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900">Linear Regression</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              Multi-feature OLS with calendar lags
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {selectedResult.evaluation.linear_regression.mae.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {selectedResult.evaluation.linear_regression.rmse.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {selectedResult.evaluation.linear_regression.r2.toFixed(3)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-teal-700">
                            {(
                              ((selectedResult.evaluation.rule_based.mae -
                                selectedResult.evaluation.linear_regression.mae) /
                                selectedResult.evaluation.rule_based.mae) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="py-2.5 px-3">
                            {selectedResult.prediction_method === 'LINEAR_REGRESSION' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200 text-teal-900">
                                SELECTED
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Evaluated</span>
                            )}
                          </td>
                        </tr>
                      )}

                      {/* Random Forest Regressor */}
                      {selectedResult.evaluation.random_forest && (
                        <tr
                          className={
                            selectedResult.prediction_method === 'RANDOM_FOREST'
                              ? 'bg-emerald-50/70 font-semibold'
                              : 'hover:bg-slate-50'
                          }
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900">Random Forest Regressor</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              Non-linear ensemble decision trees
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {selectedResult.evaluation.random_forest.mae.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {selectedResult.evaluation.random_forest.rmse.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {selectedResult.evaluation.random_forest.r2.toFixed(3)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-800">
                            {(
                              ((selectedResult.evaluation.rule_based.mae -
                                selectedResult.evaluation.random_forest.mae) /
                                selectedResult.evaluation.rule_based.mae) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="py-2.5 px-3">
                            {selectedResult.prediction_method === 'RANDOM_FOREST' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                                SELECTED (WINNER)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Evaluated</span>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-amber-50 text-xs text-amber-900">
                  <p className="font-semibold">Baseline Holdout Mode</p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Historical transactions have not yet reached the 90-day readiness threshold.
                    The transparent Average Daily Demand rule-based baseline is currently serving predictions.
                  </p>
                </div>
              )}
            </div>

            {/* Feature Importance Breakdown (if Random Forest) */}
            {selectedResult.feature_importances && selectedResult.feature_importances.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Feature Importance Analysis (Random Forest Ensemble)
                </h4>
                <div className="space-y-2">
                  {selectedResult.feature_importances.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-36 text-slate-600 truncate">{f.feature}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${Math.round(f.importance * 100)}%` }}
                          className={`h-full ${
                            i === 0 ? 'bg-emerald-600' : 'bg-emerald-500/70'
                          }`}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-[11px] text-slate-600">
                        {(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reorder Decision Support Summary Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Calculated Replenishment Parameters
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Model: {selectedResult.model_name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-300 block">Forecast Daily Demand</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {selectedResult.forecast_daily_demand.toFixed(2)} units/day
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-300 block">Lead Time Demand (LTD)</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {selectedResult.lead_time_demand.toFixed(1)} units
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/10">
                  <span className="text-[10px] text-slate-300 block">Safety Stock (SS)</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {selectedResult.safety_stock.toFixed(1)} units
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                  <span className="text-[10px] text-emerald-300 block">Reorder Point (ROP)</span>
                  <span className="text-sm font-black text-emerald-300 mt-0.5 block">
                    {selectedResult.reorder_point} units
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Current Stock: </span>
                  <span className="font-bold text-white">{selectedResult.current_stock} units</span>
                  <span className="ml-2 text-slate-400">Status: </span>
                  <span className="font-bold text-amber-300">{selectedResult.stock_status}</span>
                </div>
                <div>
                  <span className="text-slate-400">Recommended Order: </span>
                  <span className="font-black text-emerald-400">
                    +{selectedResult.recommended_reorder_quantity} units
                  </span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
