import React from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';

interface WeatherPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const WeatherPreview: React.FC<WeatherPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <CloudSun className="w-3.5 h-3.5" />
          <span>Meteorological Insect Activity Forecast Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Weather-driven insect activity &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400">
            swarm risk forecast
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Predict wasp aggressiveness, mosquito breeding spikes, and tick questing behavior calculated from atmospheric pressure, humidity, and temperature.
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

      {/* Main Meteorological Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#17172c] border border-slate-700/80 overflow-hidden shadow-2xl space-y-6 p-5 sm:p-8">
        {/* CURRENT WEATHER DATA VISIBLE */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                <CloudSun className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white">Current Field Meteorology</h3>
                <p className="text-xs text-slate-400">Live Station Telemetry</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              Live Sensor Online
            </div>
          </div>

          {/* Weather Grid - 100% VISIBLE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-xl bg-[#121224] border border-slate-800 text-center space-y-1">
              <Thermometer className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="text-[11px] text-slate-400 block">Temperature</span>
              <span className="font-display font-extrabold text-lg text-white">24°C / 75°F</span>
            </div>

            <div className="p-4 rounded-xl bg-[#121224] border border-slate-800 text-center space-y-1">
              <Droplets className="w-5 h-5 text-blue-400 mx-auto" />
              <span className="text-[11px] text-slate-400 block">Relative Humidity</span>
              <span className="font-display font-extrabold text-lg text-white">68%</span>
            </div>

            <div className="p-4 rounded-xl bg-[#121224] border border-slate-800 text-center space-y-1">
              <Wind className="w-5 h-5 text-teal-400 mx-auto" />
              <span className="text-[11px] text-slate-400 block">Wind Velocity</span>
              <span className="font-display font-extrabold text-lg text-white">8 km/h</span>
            </div>

            <div className="p-4 rounded-xl bg-[#121224] border border-slate-800 text-center space-y-1">
              <Compass className="w-5 h-5 text-purple-400 mx-auto" />
              <span className="text-[11px] text-slate-400 block">Pressure</span>
              <span className="font-display font-extrabold text-lg text-white">1014 hPa</span>
            </div>
          </div>
        </div>

        {/* FLOUTÉ / MASQUÉ: Entomological Risk Analysis & Swarm Forecast */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Entomological Activity Analysis & Swarm Indices (Preview)
          </span>

          <div className="relative rounded-2xl overflow-hidden p-6 bg-[#121224] border border-slate-800">
            {/* Blurred content */}
            <div className="filter blur-[5px] select-none pointer-events-none opacity-35 space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <h4 className="font-bold text-sm text-amber-300">
                  Wasp & Hornet Aggression Index: 8.2 / 10 (High Threat)
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Dropping barometric pressure coupled with high ambient humidity stimulates defensive stinging instincts near outdoor dining.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#17172c] border border-slate-700">
                  <span className="font-bold text-rose-300 block">Tick Questing Probability</span>
                  <span className="text-slate-300">Severe (Active nymph questing up to 40cm grass height)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#17172c] border border-slate-700">
                  <span className="font-bold text-teal-300 block">Mosquito Swarm Timing</span>
                  <span className="text-slate-300">Peak swarm anticipated between 18:30 – 21:00</span>
                </div>
              </div>
            </div>

            {/* Unlock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#121224] via-[#121224]/95 to-transparent text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                <Lock className="w-6 h-6 text-teal-400" />
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Unlock Entomological Weather Intelligence
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-4">
                Get full access to barometric aggression algorithms, tick questing indices, and 5-day swarm risk charts.
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
