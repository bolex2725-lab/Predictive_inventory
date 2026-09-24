/**
 * Main Application Root
 * Predictive Inventory System for Nigerian Retail SMEs
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { SalesPage } from './pages/SalesPage';
import { RestockingPage } from './pages/RestockingPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SettingsPage } from './pages/SettingsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [targetedProductId, setTargetedProductId] = useState<string | undefined>(undefined);

  // If initial auth check is in flight
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-300">
          Initializing StockPredict Engine...
        </p>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <AuthPage />;
  }

  const handleNavigate = (tab: string, productId?: string) => {
    setTargetedProductId(productId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRecordSale = (productId?: string) => {
    setTargetedProductId(productId);
    setActiveTab('sales');
  };

  const handleOpenRecordRestock = (productId?: string) => {
    setTargetedProductId(productId);
    setActiveTab('restocking');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Fixed Header */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />

      <div className="flex-1 flex">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={(tab) => handleNavigate(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardPage
                onNavigate={handleNavigate}
                onOpenRecordSale={handleOpenRecordSale}
                onOpenRecordRestock={handleOpenRecordRestock}
              />
            )}

            {activeTab === 'products' && (
              <ProductsPage
                onOpenRecordSale={handleOpenRecordSale}
                onOpenRecordRestock={handleOpenRecordRestock}
                onNavigateToPredictions={(prodId) => handleNavigate('predictions', prodId)}
                initialSelectedProductId={targetedProductId}
              />
            )}

            {activeTab === 'sales' && (
              <SalesPage initialProductId={targetedProductId} />
            )}

            {activeTab === 'restocking' && (
              <RestockingPage initialProductId={targetedProductId} />
            )}

            {activeTab === 'predictions' && (
              <PredictionsPage
                initialProductId={targetedProductId}
                onNavigateToProducts={(prodId) => handleNavigate('products', prodId)}
              />
            )}

            {activeTab === 'reports' && <ReportsPage />}

            {activeTab === 'notifications' && <NotificationsPage />}

            {activeTab === 'evaluation' && <EvaluationPage />}

            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
