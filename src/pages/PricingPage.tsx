import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PayPalButton } from '../components/PayPalButton';
import { Check, ShieldCheck, Zap, Sparkles, Crown, Clock, ArrowLeft, UserPlus } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (tab: string) => void;
  onGoBack?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onGoBack }) => {
  const { user, isPro } = useAuth();

  const proFeatures = [
    'Unlimited AI Photo Scans with Claude Vision',
    'Instant 0-10 Danger & Venom Level Assessments',
    'Sting & Bite Emergency First Aid Triage Guides',
    'Pest & Infestation Diagnosis with DIY vs Exterminator Costs',
    'Private Observation Journal with GPS Pinning',
    'Export Observation Journal to PDF for entomology logs',
    'Regional Hazard & Weather-based Insect Outbreak Alerts',
    'Full Insect Encyclopedia covering UK, US, CA, AU & EU',
    'PWA Offline Field Cache for remote hiking',
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-12 space-y-6 sm:space-y-10">
      {/* Top Bar with Quick Back Action */}
      {onGoBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242446]/80 hover:bg-[#2e2e56] border border-slate-700/80 text-xs text-slate-300 hover:text-white font-semibold transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 text-[#10b981] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 shrink-0" />
          <span>Entomological Safety & Intelligence</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white">
          Choose your protection plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto px-1">
          Instant AI identification of venomous species, emergency triage protocols, and home pest diagnosis. Cancel anytime with a 48-hour money-back guarantee.
        </p>
      </div>

      {!user ? (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#162e24] to-emerald-950/60 border border-emerald-500/40 text-center space-y-2.5 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Create your account to start risk-free with a 48-hour money-back guarantee</span>
          </div>
          <p className="text-xs text-slate-300">
            Sign up takes 30 seconds. Choose your plan after or directly below.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-display font-extrabold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Free Account</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 rounded-xl bg-[#242446] hover:bg-[#2e2e56] border border-slate-700 text-xs text-slate-200 font-semibold transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      ) : !isPro && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-emerald-300">
            Welcome, {user.name || 'Explorer'}!
          </p>
          <p className="text-xs text-slate-300">
            Please select a Pro plan below to activate your unlimited AI scans, emergency triage protocols, and observation tools.
          </p>
        </div>
      )}

      {/* 2 Paid Plans Grid: Monthly ($4.99/mo) and Annual ($29.99/yr) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-4xl mx-auto">
        {/* Monthly Plan Card - NO BADGE */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#1a1a2e] border border-[#2e2e4e] p-5 sm:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  Monthly Plan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Flexible month-to-month access</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                Monthly
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-white">
                $4.99 <span className="text-xs sm:text-sm text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Billed monthly • Cancel anytime
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 text-xs text-slate-200">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Area */}
          <div className="pt-2 border-t border-slate-700/80 space-y-3">
            {isPro ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-[#10b981] text-center">
                <span className="text-xs font-bold text-[#10b981]">PRO MEMBERSHIP ACTIVE</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  You have full unlimited access to all features.
                </p>
              </div>
            ) : (
              <PayPalButton
                plan="monthly"
                price="$4.99/mo"
                onSuccess={() => onNavigate('scan')}
              />
            )}
          </div>
        </div>

        {/* Annual Plan Card - "Best Value" GREEN BADGE */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#24244c] to-[#1a1a2e] border-2 border-emerald-500/80 p-5 sm:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 shadow-2xl shadow-emerald-950/50 mt-4 md:mt-0">
          {/* Top Pill - Best Value (Green) */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-[#10b981] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-lg whitespace-nowrap">
            Best Value — Save 50%
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                  <span>Annual Plan</span>
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Complete year-round protection</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#10b981] text-[11px] font-bold">
                50% OFF
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-white">
                $29.99 <span className="text-xs sm:text-sm text-slate-400 font-normal">/ year</span>
              </div>
              <p className="text-xs text-[#10b981] font-semibold mt-0.5">
                Just $2.49/month • Billed annually ($29.99/yr)
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 text-xs text-slate-200">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Area */}
          <div className="pt-2 border-t border-slate-700/80 space-y-3">
            {isPro ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-[#10b981] text-center">
                <span className="text-xs font-bold text-[#10b981]">PRO MEMBERSHIP ACTIVE</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  You have full unlimited access to all features.
                </p>
              </div>
            ) : (
              <PayPalButton
                plan="annual"
                price="$29.99/yr"
                onSuccess={() => onNavigate('scan')}
              />
            )}
          </div>
        </div>
      </div>

      {/* 48-HOUR MONEY-BACK GUARANTEE BOX UNDER THE PLANS */}
      <div className="max-w-2xl mx-auto space-y-2">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#132c25] to-emerald-950/70 border-2 border-emerald-500/80 shadow-xl flex items-center justify-center gap-3 text-center">
          <ShieldCheck className="w-6 h-6 text-[#10b981] shrink-0" />
          <span className="font-display font-extrabold text-sm sm:text-base text-white">
            48-hour money-back guarantee* — Full refund, no questions asked. No risk.
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 text-center px-4 leading-relaxed">
          *Applies to first payment only, within 48 hours of subscription. Subsequent payments are non-refundable.
        </p>
      </div>
    </div>
  );
};
