import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminStats, User } from '../types';
import {
  ShieldAlert,
  Users,
  DollarSign,
  TrendingUp,
  Camera,
  Activity,
  Trash2,
  CheckCircle,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  Ban,
  UserCheck,
  Calendar,
  AlertOctagon,
  Mail,
  Send,
} from 'lucide-react';

export const AdminDashboardPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { token, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAdminData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      onNavigate('admin-login');
      return;
    }
    loadAdminData();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          You do not have administrative privileges to view this area.
        </p>
        <button
          onClick={() => onNavigate('landing')}
          className="px-4 py-2.5 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-lg"
        >
          Return to Application
        </button>
      </div>
    );
  }

  const handleBanUser = async (user: User) => {
    const reason = prompt(`Please enter a ban reason for ${user.email}:`, 'Violation of platform terms');
    if (reason === null) return; // user cancelled prompt

    setActionLoadingId(user.id);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_banned: true, banned_reason: reason, banned_at: new Date().toISOString() } : u
          )
        );
        setFeedbackMessage({ type: 'success', text: `User ${user.email} has been banned.` });
      } else {
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to ban user.' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnbanUser = async (user: User) => {
    if (!confirm(`Are you sure you want to lift the ban on ${user.email}?`)) return;

    setActionLoadingId(user.id);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_banned: false, banned_reason: undefined, banned_at: undefined } : u
          )
        );
        setFeedbackMessage({ type: 'success', text: `Ban removed for ${user.email}.` });
      } else {
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to unban user.' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user and all their journal entries?')) return;
    setActionLoadingId(userId);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setFeedbackMessage({ type: 'success', text: 'User permanently deleted.' });
      } else {
        const data = await res.json();
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to delete user.' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setFeedbackMessage({ type: 'error', text: 'Network error deleting user.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTriggerWeeklyBroadcast = async () => {
    if (!confirm('Are you sure you want to dispatch the Weekly Seasonal Alert broadcast to all active members right now?')) return;
    setBroadcastLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/admin/trigger-weekly-alerts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({
          type: 'success',
          text: `Weekly Seasonal Alert broadcast dispatched successfully: ${data.sent} sent out of ${data.processed} active users.`,
        });
      } else {
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to dispatch broadcast.' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Network error triggering broadcast.' });
    } finally {
      setBroadcastLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.region.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.subscription_plan && u.subscription_plan.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Executive Administration
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            SaaS Metrics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time subscriber metrics, revenue analytics, and species observation logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-[#28284c] hover:bg-[#343464] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          Refresh Stats
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/70 border border-rose-500/50 text-rose-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400 mb-2" />
          <p className="text-xs">Computing revenue metrics...</p>
        </div>
      ) : stats ? (
        <>
          {/* TOP STATS METRIC TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Monthly Recurring (MRR)</span>
                <DollarSign className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white">
                ${stats.mrr.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-400 block font-mono">
                ARR: ${stats.arr.toFixed(2)} / yr
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Active Pro Members</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {stats.pro_users}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>{stats.cancelled_users} cancelled</span>
                <span>•</span>
                <span className="text-rose-400">{stats.refunded_users || 0} refunded</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Registered</span>
                <Users className="w-4 h-4 text-[#2e86ff]" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white">
                {stats.total_users}
              </div>
              <span className="text-[11px] text-blue-400 block font-mono">
                +{stats.new_users_today} today / +{stats.new_users_week} this week
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Scans Performed</span>
                <Camera className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white">
                {stats.total_scans}
              </div>
              <span className="text-[11px] text-rose-400 block">
                Avg Danger Index: {stats.average_danger_level.toFixed(1)} / 10
              </span>
            </div>
          </div>

          {/* TOP INSECTS SCANNED & REGIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Scanned Species */}
            <div className="p-6 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-4 shadow-xl">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#10b981]" />
                Top Scanned Insect Species
              </h3>
              <div className="space-y-2.5">
                {stats.top_scanned_insects.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#141424] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#28284c] text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-purple-300">
                      {item.count} scans
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Activity Breakdown */}
            <div className="p-6 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2e86ff]" />
                  Regional Distribution (UK / US / CA / AU / EU)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Live geo-cohorts</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { code: 'UK', label: 'United Kingdom', color: 'text-sky-400' },
                  { code: 'US', label: 'United States', color: 'text-blue-400' },
                  { code: 'CA', label: 'Canada', color: 'text-rose-400' },
                  { code: 'AU', label: 'Australia', color: 'text-amber-400' },
                  { code: 'EU', label: 'Europe', color: 'text-emerald-400' },
                  { code: 'Other', label: 'Other Regions', color: 'text-purple-400' },
                ].map((regionItem) => {
                  const count = stats.most_active_regions[regionItem.code] || 0;
                  return (
                    <div key={regionItem.code} className="p-4 rounded-xl bg-[#141424] border border-slate-800 text-center space-y-0.5">
                      <span className={`text-xs font-mono font-bold ${regionItem.color}`}>{regionItem.code}</span>
                      <span className="text-xl font-display font-extrabold text-white block">
                        {count}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{regionItem.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BREVO & AUTOMATED EMAIL SYSTEM CARD */}
          <div className="p-6 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#10b981]" />
                  Brevo Email Automation Engine
                </h3>
                <p className="text-[11px] text-slate-400">
                  Configured sender: <span className="text-emerald-400 font-mono">contact@theinsectguide.com</span> &bull; Synchronized Contact List: <span className="text-purple-300 font-mono">List #2</span>
                </p>
              </div>

              <button
                onClick={handleTriggerWeeklyBroadcast}
                disabled={broadcastLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#2e86ff] hover:opacity-95 text-black font-display font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 self-start sm:self-auto"
              >
                {broadcastLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Dispatch Weekly Broadcast (Test / Force)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#141424] border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Welcome &amp; Onboarding</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant registration dispatch + automatic enrollment in Brevo List #2.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141424] border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Billing Lifecycle Emails</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Payment confirmation, cancel auto-renewal notices, and 48-hr refunds.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141424] border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scheduled Weekly Dispatch</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every Monday at 08:00 UTC with tailored regional forecasts (UK/US/CA/AU/EU).
                </p>
              </div>
            </div>
          </div>

          {/* USER MANAGEMENT DIRECTORY */}
          <div className="p-6 rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  User Directory ({users.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Inspect user plans (Monthly vs Annual), account status, and apply administrative bans or removals.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, email, plan, region..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#141424] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Region</th>
                    <th className="pb-3 font-semibold">Plan / Billing</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Access State</th>
                    <th className="pb-3 font-semibold text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isBanned = !!u.is_banned;
                    const isProcessing = actionLoadingId === u.id;

                    return (
                      <tr key={u.id} className={`hover:bg-[#242444]/40 transition-colors ${isBanned ? 'bg-rose-950/10' : ''}`}>
                        {/* Name & Email */}
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.role === 'admin' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-900/80 text-purple-200 border border-purple-600/40">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Region */}
                        <td className="py-3.5 pr-2 font-mono text-slate-300 font-medium">
                          {u.region || 'UK'}
                        </td>

                        {/* Plan & Billing Type: Monthly vs Annual */}
                        <td className="py-3.5 pr-2">
                          {u.tier === 'pro' ? (
                            <div className="space-y-0.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.subscription_plan === 'annual'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                {u.subscription_plan === 'annual' ? 'Annual Plan ($29.99/yr)' : 'Monthly Plan ($4.99/mo)'}
                              </span>
                              {u.subscription_start && (
                                <div className="text-[10px] text-slate-400">
                                  Since {new Date(u.subscription_start).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                              Free Tier
                            </span>
                          )}
                        </td>

                        {/* Subscription Status */}
                        <td className="py-3.5 pr-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                              u.subscription_status === 'active'
                                ? 'bg-emerald-950/80 text-emerald-300'
                                : u.subscription_status === 'cancelled'
                                ? 'bg-amber-950/80 text-amber-300'
                                : u.subscription_status === 'refunded'
                                ? 'bg-rose-950/80 text-rose-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {u.subscription_status || 'none'}
                          </span>
                        </td>

                        {/* Access State: Active / Banned */}
                        <td className="py-3.5 pr-2">
                          {isBanned ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/50">
                                <AlertOctagon className="w-3 h-3 text-rose-400" />
                                BANNED
                              </span>
                              {u.banned_reason && (
                                <div className="text-[10px] text-rose-400/80 max-w-[140px] truncate" title={u.banned_reason}>
                                  {u.banned_reason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Moderation Actions (Ban / Unban / Delete) */}
                        <td className="py-3.5 text-right">
                          {u.role !== 'admin' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Ban / Unban Button */}
                              {isBanned ? (
                                <button
                                  onClick={() => handleUnbanUser(u)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                                  title="Unban this user"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-3 h-3" />
                                  )}
                                  <span>Unban</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanUser(u)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                                  title="Ban this user account"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Ban className="w-3 h-3" />
                                  )}
                                  <span>Ban</span>
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                                title="Permanently delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono italic">Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No users found matching your search query.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
