import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bug, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('UK');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const result = await register({
      name,
      email,
      password,
      region,
      level,
    });

    setLoading(false);
    if (result.success) {
      // Per spec #7: After registration -> redirect to /pricing
      onNavigate('pricing');
    } else {
      setErrorMsg(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-12">
      <div className="rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2e86ff] to-[#10b981] p-0.5 mx-auto flex items-center justify-center shadow-lg">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">Create your account</h2>
          <p className="text-xs text-slate-400">
            Start identifying insects with Claude Vision AI
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-[#e94560] text-xs text-rose-200 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">First Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141426] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2e86ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-[#141426] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#2e86ff]"
              >
                <option value="UK">UK (United Kingdom)</option>
                <option value="US">US (United States)</option>
                <option value="CA">CA (Canada)</option>
                <option value="AU">AU (Australia)</option>
                <option value="EU">EU (Europe)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-[#141426] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#2e86ff]"
              >
                <option value="Beginner">Beginner (0-10)</option>
                <option value="Amateur">Amateur (11-50)</option>
                <option value="Expert">Expert (51+)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2e86ff] to-[#10b981] hover:brightness-110 text-white font-display font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue to Pro Plans
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#2e86ff] hover:underline font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
