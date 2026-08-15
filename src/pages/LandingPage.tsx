import React, { useState } from 'react';
import {
  Camera,
  ShieldAlert,
  HeartPulse,
  Bug,
  BookMarked,
  Bell,
  BookOpen,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { DangerBadge } from '../components/DangerBadge';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activeDemo, setActiveDemo] = useState<'hornet' | 'ladybug' | 'wasp' | 'bee'>('hornet');
  const [imgFallbacks, setImgFallbacks] = useState<Record<string, boolean>>({});

  const demoData = {
    hornet: {
      id: 'hornet',
      name: 'European Hornet (Frelon)',
      latin: 'Vespa crabro • Hymenoptera',
      status: 'dangerous' as const,
      level: 7,
      stings: true,
      bites: true,
      childrenRisk: true,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Vespa_crabro_01.jpg/800px-Vespa_crabro_01.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1588615419957-bf66d53c6b49?auto=format&fit=crop&w=800&q=80',
      summary: 'Large social wasp. Smooth stinger capable of delivering repeated venomous stings. Causes acute burning pain, local edema, and allergic risks.',
      tag: '99.4% Match',
      typeBadge: 'Insecte • Guêpe / Frelon',
      color: '#e94560',
    },
    ladybug: {
      id: 'ladybug',
      name: 'Seven-Spotted Ladybug (Coccinelle)',
      latin: 'Coccinella septempunctata • Coleoptera',
      status: 'safe' as const,
      level: 0,
      stings: false,
      bites: false,
      childrenRisk: false,
      image: 'https://images.unsplash.com/photo-1546768292-fb12f6c92568?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seven-spotted_ladybug_%28Coccinella_septempunctata%29.jpg/800px-Seven-spotted_ladybug_%28Coccinella_septempunctata%29.jpg',
      summary: 'Classic beneficial beetle with scarlet elytra and seven distinct black spots. Consumes up to 50 garden aphids per day. 100% harmless to humans & pets.',
      tag: '99.8% Match',
      typeBadge: 'Insecte • Coléoptère inoffensif',
      color: '#10b981',
    },
    wasp: {
      id: 'wasp',
      name: 'Common Wasp (Guêpe commune)',
      latin: 'Vespula vulgaris • Hymenoptera',
      status: 'dangerous' as const,
      level: 7,
      stings: true,
      bites: true,
      childrenRisk: true,
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vespula_vulgaris_%28Wasp%29.jpg/800px-Vespula_vulgaris_%28Wasp%29.jpg',
      summary: 'Aggressive picnic scavenger and nest defender with black and yellow abdomen bands. Delivers repeated defensive stings requiring cold compression.',
      tag: '99.1% Match',
      typeBadge: 'Insecte • Vespidae venimeux',
      color: '#f5a623',
    },
    bee: {
      id: 'bee',
      name: 'Western Honeybee (Abeille)',
      latin: 'Apis mellifera • Hymenoptera',
      status: 'useful' as const,
      level: 2,
      stings: true,
      bites: false,
      childrenRisk: false,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Apis_mellifera_Western_honey_bee.jpg/800px-Apis_mellifera_Western_honey_bee.jpg',
      summary: 'Crucial pollinator with fuzzy amber-brown body and pollen baskets on hind legs. Docile and stings solely when directly provoked or defending hive.',
      tag: '99.7% Match',
      typeBadge: 'Insecte • Pollinisateur protégé',
      color: '#3b82f6',
    },
  };

  const currentMock = demoData[activeDemo];

  const features = [
    {
      icon: Camera,
      title: '1. AI Identification',
      desc: 'Identify any insect from a single photo in seconds using cutting-edge Claude Vision neural models.',
      color: 'text-[#10b981]',
      border: 'hover:border-[#10b981]/50',
    },
    {
      icon: ShieldAlert,
      title: '2. Danger Assessment',
      desc: "Know instantly if it's venomous, harmless or a pest with scientific 0–10 risk ratings.",
      color: 'text-[#e94560]',
      border: 'hover:border-[#e94560]/50',
    },
    {
      icon: HeartPulse,
      title: '3. First Aid Guide',
      desc: 'What to do if stung or bitten — symptom triage, remedies, and when to seek emergency care.',
      color: 'text-rose-400',
      border: 'hover:border-rose-400/50',
    },
    {
      icon: Bug,
      title: '4. Pest Control Guide',
      desc: 'Identify home infestations, compare DIY vs pro exterminator costs, and get organic remedies.',
      color: 'text-[#f5a623]',
      border: 'hover:border-[#f5a623]/50',
    },
    {
      icon: BookMarked,
      title: '5. Observation Journal',
      desc: 'Log every insect found with private GPS location, field notes, and interactive map pins.',
      color: 'text-[#2e86ff]',
      border: 'hover:border-[#2e86ff]/50',
    },
    {
      icon: Bell,
      title: '6. Seasonal Alerts',
      desc: 'Get notified when dangerous species and invasive hornets or ticks are active in your region.',
      color: 'text-amber-400',
      border: 'hover:border-amber-400/50',
    },
    {
      icon: BookOpen,
      title: '7. Encyclopedia',
      desc: 'Complete insect database for UK, US, Canada, Australia and Europe with Top 10 lists.',
      color: 'text-purple-400',
      border: 'hover:border-purple-400/50',
    },
    {
      icon: WifiOff,
      title: '8. Offline Access',
      desc: 'Works in the field as an installable PWA with offline caching for remote hiking trails.',
      color: 'text-teal-400',
      border: 'hover:border-teal-400/50',
    },
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* HERO SECTION */}
      <section className="relative pt-6 md:pt-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242448] border border-[#3c3c6f] text-slate-200 text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
                <span>AI-Powered Entomological Vision</span>
              </div>

              {/* Title */}
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]">
                Identify any insect in seconds —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] via-[#f5a623] to-[#10b981]">
                  is it dangerous?
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
                AI-powered insect identification for your safety. Venomous, harmless or pest — know before it's too late.
              </p>

              {/* CTA Buttons & Guarantee */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => onNavigate('pricing')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#f5a623] hover:from-rose-600 hover:to-amber-500 text-white font-display font-bold text-base shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 active:scale-98 transition-all flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Start identifying — $4.99/mo
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('scan')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#242446] hover:bg-[#2e2e58] border border-[#3b3b6e] text-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-[#10b981]" />
                  Try Live Scanner
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span className="font-medium text-slate-200">48h money-back guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant 2-second scan results</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2e86ff]" />
                  <span>UK, US, CA, AU & EU species</span>
                </div>
              </div>
            </div>

            {/* Right Mockup & Interactive Scan Result Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-[32px] p-3 bg-gradient-to-b from-[#2e2e54] to-[#161628] border-2 border-[#3d3d6e] shadow-2xl shadow-black/80">
                {/* Mock Phone Status Header */}
                <div className="flex items-center justify-between px-3 py-1 text-[11px] text-slate-400 mb-2">
                  <span className="font-bold text-white">The Insect Guide</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                    <span>Claude Vision Live</span>
                  </div>
                </div>

                {/* Scan Image Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0c0c18] border border-slate-700/80 shadow-2xl group">
                  {/* High Resolution Macro Insect Photograph */}
                  <img
                    key={currentMock.id + (imgFallbacks[currentMock.id] ? '-fallback' : '')}
                    src={imgFallbacks[currentMock.id] ? currentMock.fallbackImage : currentMock.image}
                    alt={currentMock.name}
                    onError={() => {
                      if (!imgFallbacks[currentMock.id]) {
                        setImgFallbacks(prev => ({ ...prev, [currentMock.id]: true }));
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />

                  {/* Subtle gradient vignette for contrast and legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Danger Badge on top right */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <DangerBadge status={currentMock.status} dangerLevel={currentMock.level} size="sm" />
                  </div>

                  {/* Match Confidence Tag on top left */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentMock.tag}</span>
                  </div>

                  {/* Bottom Specimen Classification Ribbon */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-slate-700/60 text-[10px] font-medium text-slate-200">
                    {currentMock.typeBadge}
                  </div>

                  {/* Clean Optical Viewfinder Corners */}
                  <div className="absolute inset-3 pointer-events-none">
                    <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400/90 rounded-tl" />
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400/90 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400/90 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400/90 rounded-br" />
                  </div>
                </div>

                {/* Mock Result Card */}
                <div className="mt-3 p-3.5 bg-[#1e1e36] rounded-xl border border-slate-700/80 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-white text-base leading-tight">
                        {currentMock.name}
                      </h4>
                      <p className="text-xs italic text-slate-400">{currentMock.latin}</p>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/40 text-amber-300">
                      Risk {currentMock.level}/10
                    </span>
                  </div>

                  {/* Danger progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Danger Index</span>
                      <span className="font-bold text-white">{currentMock.level * 10}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          currentMock.level >= 7
                            ? 'bg-[#e94560]'
                            : currentMock.level >= 4
                            ? 'bg-[#f5a623]'
                            : 'bg-[#10b981]'
                        }`}
                        style={{ width: `${Math.max(5, currentMock.level * 10)}%` }}
                      />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-slate-700">
                      {currentMock.stings ? '⚠️ Stings' : 'No Sting'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-slate-700">
                      {currentMock.bites ? '🩸 Can Bite' : 'No Bite'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        currentMock.childrenRisk
                          ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                          : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      }`}
                    >
                      {currentMock.childrenRisk ? 'Pet/Child Alert' : 'Safe for Children & Pets'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {currentMock.summary}
                  </p>
                </div>

                {/* Quick Sample Selector */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-slate-400">Test specimen:</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setActiveDemo('hornet')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeDemo === 'hornet'
                          ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/30 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Frelon
                    </button>
                    <button
                      onClick={() => setActiveDemo('ladybug')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeDemo === 'ladybug'
                          ? 'bg-[#10b981] text-black shadow-md shadow-[#10b981]/30 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Coccinelle
                    </button>
                    <button
                      onClick={() => setActiveDemo('wasp')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeDemo === 'wasp'
                          ? 'bg-[#f5a623] text-black shadow-md shadow-[#f5a623]/30 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Guêpe
                    </button>
                    <button
                      onClick={() => setActiveDemo('bee')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeDemo === 'bee'
                          ? 'bg-[#3b82f6] text-white shadow-md shadow-[#3b82f6]/30 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Abeille
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 FEATURE CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white">
            Everything you need for insect safety & awareness
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered for homeowners, parents, pet owners, gardeners, and hikers across the UK, North America, Australia, and Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-[#1c1c34] border border-[#2c2c4e] ${item.border} transition-all hover:-translate-y-1 hover:shadow-xl group`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#242448] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#202042] via-[#2a1a3e] to-[#1a2d3e] p-8 md:p-12 border border-[#3b3b6e] text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-[#10b981]">
              Instant Access Anywhere
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
              Protect your family & home from harmful pests today
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join thousands of outdoor explorers and homeowners who identify venomous species, ticks, hornets, and household infestations in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-black font-display font-bold text-base shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Subscribe Now — $4.99/mo
            </button>
            <button
              onClick={() => onNavigate('encyclopedia')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#141424] hover:bg-black/60 border border-slate-700 text-slate-200 text-sm font-semibold transition-all"
            >
              Browse Species Database
            </button>
          </div>

          <p className="text-xs text-slate-400">
            48-hour unconditional money-back guarantee on your first subscription payment.
          </p>
        </div>
      </section>
    </div>
  );
};
