import React from 'react';
import {
  BookMarked,
  MapPin,
  Download,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface JournalPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const JournalPreview: React.FC<JournalPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Private Field Observation Journal Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Track, log & map every{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400">
            insect encounter
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Record sightings with offline GPS pinning, capture high-res field notes, and export official printable PDF journals for hiking logs and home safety.
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

      {/* Interactive Map Teaser with Blurred Coordinates */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#17172c] border border-slate-700/80 shadow-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-white">
              Interactive GPS Field Map
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
              3 Sighting Pins Recorded
            </span>
            <button
              onClick={unlockAction}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Map Canvas with Blurred Markers Overlay */}
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#0e0e1c] border border-slate-800 flex items-center justify-center">
          {/* Simulated stylized satellite/terrain map */}
          <div className="absolute inset-0 bg-[radial-gradient(#2e86ff15_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d30_1px,transparent_1px),linear-gradient(to_bottom,#1f293d30_1px,transparent_1px)] bg-[size:48px_48px]" />

          {/* Fictitious blurred marker pins on map */}
          <div className="absolute top-1/4 left-1/3 filter blur-[4px] pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Asian Hornet Nest [Lat 50.842° N]</span>
            </div>
          </div>
          <div className="absolute bottom-1/3 right-1/4 filter blur-[4px] pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <span>Seven-Spot Ladybird [51.507° N]</span>
            </div>
          </div>
          <div className="absolute top-1/2 right-1/3 filter blur-[4px] pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <span>False Widow [52.205° N]</span>
            </div>
          </div>

          {/* Center Lock Callout */}
          <div className="relative z-10 p-6 rounded-2xl bg-[#141428]/90 backdrop-blur-md border border-emerald-500/40 text-center max-w-sm mx-4 shadow-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-display font-bold text-sm sm:text-base text-white">
              Unlock GPS Pinning & Geo-tracking
            </h4>
            <p className="text-xs text-slate-300">
              Save exact coordinates, map venom hot spots, and download high-resolution PDF field reports.
            </p>
            <button
              onClick={unlockAction}
              className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-emerald-500 text-black font-extrabold text-xs shadow-lg transition-all"
            >
              {isAuthenticated ? 'Subscribe to unlock' : 'Unlock — $4.99/mo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
