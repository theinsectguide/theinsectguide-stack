import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Loader2, Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (tab: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await adminLogin(email, password);
    setLoading(false);

    if (res.success) {
      onNavigate('admin-dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-16">
      <div className="rounded-3xl bg-[#18122a] border border-purple-900/60 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-900 via-purple-700 to-indigo-600 p-0.5 mx-auto flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-6 h-6 text-purple-200" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">System Administration</h2>
          <p className="text-xs text-purple-300">
            Secure administrative control portal for The Insect Guide
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-[#e94560] text-xs text-rose-200 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@theinsectguide.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#100b1c] border border-purple-900 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">Admin Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#100b1c] border border-purple-900 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-display font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Authenticate as Admin
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-purple-900/50 text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs text-purple-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
};
