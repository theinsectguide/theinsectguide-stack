import React, { useState } from 'react';
import {
  ShieldAlert,
  Bug,
  AlertTriangle,
  Home,
  CheckCircle2,
  DollarSign,
  Wrench,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Leaf,
  Layers,
} from 'lucide-react';

interface PestPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const PestPreview: React.FC<PestPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Structural', 'Biting / Parasite', 'Food & Pantry', 'Fabric', 'Garden'];

  const pestsCovered = [
    { name: 'Bed Bugs', latin: 'Cimex lectularius', cat: 'Biting / Parasite', urgency: 'Critical', cost: '$800 – $2,500' },
    { name: 'Termites (Subterranean)', latin: 'Reticulitermes flavipes', cat: 'Structural', urgency: 'Critical', cost: '$1,200 – $3,800' },
    { name: 'German Cockroaches', latin: 'Blattella germanica', cat: 'Food & Pantry', urgency: 'High', cost: '$300 – $750' },
    { name: 'Cat & Dog Fleas', latin: 'Ctenocephalides felis', cat: 'Biting / Parasite', urgency: 'High', cost: '$250 – $550' },
    { name: 'Carpet Beetles', latin: 'Anthrenus verbasci', cat: 'Fabric', urgency: 'Medium', cost: '$200 – $450' },
    { name: 'Woodworm / Deathwatch', latin: 'Xestobium rufovillosum', cat: 'Structural', urgency: 'High', cost: '$600 – $2,000' },
    { name: 'Indian Meal Moths', latin: 'Plodia interpunctella', cat: 'Food & Pantry', urgency: 'Medium', cost: '$150 – $350' },
    { name: 'Silverfish', latin: 'Lepisma saccharinum', cat: 'Fabric', urgency: 'Low', cost: '$150 – $300' },
  ];

  const filteredPests = activeCategory === 'All'
    ? pestsCovered
    : pestsCovered.filter((p) => p.cat === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Bug className="w-3.5 h-3.5" />
          <span>Home Infestation & Pest Guide Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Identify home pests &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400">
            compare exterminator costs
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Comprehensive diagnostic guides covering structural woodborers, biting parasites, pantry pests, and garden invaders with step-by-step DIY vs pro cost breakdowns.
        </p>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={unlockAction}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#10b981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display font-extrabold text-sm shadow-xl shadow-emerald-950/60 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAuthenticated ? 'Subscribe to unlock' : 'Unlock — $4.99/mo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>48-hour money-back guarantee</span>
          </div>
        </div>
      </div>

      {/* Covered Pests Category Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Covered Household & Structural Pests</span>
          </h3>
          <span className="text-xs text-slate-400">{filteredPests.length} species covered</span>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-[#1c1c34] text-slate-300 hover:bg-[#242444]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pest Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredPests.map((pest, idx) => (
            <div
              key={idx}
              onClick={unlockAction}
              className="cursor-pointer p-3.5 rounded-xl bg-[#17172c] border border-slate-700/80 hover:border-amber-500/50 transition-all space-y-1.5 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pest.cat}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  pest.urgency === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {pest.urgency}
                </span>
              </div>
              <h4 className="font-display font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                {pest.name}
              </h4>
              <p className="text-[11px] text-slate-400 italic truncate">{pest.latin}</p>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Pro Cost:</span>
                <span className="font-bold text-emerald-400">{pest.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blurred Sample Pest File Preview (Bed Bugs / Cimex lectularius) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Sample Treatment Protocol (Preview)
          </span>
          <span className="text-xs text-amber-400 font-semibold">Bed Bugs (Cimex lectularius)</span>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[#17172c] border border-slate-700/80 overflow-hidden shadow-2xl">
          {/* Top Visible Intro */}
          <div className="p-5 sm:p-7 border-b border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                  Bed Bugs Infestation Protocol
                </h3>
                <p className="text-xs text-slate-400 italic">Cimex lectularius • Biting Parasite</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                Urgency: Critical (Immediate Action)
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Signs of Infestation:</span>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                <li>Linear clusters of itchy red bites on neck, arms, and exposed skin during sleep</li>
                <li>Rust-colored microscopic fecal spots along mattress seams, headboard corners, and baseboards</li>
              </ul>
            </div>
          </div>

          {/* FLOUTÉ / MASQUÉ: DIY Steps, Chemical Plan & Cost Breakdown */}
          <div className="relative p-5 sm:p-7 space-y-5">
            <div className="filter blur-[5px] select-none pointer-events-none opacity-40 space-y-4">
              <div className="p-4 rounded-xl bg-[#121224] border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Natural & Non-Toxic Remedies
                </h4>
                <p className="text-xs text-slate-300 mt-1.5">
                  Application rates for food-grade Diatomaceous Earth (DE) and high-temperature steam protocols (minimum 60°C / 140°F) for carpets and furniture without chemical toxicity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121224] border border-slate-800">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  4-Stage Chemical Eradication Protocol
                </h4>
                <p className="text-xs text-slate-300 mt-1.5">
                  Step 1: Mattress encasement. Step 2: Insect Growth Regulators (IGR) spray. Step 3: Baseboard residual pyrethroid dusting. Step 4: Follow-up thermal inspection after 14 days.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Professional Exterminator Cost Comparison
                </h4>
                <p className="text-xs text-slate-300 mt-1.5">
                  Whole-home heat treatment ($1,200 – $2,500) vs Chemical treatment ($800 – $1,400). Average warranty coverage and key questions to ask before signing pest contracts.
                </p>
              </div>
            </div>

            {/* Unlock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#17172c] via-[#17172c]/95 to-transparent text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Unlock All Pest Guides & Treatment Plans
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-4">
                Get instant access to step-by-step eradication steps, organic remedies, and professional pricing comparisons for all pests.
              </p>

              <button
                onClick={unlockAction}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#10b981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display font-extrabold text-sm shadow-xl shadow-emerald-950/80 active:scale-98 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAuthenticated ? 'Subscribe to unlock' : 'Unlock — $4.99/mo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>48h money-back guarantee • Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
