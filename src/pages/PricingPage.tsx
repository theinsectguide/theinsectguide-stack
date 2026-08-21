import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle,
  Clock,
  RefreshCcw,
  CreditCard,
  LayoutDashboard,
  Lock,
} from 'lucide-react';
import { MonthlyCheckoutModal } from '../components/MonthlyCheckoutModal';
import { AnnualCheckoutModal } from '../components/AnnualCheckoutModal';

interface PricingPageProps {
  onNavigate: (tab: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);

  const isPro = user?.tier === 'pro';

  const proFeatures = [
    'Unlimited AI insect scans & identification',
    'High-resolution offline guides access',
    'Custom collection notes & GPS tagging',
    'Advanced species comparison tool',
    'Audio identifier for buzzing & chirps (beta)',
    'Full access to all regions & seasonal data',
    'Priority customer support',
  ];

  const handleOpenMonthlyCheckout = () => {
    setIsMonthlyModalOpen(true);
  };

  const handleOpenAnnualCheckout = () => {
    setIsAnnualModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#1e1e38] border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Membership Options</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">
          Unlock the Full Power of{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-[#10b981] bg-clip-text text-transparent">
            The Insect Guide
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upgrade to Pro for unlimited AI-powered insect identification, comprehensive habitat guides, and advanced entomological tools.
        </p>

        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md shadow-emerald-950/40 mt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secure payments processed with PayPal • Cancel anytime in 1 click</span>
        </div>
      </div>

      {/* Plan Selector Toggle Buttons */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-2xl bg-[#16162c] border border-slate-700/80 shadow-lg flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#20203c]'
            }`}
          >
            Monthly Plan ($4.99/mo)
          </button>
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedPlan === 'annual'
                ? 'bg-gradient-to-r from-emerald-500 to-[#10b981] text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#20203c]'
            }`}
          >
            <span>Annual Plan ($29.99/yr)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
              selectedPlan === 'annual' ? 'bg-black/20 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              Save 50%
            </span>
          </button>
        </div>
      </div>

      {/* 2 Paid Plans Grid: Monthly ($4.99/mo) and Annual ($29.99/yr) — 100% VISIBLE SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-4xl mx-auto">
        {/* Monthly Plan Card */}
        <div
          onClick={() => setSelectedPlan('monthly')}
          className={`rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 shadow-xl transition-all ${
            selectedPlan === 'monthly'
              ? 'bg-[#1e1e38] border-2 border-emerald-500 shadow-emerald-950/60 ring-1 ring-emerald-500/30'
              : 'bg-[#1a1a2e] border border-[#2e2e4e] hover:border-slate-600 opacity-90'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  Monthly Plan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Flexible month-to-month access</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedPlan === 'monthly' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
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

          {/* Payment CTA Area */}
          <div className="pt-4 border-t border-slate-700/80 space-y-3">
            {isPro ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-[#10b981] text-center space-y-2">
                <span className="text-xs font-bold text-[#10b981]">PRO MEMBERSHIP ACTIVE</span>
                <p className="text-[11px] text-slate-300">
                  You have full unlimited access to all features.
                </p>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Access my Dashboard</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenMonthlyCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Subscribe Monthly ($4.99/mo)</span>
              </button>
            )}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure payment via PayPal • Credit card</span>
            </div>
          </div>
        </div>

        {/* Annual Plan Card - "Best Value" GREEN BADGE */}
        <div
          onClick={() => setSelectedPlan('annual')}
          className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 shadow-2xl transition-all ${
            selectedPlan === 'annual'
              ? 'bg-gradient-to-b from-[#24244c] to-[#1a1a2e] border-2 border-emerald-500 shadow-emerald-950/60 ring-1 ring-emerald-500/40 mt-4 md:mt-0'
              : 'bg-[#1a1a2e] border border-[#2e2e4e] hover:border-slate-600 opacity-90 mt-4 md:mt-0'
          }`}
        >
          {/* Best Value Badge - PURE GREEN */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#10b981] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 border border-emerald-300">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Best Value — Save 50%</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  Annual Pass
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">1-Year Full Access • Non-recurring</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                1 Year Pass
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-display font-black text-white">
                $29.99 <span className="text-xs sm:text-sm text-slate-400 font-normal">/ year</span>
              </div>
              <p className="text-xs text-emerald-400 mt-0.5 font-medium">
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
              <li className="flex items-start gap-2.5 text-emerald-300 font-semibold pt-1">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Save $29.89 compared to paying monthly for 1 year</span>
              </li>
            </ul>
          </div>

          {/* Payment CTA Area */}
          <div className="pt-4 border-t border-slate-700/80 space-y-3">
            {isPro ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-[#10b981] text-center space-y-2">
                <span className="text-xs font-bold text-[#10b981]">PRO MEMBERSHIP ACTIVE</span>
                <p className="text-[11px] text-slate-300">
                  You have full unlimited access to all features.
                </p>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Access my Dashboard</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenAnnualCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#10b981] hover:brightness-110 text-slate-950 font-display font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 active:scale-98 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Get the Annual Pass ($29.99/year)</span>
              </button>
            )}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure encrypted checkout via PayPal</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-white text-center mb-6">
          Frequently Asked Questions
        </h3>

        {[
          {
            q: 'How do I access Pro features after subscribing?',
            a: 'Your Pro features activate instantly upon successful checkout. You will immediately have unlimited AI scans, full encyclopedia access, and field journal synchronization.',
          },
          {
            q: 'Can I cancel my subscription at any time?',
            a: 'Yes, absolutely. You can cancel with a single click in your Account Settings. Your Pro access will remain active until the end of your prepaid billing period with no further charges.',
          },
          {
            q: 'What payment methods do you accept?',
            a: 'We accept PayPal balance and all major credit cards (Visa, Mastercard, American Express) processed securely through PayPal encrypted checkout.',
          },
          {
            q: 'Is there any commitment on the Monthly plan?',
            a: 'None at all. The Monthly plan ($4.99/mo) is billed month-to-month and can be stopped at any moment.',
          },
        ].map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#1a1a2e] border border-slate-700/80 overflow-hidden transition-all"
          >
            <button
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              className="w-full p-4 sm:p-5 text-left font-display font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer hover:text-emerald-300 transition-colors"
            >
              <span>{faq.q}</span>
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
            {activeFaq === i && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals for Dedicated Isolated Checkouts */}
      <MonthlyCheckoutModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        onSuccessNavigate={onNavigate}
      />

      <AnnualCheckoutModal
        isOpen={isAnnualModalOpen}
        onClose={() => setIsAnnualModalOpen(false)}
        onSuccessNavigate={onNavigate}
      />
    </div>
  );
};
