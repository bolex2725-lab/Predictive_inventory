import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { AcademicBenchmarkData } from '../types';
import {
  GraduationCap,
  Award,
  BarChart3,
  Layers,
  Info,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export const EvaluationPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AcademicBenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getAcademicEvaluation();
        setData(res);
      } catch (err: any) {
        showToast('Error Loading Academic Benchmarks', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmark();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading academic benchmark dataset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Defense Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Academic Research &amp; Evaluation
              </span>
              <span className="text-xs text-slate-300">• Section 34 &amp; 35 Results</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
              &quot;Recommendation of a Predictive Inventory System for Nigerian Retail SMEs&quot;
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Empirical evaluation comparing the Rule-Based Baseline against Linear Regression and Random Forest
              across 420 product series evaluated over a 90-day chronological holdout period.
            </p>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Dataset Size</span>
            <span className="font-extrabold text-base text-white">420 Series • 728 Days</span>
            <span className="text-[10px] text-slate-300 block">638 Train / 90 Holdout</span>
          </div>
        </div>
      </div>

      {/* Model Performance Comparison Table (Table from Section 34) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Overall Model Performance Comparison</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Holdout evaluation on unseen future test period (MAE, RMSE, R²)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Random Forest Selected as Best Model (28.1% Gain)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Prediction Model</th>
                <th className="py-3 px-4">MAE</th>
                <th className="py-3 px-4">RMSE</th>
                <th className="py-3 px-4">R² Score</th>
                <th className="py-3 px-4">Improvement Over Baseline</th>
                <th className="py-3 px-4">Methodological Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.model_comparison.map((item, idx) => {
                const isWinner = item.method.includes('Random Forest');
                const isBaseline = item.method.includes('Baseline');

                return (
                  <tr
                    key={idx}
                    className={
                      isWinner
                        ? 'bg-emerald-50/60 font-semibold'
                        : isBaseline
                        ? 'bg-amber-50/40'
                        : 'hover:bg-slate-50'
                    }
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{item.method}</span>
                      <span className="text-[10px] text-slate-500 block font-normal">
                        {item.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.mae.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{item.rmse.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{item.r2.toFixed(3)}</td>
                    <td className="py-3 px-4">
                      {isBaseline ? (
                        <span className="text-slate-400 font-medium">Baseline (0%)</span>
                      ) : (
                        <span
                          className={`font-black ${
                            isWinner ? 'text-emerald-700 font-extrabold' : 'text-teal-700'
                          }`}
                        >
                          +{((3.49 - item.mae) / 3.49 * 100).toFixed(1)}% MAE Reduction
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isWinner ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                          Production ML Winner
                        </span>
                      ) : isBaseline ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                          Low-Data Fallback
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-200 text-teal-900">
                          Parametric Candidate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: Category Breakdown & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Category-Level Performance &amp; Dynamics</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Noticeable variance in improvement percentage across product classes
          </p>

          <div className="space-y-3">
            {data.category_comparison.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{cat.category}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      +{cat.improvement_percent}% Gain
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Baseline MAE: </span>
                    <span className="font-semibold text-slate-700">{cat.rule_based_mae}</span>
                    <span className="text-slate-400 mx-1">&rarr;</span>
                    <span className="text-slate-400">ML MAE: </span>
                    <span className="font-bold text-emerald-700">{cat.ml_mae}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5">
                  <span className="font-medium text-slate-600">Sample Nigerian Goods: </span>
                  {cat.sample_products}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Random Forest Feature Importance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Feature Importance Analysis (Random Forest)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Relative contribution of engineered time-series indicators to predictions
            </p>

            <div className="space-y-2.5">
              {data.feature_importance.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">{f.feature}</span>
                      {f.dominant && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-sm bg-indigo-100 text-indigo-800">
                          Dominant
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-600 font-bold">
                      {(f.importance * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${Math.round(f.importance * 100)}%` }}
                      className={`h-full ${
                        f.dominant ? 'bg-indigo-600' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{f.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Methodology & Research Disclaimer (Section 45) */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Academic Disclaimer &amp; Methodology Boundary</p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            {data.academic_disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
