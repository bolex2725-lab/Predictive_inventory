import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiClient } from '../api/client';
import {
  Settings,
  Building2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Save,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { business, user, switchDemoTenant } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // ML Parameters
  const [minDays, setMinDays] = useState(90);
  const [minRecords, setMinRecords] = useState(60);
  const [minImprovement, setMinImprovement] = useState(10);
  const [provider, setProvider] = useState<'mock' | 'cloud_api'>('mock');

  useEffect(() => {
    if (business) {
      setBusinessName(business.name);
      setPhone(business.phone || '');
      setWhatsappNumber(business.whatsapp_number || '');
      setMinDays(business.settings?.minimum_history_days ?? 90);
      setMinRecords(business.settings?.minimum_sales_records ?? 60);
      setMinImprovement(business.settings?.minimum_ml_improvement_percent ?? 10);
      setProvider(business.settings?.whatsapp_provider ?? 'mock');
    }
  }, [business]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await ApiClient.updateBusiness({
        name: businessName,
        phone,
        whatsapp_number: whatsappNumber,
        settings: {
          minimum_history_days: Number(minDays),
          minimum_sales_records: Number(minRecords),
          minimum_ml_improvement_percent: Number(minImprovement),
          whatsapp_provider: provider,
        },
      });
      showToast('Settings Saved', 'Business and predictive engine parameters updated.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset entire demonstration data across all businesses to default baseline?')) return;
    try {
      setResetting(true);
      await ApiClient.resetDemo();
      showToast('Environment Reset', 'Data restored to pristine seed state.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err: any) {
      showToast('Reset Failed', err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Business &amp; System Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage business identity, staged ML threshold parameters, and multi-tenant isolation.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Business Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Business Profile &amp; Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Alert Number
              </label>
              <input
                type="text"
                required
                placeholder="+2348031234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Timezone &amp; Currency</label>
              <input
                type="text"
                disabled
                value="Africa/Lagos (WAT UTC+1) • NGN (₦)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Staged Prediction ML Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Staged Prediction Strategy Thresholds
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            These parameters govern when a product transitions from the Rule-Based baseline (ADD) to
            machine learning (Linear Regression or Random Forest).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Min. History Required (Days)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={minDays}
                onChange={(e) => setMinDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 90 days</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Min. Sales Transactions
              </label>
              <input
                type="number"
                min="20"
                max="500"
                value={minRecords}
                onChange={(e) => setMinRecords(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 60 records</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Min. ML Improvement Gain (%)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={minImprovement}
                onChange={(e) => setMinImprovement(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 10.0% MAE reduction</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Provider Abstraction Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">WhatsApp Provider Mode</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                provider === 'mock'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="whatsapp_provider"
                checked={provider === 'mock'}
                onChange={() => setProvider('mock')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="font-bold text-slate-900">Mock Provider (Default)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Stores notifications safely in audit table with zero API key or billing dependency.
                </p>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                provider === 'cloud_api'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="whatsapp_provider"
                checked={provider === 'cloud_api'}
                onChange={() => setProvider('cloud_api')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="font-bold text-slate-900">WhatsApp Cloud API (Meta)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Production integration via Meta Graph API using environment variables.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Multi-Tenant Security & Isolation Notice */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Multi-Tenant Data Isolation Active
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tenant boundaries are strictly validated on every database query via authenticated{' '}
            <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 font-mono text-[11px]">
              business_id
            </code>
            . Cross-tenant querying, record leakage, or IDOR tampering is rejected with 403 Forbidden.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => switchDemoTenant('lagos')}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-medium"
            >
              Switch to Lagos Tenant
            </button>
            <button
              type="button"
              onClick={() => switchDemoTenant('kano')}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-medium"
            >
              Switch to Kano Tenant
            </button>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={resetting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Database</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
