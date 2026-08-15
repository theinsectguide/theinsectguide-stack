import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  User,
  LogOut,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const SettingsPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [region, setRegion] = useState(user?.region || 'UK');
  const [level, setLevel] = useState(user?.level || 'Beginner');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#2e86ff] shrink-0" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal entomology profile and regional ecosystem preferences.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-4 sm:p-6 md:p-8 shadow-xl space-y-4 sm:space-y-6">
        <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#10b981] shrink-0" />
          <span>Personal Profile</span>
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
    </div>
  );
};
