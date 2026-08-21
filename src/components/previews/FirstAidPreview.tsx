import React from 'react';
import {
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lock,
  PhoneCall,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface FirstAidPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const FirstAidPreview: React.FC<FirstAidPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');

  const coveredEmergencies = [
    { title: 'Asian & European Hornet Stings', desc: 'Multiple stings, venom mass injection, localized necrosis, mastoparan peptide triage.', risk: 'Critical' },
    { title: 'Tick Bites & Lyme Disease (Erythema Migrans)', desc: 'Safe mechanical nymph extraction, 30-day symptom tracking, Borrelia infection indicators.', risk: 'High' },
    { title: 'Spider Bites (False Widow / Brown Recluse)', desc: 'Necrotic lesion vs bacterial infection differentiation, venom immobilization.', risk: 'High' },
    { title: 'Wasp & Honeybee Stings', desc: 'Stinger extraction technique without venom sac compression, ice pack timing.', risk: 'Medium' },
    { title: 'Oak Processionary Moth Dermatitis', desc: 'Thaumetopoein urticating setae removal with tape strips, ocular exposure triage.', risk: 'High' },
    { title: 'Anaphylaxis & Allergic Shock', desc: 'Emergency EpiPen auto-injector protocol, airway swelling detection, 999/911/112 hotline.', risk: 'Emergency' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Emergency First Aid Triage Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Clinical sting & bite{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400">
            emergency triage
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Interactive step-by-step medical questionnaires, symptom evaluation, stinger removal protocols, and international poison center hotlines.
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

      {/* Covered Emergencies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Covered Emergencies & Clinical Protocols</span>
          </h3>
          <span className="text-xs text-slate-400">6 major categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coveredEmergencies.map((item, i) => (
            <div
              key={i}
              onClick={unlockAction}
              className="cursor-pointer p-4 rounded-2xl bg-[#17172c] border border-slate-700/80 hover:border-rose-500/50 transition-all space-y-2 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {item.risk}
                </span>
                <HeartPulse className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="font-display font-bold text-sm text-white group-hover:text-rose-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blurred Interactive Triage Questionnaire */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            Interactive Triage Simulator (Preview)
          </span>
          <span className="text-xs text-emerald-400 font-semibold">Step 1 of 4</span>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[#17172c] border border-slate-700/80 overflow-hidden shadow-2xl">
          {/* Visible Question 1 */}
          <div className="p-5 sm:p-7 border-b border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Question 1 / 4:</span>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white mt-1">
                Where did the bite or sting occur on the body?
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-center">
                Face, Lips or Throat
              </div>
              <div className="p-3 rounded-xl bg-[#121224] border border-slate-800 text-slate-300 text-center">
                Limbs (Arms/Legs)
              </div>
              <div className="p-3 rounded-xl bg-[#121224] border border-slate-800 text-slate-300 text-center">
                Torso / Body
              </div>
            </div>
          </div>

          {/* FLOUTÉ / MASQUÉ: Clinical Medical Assessment & Hotline Escalation */}
          <div className="relative p-5 sm:p-7 space-y-5">
            <div className="filter blur-[5px] select-none pointer-events-none opacity-40 space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
                <h4 className="font-bold text-sm text-rose-300">
                  Critical Emergency Recommendation (SAMU 15 / 999 / 911)
                </h4>
                <p className="text-xs text-slate-300 mt-1.5">
                  Facial and airway stings present high acute obstruction hazard. Maintain seated posture, administer sublingual antihistamine immediately, and prepare auto-injector if throat tightness develops.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#121224] border border-slate-800">
                  <span className="font-bold text-emerald-300 block">Antihistamine Dosage</span>
                  <span className="text-slate-400">Cetirizine 10mg / Loratadine 10mg</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121224] border border-slate-800">
                  <span className="font-bold text-amber-300 block">Poison Hotline</span>
                  <span className="text-slate-400">Direct instant emergency bridge</span>
                </div>
              </div>
            </div>

            {/* Unlock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#17172c] via-[#17172c]/95 to-transparent text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <Lock className="w-6 h-6 text-rose-400" />
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Unlock Complete Medical Triage Guides
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-4">
                Access interactive clinical decision flows, poison control integration, and venom neutralization steps.
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
