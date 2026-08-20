import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { InstallAppModal } from '../components/InstallAppModal';
import {
  Settings,
  LayoutDashboard,
  User,
  CreditCard,
  History,
  AlertTriangle,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Loader2,
  Smartphone,
  BookMarked,
  ShieldCheck,
  Calendar,
  DollarSign,
  Download,
} from 'lucide-react';

export const SettingsPage: React.FC<{ onNavigate: (tab: string) => void; onGoBack?: () => void }> = ({ onNavigate, onGoBack }) => {
  const { user, token, logout, updateProfile, refreshUser, isPro } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [region, setRegion] = useState(user?.region || 'UK');
  const [level, setLevel] = useState(user?.level || 'Beginner');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Billing Actions State
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [billingMessage, setBillingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const [txRes, detailsRes] = await Promise.all([
        fetch('/api/subscription/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/subscription/details', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (txRes.ok) {
        const data = await txRes.json();
        setUserTransactions(data.transactions || []);
      }
      if (detailsRes.ok) {
        await refreshUser();
      }
    } catch {
      // ignore fetch error
    }
  };

  useEffect(() => {
    refreshUser();
    fetchTransactions();
  }, [token]);

  // 48h Countdown Timer Calculation
  const [timeLeft48h, setTimeLeft48h] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    hasPayment: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
    hasPayment: false,
  });

  useEffect(() => {
    if (!user?.last_payment_date) {
      setTimeLeft48h({ hours: 0, minutes: 0, seconds: 0, isExpired: true, hasPayment: false });
      return;
    }

    const calculateCountdown = () => {
      const paymentTime = new Date(user.last_payment_date!).getTime();
      const expiresAt = paymentTime + 48 * 60 * 60 * 1000;
      const now = Date.now();
      const difference = expiresAt - now;

      if (difference <= 0) {
        setTimeLeft48h({ hours: 0, minutes: 0, seconds: 0, isExpired: true, hasPayment: true });
      } else {
        const totalSeconds = Math.floor(difference / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft48h({ hours, minutes, seconds, isExpired: false, hasPayment: true });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user?.last_payment_date]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const ok = await updateProfile({ name, region: region as any, level: level as any });
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token) return;
    if (!confirm('Are you sure you want to cancel your Pro subscription renewal? You will keep Pro access until your current billing period ends.')) {
      return;
    }

    setCancelling(true);
    setBillingMessage(null);

    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBillingMessage({ type: 'success', text: data.message || 'Subscription renewal cancelled successfully.' });
        await refreshUser();
      } else {
        setBillingMessage({ type: 'error', text: data.error || 'Failed to cancel subscription.' });
      }
    } catch (err: any) {
      setBillingMessage({ type: 'error', text: err.message || 'Connection error.' });
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!token) return;
    if (!confirm('Are you sure you want to request a full 48-hour guarantee refund? This will immediately cancel your Pro features and refund your payment to PayPal.')) {
      return;
    }

    setRefunding(true);
    setBillingMessage(null);

    try {
      const res = await fetch('/api/subscription/refund', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBillingMessage({ type: 'success', text: data.message || 'Refund successfully processed.' });
        await refreshUser();
        await fetchTransactions();
      } else {
        setBillingMessage({ type: 'error', text: data.error || 'Refund request rejected.' });
        await fetchTransactions();
      }
    } catch (err: any) {
      setBillingMessage({ type: 'error', text: err.message || 'Connection error.' });
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header with App Install CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Dashboard &amp; Paramètres</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your entomology profile, billing, history, and smartphone companion app.
          </p>
        </div>

        <button
          onClick={() => setShowInstallModal(true)}
          className="self-start sm:self-auto min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#2e86ff] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Smartphone className="w-4 h-4" />
          <span>Install on Smartphone</span>
        </button>
      </div>

      {/* Quick Overview Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-[#1c1c34] border border-[#2e2e50] p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 font-medium">Account Plan</p>
          <p className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
            {isPro ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 uppercase">PRO ({user?.subscription_plan || 'Active'})</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="text-slate-300">FREE PLAN</span>
              </>
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-[#1c1c34] border border-[#2e2e50] p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 font-medium">Total Scans</p>
          <p className="text-sm sm:text-base font-extrabold text-[#2e86ff]">
            {user?.scans_count || 0} specimens
          </p>
        </div>

        <div className="rounded-2xl bg-[#1c1c34] border border-[#2e2e50] p-3.5 space-y-1">
          <p className="text-[11px] text-slate-400 font-medium">Species Logged</p>
          <p className="text-sm sm:text-base font-extrabold text-[#10b981]">
            {user?.species_found || 0} in journal
          </p>
        </div>

        <div
          onClick={() => onNavigate('journal')}
          className="rounded-2xl bg-[#242448] hover:bg-[#2e2e58] border border-[#3b3b6e] p-3.5 space-y-1 cursor-pointer transition-colors"
        >
          <p className="text-[11px] text-purple-300 font-medium flex items-center justify-between">
            <span>Journal</span>
            <BookMarked className="w-3.5 h-3.5 text-purple-300" />
          </p>
          <p className="text-xs sm:text-sm font-bold text-white underline">
            View All Scans &rarr;
          </p>
        </div>
      </div>

      {/* BILLING, PAYMENTS & 48-HOUR GUARANTEE CARD */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-4 sm:p-6 md:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-[#2a2a4a] pb-4">
          <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#2e86ff] shrink-0" />
            <span>Subscription &amp; Payment Statement</span>
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#141424] border border-slate-700 text-slate-300 font-mono">
            PayPal Secured
          </span>
        </div>

        {billingMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              billingMessage.type === 'success'
                ? 'bg-emerald-950/70 border-[#10b981] text-emerald-300'
                : 'bg-rose-950/70 border-[#e94560] text-rose-300'
            }`}
          >
            {billingMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{billingMessage.text}</span>
          </div>
        )}

        {/* Subscription & Access Overview */}
        {isPro && user?.last_payment_date && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#141424] border border-slate-700/80">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Billing Type &amp; Plan</p>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                {user.subscription_plan === 'annual'
                  ? 'PayPal Annual Pass ($29.99 / year)'
                  : 'PayPal Recurring Subscription ($4.99 / month)'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Subscription Status</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                {user.subscription_status === 'active'
                  ? user.subscription_plan === 'annual'
                    ? 'Active (1-Year Term)'
                    : 'Active (Auto-renews via PayPal)'
                  : user.subscription_status === 'cancelled'
                  ? 'Auto-Renewal Cancelled'
                  : user.subscription_status === 'refunded'
                  ? 'Refunded & Closed'
                  : 'Term Active'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Next Payment / Expiration</p>
              <p className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">
                {user.subscription_status === 'active' && user.subscription_plan !== 'annual' ? (
                  user.subscription_next_payment_date ? (
                    <span className="text-emerald-300">
                      {new Date(user.subscription_next_payment_date).toLocaleDateString()} ($4.99 USD)
                    </span>
                  ) : (
                    <span>Next monthly cycle</span>
                  )
                ) : user.subscription_status === 'cancelled' ? (
                  <span className="text-amber-300">
                    No future charges (Access until{' '}
                    {user.subscription_next_payment_date
                      ? new Date(user.subscription_next_payment_date).toLocaleDateString()
                      : new Date(new Date(user.last_payment_date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    )
                  </span>
                ) : user.subscription_plan === 'annual' ? (
                  <span>
                    Valid until{' '}
                    {new Date(new Date(user.last_payment_date).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Term Closed</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Payment History Statement Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Transaction History &amp; Receipts</span>
          </h4>

          {userTransactions.length > 0 ? (
            <div className="rounded-xl bg-[#141424] border border-slate-700/80 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#10101c] text-[11px] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Plan / Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">PayPal Details</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {userTransactions.map((tx: any) => (
                    <tr key={tx._id}>
                      <td className="p-3 font-mono text-slate-300">
                        {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-medium text-white">
                        The Insect Guide Pro ({tx.plan === 'annual' ? 'Annual Pass' : 'Monthly Access'})
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        ${tx.amount} {tx.currency || 'USD'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 space-y-0.5">
                        {tx.capture_id && <div>Capture: <span className="text-slate-300">{tx.capture_id}</span></div>}
                        {tx.refund_id && <div>Refund ID: <span className="text-rose-300 font-bold">{tx.refund_id}</span></div>}
                      </td>
                      <td className="p-3">
                        {tx.status === 'REFUNDED' || tx.refund_status === 'refund_succeeded' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                            Refunded (${tx.refunded_amount || tx.amount})
                          </span>
                        ) : tx.refund_status === 'refund_pending' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block">
                            Refund Pending
                          </span>
                        ) : tx.refund_status === 'refund_failed' ? (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                              Refund Failed
                            </span>
                            {tx.refund_error && (
                              <p className="text-[10px] text-rose-300/90 max-w-xs break-words">
                                {tx.refund_error}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block">
                            Completed &amp; Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : user?.last_payment_date ? (
            <div className="rounded-xl bg-[#141424] border border-slate-700/80 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#10101c] text-[11px] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Plan / Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 font-mono text-slate-300">
                      {new Date(user.last_payment_date).toLocaleDateString()} {new Date(user.last_payment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-medium text-white">
                      The Insect Guide Pro ({user.subscription_plan === 'annual' ? 'Annual Pass' : 'Monthly Access'})
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {user.subscription_plan === 'annual' ? '$29.99' : '$4.99'} USD
                    </td>
                    <td className="p-3">
                      {user.subscription_status === 'refunded' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Refunded
                        </span>
                      ) : user.subscription_status === 'cancelled' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Cancelled (Term Active)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Completed &amp; Active
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#141424] border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">No active billing transactions logged for this account yet.</p>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-4 py-2 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-bold text-xs transition-colors"
              >
                Choose a Pro Plan &rarr;
              </button>
            </div>
          )}
        </div>

        {/* 48-HOUR MONEY BACK GUARANTEE & LIVE COUNTDOWN */}
        {user?.last_payment_date && user.subscription_status !== 'refunded' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#181830] to-[#1e1e3c] border border-[#3b3b64] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>48-Hour Money-Back Guarantee</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Full 100% refund available within 48 hours of initial transaction.
                </p>
              </div>

              {/* Countdown badge */}
              {!timeLeft48h.isExpired && !user.refund_requested ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shrink-0">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {String(timeLeft48h.hours).padStart(2, '0')}h {String(timeLeft48h.minutes).padStart(2, '0')}m {String(timeLeft48h.seconds).padStart(2, '0')}s remaining
                  </span>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium shrink-0">
                  Guarantee Window Expired
                </div>
              )}
            </div>

            {/* Refund Action / Expired notice */}
            {!timeLeft48h.isExpired && !user.refund_requested ? (
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-700/60">
                <p className="text-[11px] text-slate-300">
                  Dissatisfied with your experience? You can request an automated refund now.
                </p>
                <button
                  onClick={handleRequestRefund}
                  disabled={refunding}
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {refunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Claim 48h Refund</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#121220] text-[11px] text-slate-400">
                {user.refund_requested
                  ? 'A 48-hour refund has already been claimed and credited to your PayPal account.'
                  : 'The 48-hour refund period has concluded. Subscriptions can be cancelled at any time to prevent future billing cycles.'}
              </div>
            )}
          </div>
        )}

        {/* Cancellation Controls */}
        {isPro && user?.subscription_status === 'active' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#2a2a4a]">
            <div>
              <p className="text-xs font-bold text-slate-200">Cancel Auto-Renewal</p>
              <p className="text-[11px] text-slate-400">
                Stop future recurring charges. You will retain Pro access for the remainder of your paid term.
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              <span>Cancel Auto-Renewal</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Form Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-4 sm:p-6 md:p-8 shadow-xl space-y-4 sm:space-y-6">
        <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#10b981] shrink-0" />
          <span>Personal Profile &amp; Preferences</span>
        </h3>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-[#10b981] text-xs text-[#10b981] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile changes saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">First Name / Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141424] border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-[#2e86ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10101c] border border-slate-800 text-xs sm:text-sm text-slate-400 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Email is locked to your account identifier.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Active Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141424] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#2e86ff]"
              >
                <option value="UK">UK (United Kingdom)</option>
                <option value="US">US (United States)</option>
                <option value="CA">CA (Canada)</option>
                <option value="AU">AU (Australia)</option>
                <option value="EU">EU (Europe)</option>
                <option value="Other">Other Region</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Entomology Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141424] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#2e86ff]"
              >
                <option value="Beginner">Beginner (0-10 species)</option>
                <option value="Amateur">Amateur (11-50 species)</option>
                <option value="Expert">Expert (51+ species)</option>
                <option value="Master">Master (Certified Entomologist)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Save Profile Changes</span>
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="text-center pt-2">
        <button
          onClick={logout}
          className="min-h-[42px] px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* Smartphone Install Companion Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
