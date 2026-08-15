import React from 'react';
import { DangerBadge } from '../DangerBadge';
import {
  Camera,
  Sparkles,
  ShieldAlert,
  HeartPulse,
  Info,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Skull,
} from 'lucide-react';

interface ScanPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const ScanPreview: React.FC<ScanPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Claude Vision AI Scanner Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Identify any insect in seconds —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400">
            is it dangerous?
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload any photo from your phone or camera to get instant 0–10 venom toxicity scoring, emergency first aid triage, and pediatric safety warnings.
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

      {/* Interactive Photo Upload Teaser */}
      <div
        onClick={unlockAction}
        className="cursor-pointer rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-[#17172c]/90 p-6 sm:p-8 text-center space-y-4 transition-all hover:bg-[#1a1a36] shadow-xl group"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <Camera className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            Take or upload a photo to identify
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click here to unlock unlimited scans. Compatible with JPG, PNG, WEBP and mobile live camera.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
          <Lock className="w-3.5 h-3.5" />
          <span>Unlock Live Scanner — $4.99/mo</span>
        </div>
      </div>

      {/* Realistic Mockup of a Scan Result (Example: European Garden Spider / Araneus diadematus) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Sample Scan Result (Preview)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
            99.4% AI Match Confidence
          </span>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[#17172c] border border-slate-700/80 overflow-hidden shadow-2xl">
          {/* Specimen Header & Visual Scan Box */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center border-b border-slate-800">
            <div className="md:col-span-4 relative aspect-square rounded-2xl overflow-hidden bg-black border border-slate-700">
              {/* European Garden Spider (Araneus diadematus / Épeire diadème) sample image */}
              <img
                src="/garden_spider.jpg"
                alt="European Garden Spider (Araneus diadematus / Épeire diadème)"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Scan overlay corners */}
              <div className="absolute inset-2 pointer-events-none">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br" />
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-emerald-400">
                SCANNED
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                    European Garden Spider (Épeire diadème)
                  </h2>
                  <p className="text-xs text-slate-400 italic">Araneus diadematus • Araneidae</p>
                </div>
                <DangerBadge status="mildly_venomous" dangerLevel={3} size="md" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#121224] rounded-xl border border-slate-800 text-xs">
                <div className="p-1.5">
                  <span className="text-[10px] text-slate-400 block">Stings / Bites</span>
                  <span className="font-bold text-amber-400">Rare (Defensive)</span>
                </div>
                <div className="p-1.5 border-x border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Venom Score</span>
                  <span className="font-bold text-yellow-400">3 / 10 (Low)</span>
                </div>
                <div className="p-1.5">
                  <span className="text-[10px] text-slate-400 block">Children Risk</span>
                  <span className="font-bold text-emerald-400">Safe / Low</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Large orb-weaving spider characterized by a distinctive white cross pattern on the dorsal abdomen. Highly beneficial predator of garden flies and mosquitoes.
              </p>
            </div>
          </div>

          {/* FLOUTÉ / MASQUÉ: Critical Safety & First Aid Intelligence */}
          <div className="relative p-5 sm:p-7 space-y-5">
            {/* Blurred Content Behind Lock */}
            <div className="filter blur-[5px] select-none pointer-events-none opacity-40 space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30">
                <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4" />
                  Emergency First Aid Protocol & Venom Neutralization
                </h4>
                <p className="text-xs text-slate-300 mt-2">
                  1. Wash bite site thoroughly with antiseptic soap. 2. Apply cold ice compress for 15 minutes to reduce localized edema. 3. Monitor for allergic anaphylaxis or secondary bacterial infection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121224] border border-slate-800">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Dangerous Look-Alikes & Differentiation Key
                </h4>
                <p className="text-xs text-slate-300 mt-2">
                  Crucial distinctions vs Noble False Widow (Steatoda nobilis) and Black Widow (Latrodectus mactans). Detailed abdominal chevron patterns and web geometry markers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121224] border border-slate-800">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Habitat, Aggression Triggers & Nest Relocation
                </h4>
                <p className="text-xs text-slate-300 mt-2">
                  Safe humane removal procedures for decks, patios, and children playgrounds without killing the beneficial predator.
                </p>
              </div>
            </div>

            {/* Glowing Unlock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#17172c] via-[#17172c]/95 to-transparent text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Unlock Complete Insect Intelligence
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-4">
                Access full venom breakdowns, bite first-aid steps, toxic look-alikes, and unlimited live photo scans.
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
