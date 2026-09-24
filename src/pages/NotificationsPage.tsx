import React, { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import { Notification } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export const NotificationsPage: React.FC = () => {
  const { business } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Custom test message form
  const [recipient, setRecipient] = useState(business?.whatsapp_number || '+2348031234567');
  const [testMessage, setTestMessage] = useState(
    `🔔 *StockPredict Urgent Reorder Alert*\nBusiness: ${business?.name || 'Retail SME'}\nProduct: Golden Penny Semovita 2kg\nCurrent Stock: 4 units\nReorder Point: 12 units\nRecommended Order: +25 units`
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      showToast('Error Loading Notifications', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (business?.whatsapp_number) {
      setRecipient(business.whatsapp_number);
    }
  }, [business]);

  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingTest(true);
      const res = await ApiClient.sendTestNotification(recipient, testMessage);
      showToast(
        'WhatsApp Dispatched',
        `Notification sent via ${res.provider} to ${res.recipient}`,
        'success'
      );
      fetchNotifications();
    } catch (err: any) {
      showToast('Dispatch Failed', err.message, 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      setRetryingId(id);
      await ApiClient.retryNotification(id);
      showToast('Notification Retried', 'Attempted re-delivery to WhatsApp provider.', 'info');
      fetchNotifications();
    } catch (err: any) {
      showToast('Retry Failed', err.message, 'error');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Provider Abstraction
            </span>
            <span className="text-xs text-emerald-200">• Multi-Provider Ready</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
            WhatsApp Reorder Alerts &amp; Outbound Logs
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mt-1 leading-relaxed">
            Automated alerts dispatched directly to business owners and procurement leads when stock 
            drops below calculated reorder points. Pluggable between Mock and Meta WhatsApp Cloud API.
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">Active Mode</span>
          <span className="font-extrabold text-sm text-white">Mock Provider (Local Demo)</span>
          <span className="text-[10px] text-emerald-200 block">Zero Cloud Billing Costs</span>
        </div>
      </div>

      {/* Row: Interactive Dispatch & Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Dispatch Test Reorder Notification</span>
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">Nigeria (+234)</span>
            </div>

            <form onSubmit={handleSendTestNotification} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+2348031234567"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Body (Markdown WhatsApp Syntax)
                </label>
                <textarea
                  rows={6}
                  required
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${sendingTest ? 'animate-spin' : ''}`} />
                <span>{sendingTest ? 'Sending via WhatsApp...' : 'Send WhatsApp Alert'}</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>24-hour notification cooldown prevents spamming during frequent daily sales.</span>
          </div>
        </div>

        {/* WhatsApp Mobile Simulation Card */}
        <div className="bg-slate-900 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center">
          <div className="w-full max-w-xs bg-slate-950 rounded-3xl p-3 border-4 border-slate-800 shadow-2xl overflow-hidden">
            {/* Phone Top Speaker & Camera Notch */}
            <div className="flex items-center justify-between px-3 py-1 mb-2">
              <span className="text-[10px] text-slate-400 font-bold">9:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full" />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="bg-emerald-800 text-white p-2.5 rounded-t-xl flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                SP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">StockPredict Bot</p>
                <p className="text-[9px] text-emerald-200">Online • Reorder Alert Service</p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="bg-[#0b141a] p-3 min-h-[220px] rounded-b-xl flex flex-col justify-end text-xs space-y-2">
              <div className="bg-[#202c33] text-slate-200 p-2.5 rounded-lg rounded-tl-none max-w-[90%] shadow-md border border-slate-700/50">
                <p className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                  {testMessage}
                </p>
                <span className="text-[9px] text-slate-400 block text-right mt-1">
                  Just now • Delivered ✓✓
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-3">
            Simulated smartphone presentation for retail owner
          </span>
        </div>
      </div>

      {/* Outbound Notification History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Notification Dispatch History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete audit trail of automated inventory alerts
            </p>
          </div>
          <button
            onClick={fetchNotifications}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading notification logs...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Notifications Sent Yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Alerts will appear automatically when products trigger reorder points.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((n) => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                      SENT
                    </span>
                  );
                  if (n.status === 'FAILED') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                        FAILED
                      </span>
                    );
                  } else if (n.status === 'PENDING') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                        PENDING
                      </span>
                    );
                  }

                  return (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString('en-GB')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {n.recipient}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {n.notification_type}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={n.message}>
                        {n.message.split('\n')[0]}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {n.provider}
                      </td>
                      <td className="py-3.5 px-4">{statusBadge}</td>
                      <td className="py-3.5 px-4 text-right">
                        {n.status === 'FAILED' ? (
                          <button
                            onClick={() => handleRetry(n.id)}
                            disabled={retryingId === n.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-2xs transition-colors flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingId === n.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Delivered</span>
                        )}
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
