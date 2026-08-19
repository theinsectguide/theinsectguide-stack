import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { AlertsPreview } from '../components/previews/AlertsPreview';
import {
  Bell,
  CloudSun,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Send,
  Zap,
  Info,
  Thermometer,
  Droplets,
  Loader2,
} from 'lucide-react';

export const AlertsPage: React.FC<{ onNavigate?: (tab: string) => void; onGoBack?: () => void }> = ({ onNavigate = () => {}, onGoBack }) => {
  const { alerts, weatherRisk, isLoading, markAsRead, requestPushNotifications, refreshAlerts } =
    useAlerts();
  const { user, isPro, isAuthenticated } = useAuth();
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  if (!isPro) {
    return <AlertsPreview onNavigate={onNavigate} isAuthenticated={isAuthenticated} />;
  }

  const handleEnablePush = async () => {
    const granted = await requestPushNotifications();
    if (granted) {
      setPushStatus('Push notifications enabled for regional outbreak warnings!');
    } else {
      setPushStatus('Notification permission was dismissed or blocked in browser settings.');
    }
  };

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Bell className="w-3.5 h-3.5 shrink-0" />
          <span>Real-Time Entomological Surveillance</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          Seasonal & Weather-Driven Alerts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Outbreak alerts and meteorological insect activity forecasts for {user?.region || 'UK'}.
        </p>
      </div>

      {/* WEATHER-BASED ACTIVITY RISK FORECAST CARD */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1c1c36] via-[#1a1a2e] to-[#121224] border border-[#2e2e50] shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#28284e] flex items-center justify-center text-amber-400 shrink-0">
              <CloudSun className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Live Weather Intelligence</span>
              <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                Insect Activity — {weatherRisk?.city || 'Regional Center'}
              </h3>
            </div>
          </div>

          <div className={`self-start sm:self-auto px-3 sm:px-4 py-1.5 rounded-full border text-xs font-mono font-bold ${riskColor}`}>
            {weatherRisk?.risk_level || 'Moderate'} Activity
          </div>
        </div>

        {/* Meteorological Metrics */}
        {weatherRisk && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 sm:mb-1">Temperature</span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {weatherRisk.temperature}°C
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 sm:mb-1">Humidity</span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {weatherRisk.humidity}%
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 sm:mb-1">Precipitation</span>
              <span className="font-display font-bold text-sm sm:text-base text-white">
                {weatherRisk.precipitation} mm
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 sm:mb-1">Activity Score</span>
              <span className="font-display font-bold text-sm sm:text-base text-amber-400">
                {weatherRisk.activity_index} / 100
              </span>
            </div>
          </div>
        )}

        {/* Active Threat Species & Recommendations */}
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

      {/* WEB PUSH NOTIFICATION OPT-IN */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1a1a2e] border border-[#2e2e4e] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center justify-center sm:justify-start gap-2">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Enable Outbreak Push Notifications</span>
          </h4>
          <p className="text-xs text-slate-400">
            Receive critical alerts when Asian Hornets, Lyme Ticks, or Venomous Spiders surge in your region.
          </p>
        </div>

        <button
          onClick={handleEnablePush}
          className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-semibold text-xs transition-colors shrink-0 shadow-md active:scale-95 flex items-center justify-center"
        >
          Enable Alerts
        </button>
      </div>

      {pushStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-[#10b981] text-xs text-[#10b981] text-center">
          {pushStatus}
        </div>
      )}

      {/* ALERT FEED */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-display font-bold text-base sm:text-lg text-white">Recent Regional Alerts</h3>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
            <p className="text-xs">Fetching latest warnings...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#1c1c34] border border-slate-800 text-xs text-slate-400">
            No active threat alerts for your region at this time.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all ${
                alert.severity === 'danger'
                  ? 'bg-rose-950/30 border-[#e94560]/60'
                  : alert.severity === 'warning'
                  ? 'bg-amber-950/30 border-[#f5a623]/60'
                  : 'bg-[#1c1c34] border-slate-700'
              } ${!alert.read ? 'ring-1 ring-amber-400/40' : 'opacity-80'}`}
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                  <AlertTriangle
                    className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${
                      alert.severity === 'danger'
                        ? 'text-[#e94560]'
                        : alert.severity === 'warning'
                        ? 'text-[#f5a623]'
                        : 'text-[#2e86ff]'
                    }`}
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-white">{alert.title}</h4>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-slate-300">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Sent {new Date(alert.sent_at).toLocaleDateString()} for region {alert.region}
                    </span>
                  </div>
                </div>

                {!alert.read && (
                  <button
                    onClick={() => markAsRead(alert._id)}
                    className="min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold whitespace-nowrap shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
