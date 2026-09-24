import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Bell,
  LogOut,
  Building2,
  ChevronDown,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { ApiClient } from '../api/client';
import { useToast } from './Toast';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate, activeTab }) => {
  const { user, business, logout, switchDemoTenant } = useAuth();
  const { showToast } = useToast();
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await ApiClient.resetDemo();
      showToast('Environment Reset', 'Demonstration database restored to pristine baseline state.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err: any) {
      showToast('Reset Failed', err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleSwitchTenant = async (tenant: 'lagos' | 'kano') => {
    setTenantDropdownOpen(false);
    try {
      await switchDemoTenant(tenant);
      showToast(
        'Tenant Switched',
        tenant === 'lagos'
          ? 'Switched to Oluwaseun & Sons Provisions Ltd (Lagos)'
          : 'Switched to Kano Household Supplies (Kano). Verified strict data isolation.',
        'info'
      );
      window.location.reload();
    } catch (err: any) {
      showToast('Switch Error', err.message, 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  Stock<span className="text-emerald-600">Predict</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SME Nigeria
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Academic Predictive Inventory & Replenishment
              </p>
            </div>
          </div>
        </div>

        {/* Right: Tenant Switcher, Quick Reset, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-Tenant Switcher */}
          <div className="relative">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
            >
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-left hidden md:block max-w-[170px] truncate">
                <span className="font-semibold block truncate">
                  {business?.name || 'Retail Business'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {business?.id === 'biz_kano_supplies_002' ? 'Kano Branch' : 'Lagos SME'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Multi-Tenant Isolation Demo
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select a business to verify data boundary isolation:
                  </p>
                </div>

                <button
                  onClick={() => handleSwitchTenant('lagos')}
                  className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition-colors ${
                    business?.id !== 'biz_kano_supplies_002' ? 'bg-emerald-50/70' : ''
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Oluwaseun & Sons Provisions
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Lagos • Full product catalog & ML history
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleSwitchTenant('kano')}
                  className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition-colors ${
                    business?.id === 'biz_kano_supplies_002' ? 'bg-emerald-50/70' : ''
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Kano Household Supplies
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Kano • Isolated tenant database
                    </p>
                  </div>
                </button>

                <div className="px-3 pt-2 border-t border-slate-100 mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cross-tenant query filtering enforced at DB level</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Reset Button */}
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            title="Reset demonstration data to baseline"
            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden xl:inline">Reset Demo</span>
          </button>

          {/* WhatsApp Alerts Quick Nav */}
          <button
            onClick={() => onNavigate('notifications')}
            className={`relative p-2 rounded-xl border transition-colors ${
              activeTab === 'notifications'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
            title="WhatsApp Reorder Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'Owner'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Retailer'}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
