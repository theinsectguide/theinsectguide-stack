import React, { useState } from 'react';
import { DangerBadge } from '../DangerBadge';
import {
  BookOpen,
  Search,
  Filter,
  Globe,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Info,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface EncyclopediaPreviewProps {
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
}

export const EncyclopediaPreview: React.FC<EncyclopediaPreviewProps> = ({ onNavigate, isAuthenticated }) => {
  const unlockAction = () => onNavigate('pricing');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const regions = ['All', 'UK', 'US', 'CA', 'AU', 'EU'];
  const categories = ['All', 'Venomous', 'Dangerous', 'Harmless', 'Pest', 'Protected', 'Useful'];

  const sampleSpecies = [
    {
      id: 'asian-hornet',
      common_name: 'Asian Hornet',
      scientific_name: 'Vespa velutina nigrithorax',
      danger_status: 'dangerous' as const,
      danger_level: 9,
      category: 'Venomous',
      region: 'UK & EU',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Vespa_crabro_01.jpg/800px-Vespa_crabro_01.jpg',
      firstLines: 'Invasive predatory hornet with a velvety dark brown thorax, yellow tipped legs, and a prominent orange segment on the abdomen. Highly destructive predator of domestic honeybee colonies.',
      blurredDetails: 'Venom contains mastoparan peptides that trigger severe allergic cytolysis. Emergency triage requires immediate cold compression and epinephrine preparedness for allergic individuals.',
    },
    {
      id: 'seven-spot-ladybird',
      common_name: 'Seven-Spot Ladybird',
      scientific_name: 'Coccinella septempunctata',
      danger_status: 'useful' as const,
      danger_level: 0,
      category: 'Useful',
      region: 'Worldwide',
      image: 'https://images.unsplash.com/photo-1546768292-fb12f6c92568?auto=format&fit=crop&w=800&q=80',
      firstLines: 'Classic beneficial beetle with scarlet elytra and seven distinct black spots. Consumes up to 50 aphids per day, making it an essential organic garden ally.',
      blurredDetails: 'Secretes reflex bleeding reflex fluid (alkaloid coccinelline) when threatened by birds. 100% harmless to humans, children, and domestic pets.',
    },
    {
      id: 'european-wasp',
      common_name: 'Common Wasp',
      scientific_name: 'Vespula vulgaris',
      danger_status: 'dangerous' as const,
      danger_level: 6,
      category: 'Venomous',
      region: 'UK, EU, US, AU',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      firstLines: 'Social vespid wasp with distinct black and yellow abdominal banding and an anchor-shaped mark on the face. Builds underground and attic paper nests.',
      blurredDetails: 'Capable of repeated defensive venom injection without losing its stinger. Venom contains phospholipase A1 inducing acute burning erythema.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 md:py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Global Insect & Venom Encyclopedia Preview</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Explore complete species profiles for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
            UK, US, CA, AU & EU
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Access high-resolution macroscopic photography, anatomical keys, venom toxicity chemistry, seasonal flight charts, and national Top 10 rankings.
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

      {/* Filter Bars Preview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#17172c] border border-slate-700/80 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            Filter by Country & Category
          </span>
          <span className="text-xs text-slate-400">100+ species in full database</span>
        </div>

        {/* Region Pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 self-center mr-1">Region:</span>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedRegion === r
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-[#121224] text-slate-300 hover:bg-[#1a1a36]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800">
          <span className="text-xs text-slate-400 self-center mr-1">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === c
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-[#121224] text-slate-300 hover:bg-[#1a1a36]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 2-3 Specimen Cards Preview (Content blurred after the first 3 lines, No Photos) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            Sample Encyclopedia Entries (Preview)
          </h3>
          <span className="text-xs text-purple-400 font-semibold">3 specimen previews</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleSpecies.map((species) => (
            <div
              key={species.id}
              className="rounded-2xl sm:rounded-3xl bg-[#17172c] border border-slate-700/80 overflow-hidden shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Header Info without Photo */}
                <div className="p-4 sm:p-5 pb-3 border-b border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-purple-500/20 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                        {species.region}
                      </span>
                      <h4 className="font-display font-bold text-base sm:text-lg text-white">
                        {species.common_name}
                      </h4>
                      <p className="text-xs text-slate-400 italic">{species.scientific_name}</p>
                    </div>
                    <DangerBadge status={species.danger_status} dangerLevel={species.danger_level} size="sm" />
                  </div>
                </div>

                {/* Visible 3 Lines of Content */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {species.firstLines}
                  </p>
                </div>

                {/* Blurred Content After 3 Lines with Lock Overlay */}
                <div className="relative px-4 pb-4">
                  <div className="filter blur-[4px] select-none pointer-events-none opacity-30 p-2.5 rounded-xl bg-[#121224] text-[11px] text-slate-300 space-y-1.5">
                    <p className="font-bold text-rose-400">Venom Chemistry & Toxicity Rating:</p>
                    <p>{species.blurredDetails}</p>
                    <p className="font-bold text-amber-400">Emergency Protocol & First Aid:</p>
                    <p>Immediate clinical guidelines and poison center hotline escalation thresholds.</p>
                  </div>

                  {/* Frosted Button */}
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <button
                      onClick={unlockAction}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isAuthenticated ? 'Subscribe to unlock' : 'Unlock — $4.99/mo'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#121224] border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Category: {species.category}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  Full Guide <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
