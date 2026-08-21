import React from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Send,
  Zap,
  Sparkles,
  Lock,
  ArrowRight,
  MapPin,
  Flame,
  Clock,
} from 'lucide-react';

interface AlertsPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const AlertsPreview: React.FC<AlertsPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Bell className="w-3.5 h-3.5" />
          <span>Real-Time Entomological Surveillance Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Regional outbreak &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400">
            seasonal pest alerts
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stay warned of invasive hornet arrivals, tick season spikes, oak processionary moth clusters, and swarm triggers before they reach your garden.
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
            <span>Instant access • Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Push Notification Toggle Teaser */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#17172c] border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white">
              Instant Push Notifications & Outbreak Alerts
            </h4>
            <p className="text-xs text-slate-400">
              Receive automatic alerts when high-risk species are reported within 15 km of your location.
            </p>
          </div>
        </div>
        <button
          onClick={unlockAction}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 shadow-lg"
        >
          {isAuthenticated ? 'Subscribe to enable' : 'Unlock — $4.99/mo'}
        </button>
      </div>

      {/* Visible Seasonal Outbreak Alert with Blurred Intelligence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Active Outbreak Bulletin (Preview)</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-bold">
            HIGH SEVERITY
          </span>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[#17172c] border border-slate-700/80 overflow-hidden shadow-2xl">
          {/* Visible Bulletin Header */}
          <div className="p-5 sm:p-7 border-b border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                Asian Hornet (Vespa velutina) Spring Queen Emergence Active
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Updated 3 hours ago
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Targeted surveillance active across southern zones. Overwintered foundress queens are currently constructing primary embryo nests in sheltered garden sheds, carports, and hedgerows.
            </p>
          </div>

          {/* FLOUTÉ / MASQUÉ: Hotspot map coordinates, trap formula, dispatch hotline */}
          <div className="relative p-5 sm:p-7 space-y-5">
            <div className="filter blur-[5px] select-none pointer-events-none opacity-40 space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                <span className="font-bold text-sm text-rose-300">Hotspot Coordinates & Flight Corridors:</span>
                <p className="text-xs text-slate-300">
                  Confirmed sightings active across coastal grid coordinates [50.8° N to 51.2° N]. Flight trajectory indicates high apiary predation probability within 3.5 km radius.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121224] border border-slate-800 space-y-1.5">
                <span className="font-bold text-sm text-amber-300">Selective Spring Trapping Bait Formula:</span>
                <p className="text-xs text-slate-300">
                  Mix 350ml dark beer + 250ml white wine + 2 tbsp blackcurrant syrup to prevent honeybee and butterfly by-catch while targeting vespid queens.
                </p>
              </div>
            </div>

            {/* Unlock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#17172c] via-[#17172c]/95 to-transparent text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,166,35,0.3)]">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Unlock Real-Time Outbreak Intelligence
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-4">
                Access precise coordinates, selective trap formulas, and official eradication hotline dispatch tools.
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
                <span>Instant activation • Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
