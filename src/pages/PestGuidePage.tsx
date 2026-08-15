import React, { useState } from 'react';
import {
  ShieldAlert,
  Bug,
  AlertTriangle,
  Home,
  CheckCircle2,
  DollarSign,
  Wrench,
  Sparkles,
  Search,
  Filter,
  Leaf,
  Layers,
} from 'lucide-react';

interface PestItem {
  id: string;
  name: string;
  latin: string;
  category: 'Structural' | 'Biting / Parasite' | 'Food & Pantry' | 'Fabric' | 'Garden';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  diy: boolean;
  signs: string[];
  treatment: string[];
  naturalRemedy: string;
  prevention: string;
  exterminatorCost: string;
  image: string;
}

export const PestGuidePage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalPest, setActiveModalPest] = useState<PestItem | null>(null);

  const pests: PestItem[] = [
    {
      id: 'bed-bugs',
      name: 'Bed Bugs',
      latin: 'Cimex lectularius',
      category: 'Biting / Parasite',
      urgency: 'Critical',
      diy: false,
      signs: [
        'Linear clusters of itchy red bites on arms and neck',
        'Rust-colored fecal spots on mattress seams and sheets',
        'Sweet, musty almond-like odor in heavy infestations',
        'Discarded translucent molted exoskeletons in headboards',
      ],
      treatment: [
        'Wash all bedding and fabrics in hot water (minimum 60°C / 140°F) and dry on high heat for 45 minutes.',
        'Encase mattresses and box springs in certified bed bug-proof zip covers.',
        'Steam baseboards, bed frames, and carpets with high-temperature steam cleaner.',
        'Engage certified pest exterminator for professional thermal heat treatment or synthetic pyrethroid treatments.',
      ],
      naturalRemedy: 'Food-grade Diatomaceous Earth (DE) dusted along floorboards and bed legs dehydrates bed bug exoskeletons.',
      prevention: 'Inspect hotel mattresses when traveling; keep luggage elevated on racks away from walls.',
      exterminatorCost: '$800 – $2,500 (Requires whole-home heat or chemical treatment)',
      image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'german-cockroach',
      name: 'German Cockroach',
      latin: 'Blattella germanica',
      category: 'Food & Pantry',
      urgency: 'High',
      diy: false,
      signs: [
        'Pepper-like black droppings in cabinets, behind appliances, and around sink pipes',
        'Oily, pungent fecal odor in kitchen drawers',
        'Nocturnal sightings when switching on kitchen lights',
        'Light brown egg capsules (oothecae) containing up to 40 nymphs',
      ],
      treatment: [
        'Apply professional-grade gel baits (Indoxacarb or Fipronil) in dark cracks and crevices.',
        'Use Insect Growth Regulators (IGR) to prevent nymphs from reaching reproductive maturity.',
        'Never use aerosol bug bombs (foggers) as they scatter roaches deeper into wall cavities.',
      ],
      naturalRemedy: 'Mix equal parts boric acid powder and powdered sugar as an ingestible stomach poison placed in bottle caps out of pet reach.',
      prevention: 'Clean all food grease, seal all wall plumbing penetrations with expanding foam, repair leaky pipes.',
      exterminatorCost: '$250 – $600',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'subterranean-termites',
      name: 'Subterranean Termites',
      latin: 'Reticulitermes flavipes',
      category: 'Structural',
      urgency: 'Critical',
      diy: false,
      signs: [
        'Mud shelter tubes traveling up exterior foundation walls',
        'Hollow-sounding or spongy wooden baseboards and joists',
        'Swarmer winged insects emerging in spring, leaving discarded wings on windowsills',
        'Blistered or bubbling paint resembling moisture damage',
      ],
      treatment: [
        'Immediate professional chemical soil barrier trenching (Termidor / Fipronil).',
        'Install subterranean in-ground monitoring bait stations (Sentricon system) around home perimeter.',
        'Repair damaged structural lumber and replace dry-rotted wood.',
      ],
      naturalRemedy: 'Orange oil (D-limonene) and beneficial nematodes for localized outdoor garden wood treatment.',
      prevention: 'Maintain minimum 6-inch clearance between soil and exterior wood siding; ensure downspouts divert water 5ft away.',
      exterminatorCost: '$1,200 – $3,500+ (Includes perimeter trenching & warranties)',
      image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'asian-hornet',
      name: 'Yellow-Legged Asian Hornet',
      latin: 'Vespa velutina',
      category: 'Garden',
      urgency: 'High',
      diy: false,
      signs: [
        'Large dark hornets hovering in front of honey bee hives (hawking behavior)',
        'Melon-shaped spherical paper nests in tall tree canopies or garden sheds',
        'Distinctive yellow-tipped legs and dark velvety thorax',
      ],
      treatment: [
        'Report sighting immediately to local authorities (UK DEFRA / Non-Native Species Secretariat).',
        'Do NOT attempt to knock down or spray nests yourself — Asian hornets launch coordinated mass attacks.',
        'Licensed exterminators destroy nests using telescopic poles and pressurized permethrin powder.',
      ],
      naturalRemedy: 'Selective queen funnel traps in early spring with beer, sugar, and cassis bait.',
      prevention: 'Monitor bee apiaries and garden eaves in April/May during queen nest initiation.',
      exterminatorCost: '$150 – $400 (Often subsidized by agricultural councils)',
      image: 'https://images.unsplash.com/photo-1590424693424-9b555e100f72?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'clothes-moth',
      name: 'Common Clothes Moth',
      latin: 'Tineola bisselliella',
      category: 'Fabric',
      urgency: 'Medium',
      diy: true,
      signs: [
        'Irregular holes eaten in wool, cashmere, silk, and down feather garments',
        'Tiny silken tubes or web casings attached to clothing folds',
        'Small buff-golden moths fluttering in dark closets',
      ],
      treatment: [
        'Dry clean or wash all affected woolens at 60°C (140°F), or freeze in airtight bags at -18°C for 72 hours.',
        'Deeply vacuum closet corners, under baseboards, and carpet edges.',
        'Hang pheromone moth traps to monitor adult male presence.',
      ],
      naturalRemedy: 'Natural cedar wood blocks, dried lavender sachets, and clove essential oil as natural repellents.',
      prevention: 'Store out-of-season woolen garments in vacuum-sealed plastic bags after washing.',
      exterminatorCost: '$150 – $350',
      image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'carpenter-ants',
      name: 'Black Carpenter Ant',
      latin: 'Camponotus pennsylvanicus',
      category: 'Structural',
      urgency: 'High',
      diy: true,
      signs: [
        'Large black ants (12-15mm) foraging indoors',
        'Piles of fine wood shavings (frass) containing insect parts below wall voids',
        'Faint rustling or clicking sound inside wall framing at night',
      ],
      treatment: [
        'Locate and treat the parent nest (often moist rotting wood outside) and indoor satellite nests.',
        'Place slow-acting sweet liquid ant baits (borax or imidacloprid based) along foraging trails.',
        'Dust wall cavities with boric acid or silica aerogel.',
      ],
      naturalRemedy: 'Spray trails with white vinegar and peppermint oil to disrupt pheromone foraging scents.',
      prevention: 'Trim tree branches touching the roof; replace moisture-damaged window sills.',
      exterminatorCost: '$250 – $500',
      image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tiger-mosquito',
      name: 'Asian Tiger Mosquito',
      latin: 'Aedes albopictus',
      category: 'Biting / Parasite',
      urgency: 'Medium',
      diy: true,
      signs: [
        'Aggressive daytime biting in shaded garden areas',
        'Distinctive black body with crisp white silvery dorsal stripes',
        'Larvae wriggling in small stagnant water containers (saucers, bird baths)',
      ],
      treatment: [
        'Empty, scrub, or overturn all standing water vessels weekly (water storage, plant trays, gutters).',
        'Apply BTI (Bacillus thuringiensis israelensis) mosquito dunks to ornamental ponds and rain barrels.',
        'Install fine mesh window and door screens.',
      ],
      naturalRemedy: 'Plant lemon eucalyptus, lemongrass (citronella), and lavender around patio perimeters.',
      prevention: 'Clear roof gutters of leaves and eliminate any stagnant water collection.',
      exterminatorCost: '$120 – $300 (Seasonal barrier fogging)',
      image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const categories = ['All', 'Structural', 'Biting / Parasite', 'Food & Pantry', 'Fabric', 'Garden'];

  const filteredPests = pests.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.signs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-[#f5a623]/40 text-[#f5a623] text-xs font-semibold">
          <Bug className="w-3.5 h-3.5 shrink-0" />
          <span>Infestation Diagnosis & Eradication Guide</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          Pest Control & Infestation Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Identify household infestations, calculate exterminator costs, and choose between DIY natural solutions and professional eradication.
        </p>
      </div>

      {/* Fast Action AI Banner */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2e1a1a] via-[#242448] to-[#1a1a2e] border border-[#8b4513]/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Unsure what's infesting your home?</span>
          </h3>
          <p className="text-xs text-slate-300">
            Take a photo of droppings, wood damage, or live bugs for instant AI diagnosis.
          </p>
        </div>
        <button
          onClick={() => onNavigate('scan')}
          className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 rounded-xl bg-[#e94560] hover:bg-rose-600 text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center"
        >
          Scan Infestation with AI
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pest name, symptoms (e.g. 'mattress spots', 'kitchen')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#161628] border border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f5a623]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#f5a623] text-black shadow-md font-bold'
                  : 'bg-[#1e1e36] text-slate-300 hover:bg-[#282848] border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PEST GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPests.map((pest) => (
          <div
            key={pest.id}
            className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] overflow-hidden flex flex-col justify-between hover:border-slate-500 transition-all shadow-xl group"
          >
            <div>
              {/* Header Image */}
              <div className="relative aspect-[16/10] bg-black overflow-hidden">
                <img
                  src={pest.image}
                  alt={pest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md ${
                      pest.urgency === 'Critical'
                        ? 'bg-rose-600 text-white'
                        : pest.urgency === 'High'
                        ? 'bg-amber-500 text-black'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {pest.urgency} Urgency
                  </span>
                </div>
                <div className="absolute bottom-2 left-3">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-slate-300 font-mono">
                    {pest.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-2.5">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-[#f5a623] transition-colors">
                    {pest.name}
                  </h3>
                  <p className="text-xs italic text-slate-400">{pest.latin}</p>
                </div>

                {/* Quick DIY indicator */}
                <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-[#141424] border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Treatment Scope:</span>
                  <span
                    className={`font-semibold text-xs ${
                      pest.diy ? 'text-[#10b981]' : 'text-[#e94560]'
                    }`}
                  >
                    {pest.diy ? '✓ DIY Treatable' : '⚠️ Pro Needed'}
                  </span>
                </div>

                {/* Key signs */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 block">Common Warning Signs:</span>
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    {pest.signs.slice(0, 2).map((s, idx) => (
                      <li key={idx} className="line-clamp-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shrink-0"></span>
                        <span className="truncate">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Card Footer Button */}
            <div className="p-4 sm:p-5 pt-0">
              <button
                onClick={() => setActiveModalPest(pest)}
                className="w-full min-h-[42px] py-2.5 rounded-xl bg-[#28284c] hover:bg-[#343460] text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>View Full Treatment & Costs</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PEST DETAIL & TREATMENT MODAL */}
      {activeModalPest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1c1c34] border border-slate-700 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                    {activeModalPest.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      activeModalPest.urgency === 'Critical'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-black'
                    }`}
                  >
                    {activeModalPest.urgency}
                  </span>
                </div>
                <p className="text-xs italic text-slate-400">{activeModalPest.latin}</p>
              </div>

              <button
                onClick={() => setActiveModalPest(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white bg-slate-800 flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Estimated Exterminator Cost Block */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#201c10] to-[#1e1e36] border border-amber-500/40 flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-amber-300 font-semibold block">
                  Estimated Professional Exterminator Cost:
                </span>
                <span className="font-display font-black text-base sm:text-lg text-white">
                  {activeModalPest.exterminatorCost}
                </span>
              </div>
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
            </div>

            {/* Infestation Signs */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-xs uppercase text-slate-300 tracking-wider">
                Infestation Indicators:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeModalPest.signs.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Eradication Protocol */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Step-by-Step Eradication Protocol:</span>
              </h4>
              <div className="space-y-2">
                {activeModalPest.treatment.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#141426] border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#242444] text-[#10b981] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Natural & Eco-Friendly Remedies */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-950/30 border border-emerald-900/50 space-y-1.5 text-xs text-emerald-200">
              <span className="font-bold flex items-center gap-1.5 text-[#10b981]">
                <Leaf className="w-4 h-4 shrink-0" />
                <span>Natural & Non-Toxic Solution:</span>
              </span>
              <p className="text-slate-300 leading-relaxed">{activeModalPest.naturalRemedy}</p>
            </div>

            {/* Prevention */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141424] border border-slate-800 space-y-1 text-xs">
              <span className="font-bold text-white block">Long-term Prevention Strategy:</span>
              <p className="text-slate-400 leading-relaxed">{activeModalPest.prevention}</p>
            </div>

            <button
              onClick={() => setActiveModalPest(null)}
              className="w-full min-h-[44px] py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
