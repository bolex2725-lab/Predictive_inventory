import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, ShieldCheck, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('oluwaseun@provisions.ng');
  const [loginPassword, setLoginPassword] = useState('Password123!');

  // Register form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(loginEmail, loginPassword);
      showToast('Signed In', 'Welcome back to StockPredict.', 'success');
    } catch (err: any) {
      showToast('Login Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        business_name: businessName,
        whatsapp_number: whatsappNumber,
      });
      showToast('Account Created', 'Welcome to StockPredict Predictive Inventory.', 'success');
    } catch (err: any) {
      showToast('Registration Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (type: 'lagos' | 'kano') => {
    try {
      setLoading(true);
      if (type === 'lagos') {
        await login('oluwaseun@provisions.ng', 'Password123!');
      } else {
        await login('aminu@kanosupplies.ng', 'Password123!');
      }
      showToast('Demo Access Granted', 'Signed in to evaluation tenant.', 'success');
    } catch (err: any) {
      showToast('Demo Login Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Stock<span className="text-emerald-400">Predict</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Predictive Inventory Management System for Nigerian Retail SMEs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          {/* Quick Demo Switcher Card */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Instant Academic Demo Access</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('lagos')}
                disabled={loading}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-left text-xs font-semibold text-slate-900 shadow-2xs transition-colors"
              >
                <span className="block font-bold text-emerald-800">Lagos SME</span>
                <span className="text-[10px] text-slate-500 font-normal">Oluwaseun &amp; Sons</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('kano')}
                disabled={loading}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-left text-xs font-semibold text-slate-900 shadow-2xs transition-colors"
              >
                <span className="block font-bold text-teal-800">Kano SME</span>
                <span className="text-[10px] text-slate-500 font-normal">Kano Supplies</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register SME
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Store'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alaba Supermarket Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emeka Okafor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="retailer@sme.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Alert Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+2348012345678"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Tenant...' : 'Register SME Account'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Strict Multi-Tenant Row-Level Security • Africa/Lagos WAT
        </p>
      </div>
    </div>
  );
};
