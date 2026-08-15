import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { WeatherPreview } from '../components/previews/WeatherPreview';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface WeatherPageProps {
  onNavigate: (tab: string) => void;
}

export const WeatherPage: React.FC<WeatherPageProps> = ({ onNavigate }) => {
  const { isPro, isAuthenticated, user } = useAuth();
  const { weatherRisk, isLoading } = useAlerts();

  if (!isPro) {
    return <WeatherPreview onNavigate={onNavigate} isAuthenticated={isAuthenticated} />;
  }

  const riskColor =
    weatherRisk?.risk_level === 'Severe'
      ? 'text-[#e94560] border-[#e94560] bg-rose-950/60'
      : weatherRisk?.risk_level === 'High'
      ? 'text-[#f5a623] border-[#f5a623] bg-amber-950/60'
      : weatherRisk?.risk_level === 'Moderate'
      ? 'text-amber-300 border-amber-500/50 bg-amber-950/40'
      : 'text-[#10b981] border-[#10b981] bg-emerald-950/60';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <CloudSun className="w-3.5 h-3.5 shrink-0" />
          <span>PRO Weather Intelligence Active</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          Meteorological Insect Activity Forecast
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Real-time weather tracking and insect flight risk indices for {user?.region || 'UK'}.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1c1c36] via-[#1a1a2e] to-[#121224] border border-[#2e2e50] shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#28284e] flex items-center justify-center text-teal-400 shrink-0">
              <CloudSun className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Live Weather Station</span>
              <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                {weatherRisk?.city || 'Regional Center'}
              </h3>
            </div>
          </div>

          <div className={`self-start sm:self-auto px-3 sm:px-4 py-1.5 rounded-full border text-xs font-mono font-bold ${riskColor}`}>
            {weatherRisk?.risk_level || 'Moderate'} Activity
          </div>
        </div>

        {weatherRisk && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Temperature</span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {weatherRisk.temperature}°C
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Humidity</span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {weatherRisk.humidity}%
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Precipitation</span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {weatherRisk.precipitation} mm
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Activity Score</span>
              <span className="font-display font-bold text-sm sm:text-base text-teal-400">
                {weatherRisk.activity_index} / 100
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {weatherRisk?.active_species_threats && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">
                Elevated Risk Species in Current Weather:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {weatherRisk.active_species_threats.map((th, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-[#e94560]/40 text-rose-200 text-xs font-medium"
                  >
                    ⚠️ {th}
                  </span>
                ))}
              </div>
            </div>
          )}

          {weatherRisk?.recommendation && (
            <div className="p-3 sm:p-4 rounded-xl bg-[#141424] border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-[#10b981]">Safety Recommendation: </strong>
              {weatherRisk.recommendation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
