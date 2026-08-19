import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FirstAidPreview } from '../components/previews/FirstAidPreview';
import {
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const FirstAidPage: React.FC<{ onNavigate?: (tab: string) => void; onGoBack?: () => void }> = ({ onNavigate = () => {}, onGoBack }) => {
  const { user, isPro, isAuthenticated } = useAuth();
  const currentRegion = user?.region || 'UK';

  // Triage state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 'result'>(1);
  const [bodyPart, setBodyPart] = useState<'face_neck' | 'limbs' | 'torso' | ''>('');
  const [painLevel, setPainLevel] = useState<number>(4);
  const [hasStinger, setHasStinger] = useState<boolean>(false);
  const [criticalSymptoms, setCriticalSymptoms] = useState<string[]>([]);
  const [hasAllergy, setHasAllergy] = useState<boolean>(false);
  const [victimAge, setVictimAge] = useState<'infant' | 'child' | 'adult' | 'senior'>('adult');

  if (!isPro) {
    return <FirstAidPreview onNavigate={onNavigate} isAuthenticated={isAuthenticated} />;
  }

  const emergencyContacts = {
    UK: { nonEmergency: '111 (NHS)', poison: '0344 892 0111' },
    US: { nonEmergency: '311', poison: '1-800-222-1222' },
    CA: { nonEmergency: '811', poison: '1-844-POISON-X' },
    AU: { nonEmergency: '13 11 26', poison: '13 11 26' },
    EU: { nonEmergency: '116 117', poison: '112' },
    Other: { nonEmergency: 'Local hotline', poison: 'Local emergency' },
  };

  const contacts = emergencyContacts[currentRegion] || emergencyContacts['UK'];

  const toggleCriticalSymptom = (sym: string) => {
    setCriticalSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // Evaluate Triage
  const isImmediateEmergency =
    bodyPart === 'face_neck' ||
    criticalSymptoms.length > 0 ||
    (hasAllergy && painLevel >= 6);

  const isDoctorConsult =
    !isImmediateEmergency &&
    (painLevel >= 7 ||
      victimAge === 'infant' ||
      victimAge === 'child' ||
      hasStinger);

  const resetTriage = () => {
    setStep(1);
    setBodyPart('');
    setPainLevel(4);
    setHasStinger(false);
    setCriticalSymptoms([]);
    setHasAllergy(false);
    setVictimAge('adult');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-[#e94560]/40 text-[#e94560] text-xs font-semibold">
          <HeartPulse className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>Emergency Triage & First Aid Assistant</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          Bite & Sting Triage Protocol
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Immediate step-by-step assessment guide for insect stings, spider bites, ticks, and envenomation.
        </p>
      </div>

      {/* INTERACTIVE TRIAGE WIZARD */}
      <div className="bg-[#1c1c34] border border-[#2d2d4e] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-5 h-5 text-[#2e86ff] shrink-0" />
            <h3 className="font-display font-bold text-sm sm:text-base md:text-lg text-white truncate">
              Symptom Assessment
            </h3>
          </div>
          {step === 'result' ? (
            <button
              onClick={resetTriage}
              className="text-xs text-[#2e86ff] hover:underline flex items-center gap-1 font-semibold min-h-[36px] px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-mono shrink-0">Step {step} of 4</span>
          )}
        </div>

        {/* STEP 1: Body Part */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <label className="block text-xs sm:text-sm font-semibold text-white">
              Where on the body did the sting or bite occur?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <button
                onClick={() => setBodyPart('face_neck')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all min-h-[50px] ${
                  bodyPart === 'face_neck'
                    ? 'bg-rose-950/60 border-[#e94560] text-white shadow-lg'
                    : 'bg-[#141424] border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-[11px] font-bold block text-rose-400 mb-0.5">High Risk Zone</span>
                <span className="font-display font-semibold text-xs sm:text-sm block text-white">Face, Neck or Mouth</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">Risk of airway constriction</span>
              </button>

              <button
                onClick={() => setBodyPart('limbs')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all min-h-[50px] ${
                  bodyPart === 'limbs'
                    ? 'bg-[#242444] border-[#2e86ff] text-white shadow-lg'
                    : 'bg-[#141424] border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-[11px] font-bold block text-[#2e86ff] mb-0.5">Standard Zone</span>
                <span className="font-display font-semibold text-xs sm:text-sm block text-white">Arm, Hand, Leg or Foot</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">Extremities</span>
              </button>

              <button
                onClick={() => setBodyPart('torso')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all min-h-[50px] ${
                  bodyPart === 'torso'
                    ? 'bg-[#242444] border-[#2e86ff] text-white shadow-lg'
                    : 'bg-[#141424] border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-[11px] font-bold block text-[#2e86ff] mb-0.5">Standard Zone</span>
                <span className="font-display font-semibold text-xs sm:text-sm block text-white">Chest, Back or Torso</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">Central body</span>
              </button>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                disabled={!bodyPart}
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#2e86ff] hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all min-h-[44px]"
              >
                <span>Next: Pain & Local Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Pain & Stinger */}
        {step === 2 && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Pain level (1 to 10): <span className="font-bold text-amber-400 font-mono text-sm sm:text-base">{painLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1: Mild itch</span>
                <span>5: Sharp sting</span>
                <span>10: Severe pain</span>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Is there a stinger or insect mouthpart stuck in the skin?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={() => setHasStinger(true)}
                  className={`py-3 px-3.5 rounded-xl border text-xs font-semibold min-h-[44px] text-left sm:text-center ${
                    hasStinger ? 'bg-rose-950/60 border-[#e94560] text-white' : 'bg-[#141424] border-slate-700 text-slate-300'
                  }`}
                >
                  Yes, stinger/tick is embedded
                </button>
                <button
                  onClick={() => setHasStinger(false)}
                  className={`py-3 px-3.5 rounded-xl border text-xs font-semibold min-h-[44px] text-left sm:text-center ${
                    !hasStinger ? 'bg-emerald-950/60 border-[#10b981] text-white' : 'bg-[#141424] border-slate-700 text-slate-300'
                  }`}
                >
                  No visible stinger
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 min-h-[44px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 min-h-[44px]"
              >
                <span>Next: Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Critical Symptoms */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <label className="block text-xs sm:text-sm font-semibold text-white">
              Select any systemic symptoms if present:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Difficulty breathing / wheezing',
                'Throat tightness or swallowing trouble',
                'Swelling of lips, tongue or eyes',
                'Dizziness, lightheadedness or confusion',
                'Nausea, vomiting or abdominal cramps',
                'Widespread hives / severe spreading rash',
                'Rapid heart rate or fainting',
              ].map((sym, i) => {
                const isSelected = criticalSymptoms.includes(sym);
                return (
                  <button
                    key={i}
                    onClick={() => toggleCriticalSymptom(sym)}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between min-h-[44px] ${
                      isSelected
                        ? 'bg-rose-950/80 border-[#e94560] text-rose-200 font-semibold shadow-md'
                        : 'bg-[#141424] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="pr-2">{sym}</span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                        isSelected ? 'bg-[#e94560] border-[#e94560] text-white' : 'border-slate-600'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 min-h-[44px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 min-h-[44px]"
              >
                <span>Next: History</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: History & Age */}
        {step === 4 && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Victim Age Group:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['infant', 'child', 'adult', 'senior'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setVictimAge(a)}
                    className={`py-2.5 px-2 rounded-xl border text-xs capitalize font-medium min-h-[44px] text-center ${
                      victimAge === a
                        ? 'bg-[#242444] border-[#2e86ff] text-white'
                        : 'bg-[#141424] border-slate-700 text-slate-300'
                    }`}
                  >
                    {a === 'infant' ? 'Infant (<1)' : a === 'child' ? 'Child (1-12)' : a === 'adult' ? 'Adult (13-64)' : 'Senior (65+)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Known history of severe insect venom allergy (Anaphylaxis)?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setHasAllergy(true)}
                  className={`py-3 px-3 rounded-xl border text-xs font-semibold min-h-[44px] text-left sm:text-center ${
                    hasAllergy ? 'bg-rose-950/60 border-[#e94560] text-white' : 'bg-[#141424] border-slate-700 text-slate-300'
                  }`}
                >
                  Yes (Carries auto-injector or allergy history)
                </button>
                <button
                  onClick={() => setHasAllergy(false)}
                  className={`py-3 px-3 rounded-xl border text-xs font-semibold min-h-[44px] text-left sm:text-center ${
                    !hasAllergy ? 'bg-emerald-950/60 border-[#10b981] text-white' : 'bg-[#141424] border-slate-700 text-slate-300'
                  }`}
                >
                  No known severe allergy
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 min-h-[44px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep('result')}
                className="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] hover:brightness-110 text-white font-display font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 min-h-[44px]"
              >
                <span>Generate Triage</span>
                <HeartPulse className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TRIAGE RESULT SUMMARY */}
        {step === 'result' && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            {isImmediateEmergency ? (
              <div className="p-4 sm:p-6 rounded-2xl bg-rose-950/80 border-2 border-[#e94560] text-white space-y-3.5 shadow-2xl">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#e94560] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-rose-300 font-bold">
                      Critical Alert Level
                    </span>
                    <h4 className="font-display font-black text-lg sm:text-xl text-white">
                      URGENT MEDICAL ATTENTION REQUIRED
                    </h4>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                  Systemic symptoms or facial/neck involvement indicate potential anaphylaxis or severe reaction. Seek emergency medical care immediately.
                </p>

                <div className="p-3.5 sm:p-4 rounded-xl bg-black/50 border border-rose-800 space-y-1.5 text-xs">
                  <span className="font-bold text-white block">Immediate Action Protocol:</span>
                  <ul className="list-disc list-inside space-y-1 text-rose-200">
                    <li>Contact emergency medical services immediately for ambulance transport.</li>
                    <li>If an Epinephrine auto-injector is available and prescribed, administer into the outer thigh without delay.</li>
                    <li>Sit upright if experiencing breathing trouble, or lie flat with legs elevated if faint or dizzy.</li>
                    <li>Loosen tight clothing around neck and waist.</li>
                  </ul>
                </div>
              </div>
            ) : isDoctorConsult ? (
              <div className="p-4 sm:p-6 rounded-2xl bg-amber-950/70 border-2 border-[#f5a623] text-white space-y-3.5 shadow-2xl">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#f5a623] text-black flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 font-bold">
                      Moderate Risk Level
                    </span>
                    <h4 className="font-display font-black text-lg sm:text-xl text-white">
                      CONSULT A MEDICAL PROFESSIONAL
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-amber-100 leading-relaxed">
                  Elevated pain level or high vulnerability group (child/infant). Clinical assessment recommended.
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-amber-800 space-y-1 text-xs text-amber-200">
                  <span className="font-bold text-white block">Advisory Contact:</span>
                  <p>
                    Non-emergency advice: <strong className="text-white">{contacts.nonEmergency}</strong> | Poison Information: <strong className="text-white">{contacts.poison}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 rounded-2xl bg-emerald-950/70 border-2 border-[#10b981] text-white space-y-3.5 shadow-2xl">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#10b981] text-black flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-bold">
                      Low Risk / Localized Reaction
                    </span>
                    <h4 className="font-display font-black text-lg sm:text-xl text-white">
                      SAFE HOME CARE & MONITORING
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-emerald-100 leading-relaxed">
                  No systemic alarm symptoms detected. Follow standard hygienic first aid to relieve localized pain, itching, and mild swelling.
                </p>
              </div>
            )}

            {/* Standard Step-by-step First Aid Protocol */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                Standard First Aid Steps:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#141426] border border-slate-800 space-y-1">
                  <span className="font-bold text-white block text-xs">1. Remove Stinger / Tick</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Scrape sideways with a card edge or fingernail. Never squeeze venom sacs. For ticks, grasp close to skin and pull straight out.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#141426] border border-slate-800 space-y-1">
                  <span className="font-bold text-white block text-xs">2. Clean & Disinfect</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Wash puncture area with soap and warm water to prevent secondary bacterial skin infections.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#141426] border border-slate-800 space-y-1">
                  <span className="font-bold text-white block text-xs">3. Cold Compress</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Apply a clean, cold cloth or wrapped ice pack for 10-15 minutes to reduce localized swelling and soothe nerves.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#141426] border border-slate-800 space-y-1">
                  <span className="font-bold text-white block text-xs">4. Elevate & Soothe</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Elevate affected limb. Topical hydrocortisone or oral antihistamines can help reduce itching.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Systematic Medical Disclaimer */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-slate-800 text-[11px] sm:text-xs text-slate-400 text-center leading-relaxed">
        <strong className="text-amber-400">Medical Disclaimer:</strong> For educational purposes only. Always consult emergency medical professionals if an allergic reaction, venomous bite, or infection is suspected.
      </div>
    </div>
  );
};
