import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bug, ArrowRight, Loader2, Lock, Shield } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onNavigate('scan');
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-16">
      <div className="rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2e86ff] to-[#10b981] p-0.5 mx-auto flex items-center justify-center shadow-lg">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">Welcome back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your field journal and scans
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-[#e94560] text-xs text-rose-200 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141426] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2e86ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141426] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2e86ff]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-display font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#10b981] hover:underline font-semibold"
            >
              Sign Up
            </button>
          </span>

          {/* Requirement 7: Discrete Admin access link */}
          <button
            onClick={() => onNavigate('admin-login')}
            className="text-[11px] text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            Admin access
          </button>
        </div>
      </div>
    </div>
  );
};
