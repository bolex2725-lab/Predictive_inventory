import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BrainCircuit,
  FileSpreadsheet,
  MessageSquare,
  GraduationCap,
  Settings,
  AlertCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  attentionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isOpen,
  onClose,
  attentionCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: attentionCount > 0 ? `${attentionCount} alerts` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: Package,
    },
    {
      id: 'sales',
      label: 'Sales Recording',
      icon: ShoppingCart,
    },
    {
      id: 'restocking',
      label: 'Restocking',
      icon: Truck,
    },
    {
      id: 'predictions',
      label: 'Predictions & ML',
      icon: BrainCircuit,
      badge: 'Staged ML',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'reports',
      label: 'Weekly Reports',
      icon: FileSpreadsheet,
    },
    {
      id: 'notifications',
      label: 'WhatsApp Alerts',
      icon: MessageSquare,
      badge: 'Provider',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'evaluation',
      label: 'Academic Benchmark',
      icon: GraduationCap,
      badge: 'Defense',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'settings',
      label: 'Settings & Tenant',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 lg:hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Staged Prediction Methodology Quick Summary */}
          <div className="mt-8 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Staged Strategy Core</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              • Low-Data (&lt;90 days): Transparent Average Daily Demand (ADD)
              <br />• Data-Ready (&ge;90 days): Linear Regression vs Random Forest evaluated on chronological holdout.
            </p>
          </div>
        </div>

        {/* Bottom copyright & academic badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-700">Nigerian Retail SME Engine</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Lagos Time (WAT UTC+1) • Active
          </p>
        </div>
      </aside>
    </>
  );
};
