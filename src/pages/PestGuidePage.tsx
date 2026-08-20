import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PestPreview } from '../components/previews/PestPreview';
import { Species } from '../types';
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
  Leaf,
  Layers,
  Utensils,
  Scissors,
  Flame,
  BookOpen,
  ChevronRight,
  Info,
  ExternalLink,
  Skull,
  ShieldCheck,
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
}

// Multilingual and taxonomic synonym dictionary for intelligent cross-lingual search
const SEARCH_SYNONYMS: Record<string, string[]> = {
  syrphe: ['hoverfly', 'syrphidae', 'episyrphus', 'balteatus', 'flower fly', 'marmalade hoverfly'],
  syrphes: ['hoverfly', 'syrphidae', 'episyrphus', 'balteatus', 'flower fly', 'marmalade hoverfly'],
  hoverfly: ['syrphe', 'syrphidae', 'episyrphus', 'balteatus', 'flower fly', 'marmalade hoverfly'],
  hoverflies: ['syrphe', 'syrphidae', 'episyrphus', 'balteatus', 'flower fly', 'marmalade hoverfly'],
  abeille: ['honeybee', 'apis mellifera', 'bee', 'western honeybee'],
  abeilles: ['honeybee', 'apis mellifera', 'bee', 'western honeybee'],
  honeybee: ['abeille', 'apis mellifera', 'western honeybee'],
  frelon: ['hornet', 'vespa crabro', 'vespa velutina', 'european hornet', 'asian hornet'],
  frelons: ['hornet', 'vespa crabro', 'vespa velutina', 'european hornet', 'asian hornet'],
  hornet: ['frelon', 'vespa crabro', 'vespa velutina'],
  coccinelle: ['ladybird', 'ladybug', 'coccinella septempunctata', 'seven-spotted ladybird'],
  coccinelles: ['ladybird', 'ladybug', 'coccinella septempunctata', 'seven-spotted ladybird'],
  ladybird: ['coccinelle', 'ladybug', 'coccinella septempunctata'],
  ladybug: ['coccinelle', 'ladybird', 'coccinella septempunctata'],
  guepe: ['wasp', 'yellowjacket', 'vespula vulgaris', 'polistes dominula', 'paper wasp'],
  guêpe: ['wasp', 'yellowjacket', 'vespula vulgaris', 'polistes dominula', 'paper wasp'],
  guepes: ['wasp', 'yellowjacket', 'vespula vulgaris', 'polistes dominula', 'paper wasp'],
  guêpes: ['wasp', 'yellowjacket', 'vespula vulgaris', 'polistes dominula', 'paper wasp'],
  wasp: ['guepe', 'guêpe', 'yellowjacket', 'vespula', 'polistes'],
  punaise: ['bed bug', 'cimex lectularius', 'punaise de lit'],
  punaises: ['bed bug', 'cimex lectularius', 'punaise de lit'],
  'punaise de lit': ['bed bug', 'cimex lectularius'],
  'punaises de lit': ['bed bug', 'cimex lectularius'],
  'bed bugs': ['punaise de lit', 'cimex lectularius'],
  'bed bug': ['punaise de lit', 'cimex lectularius'],
  cafard: ['cockroach', 'blattella germanica', 'blatte'],
  cafards: ['cockroach', 'blattella germanica', 'blatte'],
  blatte: ['cockroach', 'blattella germanica', 'cafard'],
  blattes: ['cockroach', 'blattella germanica', 'cafard'],
  cockroach: ['cafard', 'blatte', 'blattella germanica'],
  tique: ['tick', 'ixodes', 'ixodes ricinus', 'ixodes scapularis'],
  tiques: ['tick', 'ixodes', 'ixodes ricinus', 'ixodes scapularis'],
  tick: ['tique', 'ixodes ricinus', 'ixodes scapularis'],
  moustique: ['mosquito', 'aedes albopictus', 'tiger mosquito'],
  moustiques: ['mosquito', 'aedes albopictus', 'tiger mosquito'],
  mosquito: ['moustique', 'aedes albopictus'],
  araignee: ['spider', 'latrodectus', 'loxosceles', 'atrax', 'steatoda'],
  araignée: ['spider', 'latrodectus', 'loxosceles', 'atrax', 'steatoda'],
  araignees: ['spider', 'latrodectus', 'loxosceles', 'atrax', 'steatoda'],
  araignées: ['spider', 'latrodectus', 'loxosceles', 'atrax', 'steatoda'],
  spider: ['araignee', 'araignée', 'latrodectus', 'loxosceles', 'atrax', 'steatoda'],
  bourdon: ['bumblebee', 'bombus'],
  bourdons: ['bumblebee', 'bombus'],
  bumblebee: ['bourdon', 'bombus'],
  termite: ['termites', 'reticulitermes'],
  termites: ['termite', 'reticulitermes'],
  mite: ['clothes moth', 'tineola bisselliella'],
  mites: ['clothes moth', 'tineola bisselliella'],
  'clothes moth': ['mite', 'tineola bisselliella'],
  lucane: ['stag beetle', 'lucanus cervus', 'cerf-volant'],
  'cerf-volant': ['stag beetle', 'lucanus cervus'],
  'stag beetle': ['lucane', 'lucanus cervus'],
  taon: ['horsefly', 'tabanus', 'cleg', 'tabanidae'],
  taons: ['horsefly', 'tabanus', 'cleg', 'tabanidae'],
  horsefly: ['taon', 'tabanus', 'cleg', 'tabanidae'],
};

function normalizeText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const PestGuidePage: React.FC<{ onNavigate: (tab: string) => void; onGoBack?: () => void }> = ({ onNavigate, onGoBack }) => {
  const { isPro, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalPest, setActiveModalPest] = useState<PestItem | null>(null);
  const [encyclopediaSpecies, setEncyclopediaSpecies] = useState<Species[]>([]);

  if (!isPro) {
    return <PestPreview onNavigate={onNavigate} isAuthenticated={isAuthenticated} />;
  }

  // Fetch live ENCYCLOPEDIA_SPECIES single source of truth on mount
  useEffect(() => {
    fetch('/api/encyclopedia')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.species)) {
          setEncyclopediaSpecies(data.species);
        }
      })
      .catch((err) => console.warn('PestGuide Encyclopedia fetch warning:', err));
  }, []);

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
    },
    {
      id: 'carpet-beetle',
      name: 'Varied Carpet Beetle',
      latin: 'Anthrenus verbasci',
      category: 'Fabric',
      urgency: 'Medium',
      diy: true,
      signs: [
        'Small fuzzy brown/gold banded larvae on baseboards and under rugs',
        'Damage to wool carpets, animal furs, taxidermy, and museum specimens',
        'Small rounded beetles gathering at sunny windowsills in spring',
      ],
      treatment: [
        'Thorough vacuuming under heavy furniture, heating vents, and closets.',
        'Apply diatomaceous earth or pyrethrin-based spray to perimeter cracks.',
        'Wash or steam affected textile items.',
      ],
      naturalRemedy: 'Frequent steam-cleaning and vinegar wipe-downs in dark storage areas.',
      prevention: 'Clean pet hair accumulations and vacuum dark corners regularly.',
      exterminatorCost: '$150 – $400',
    },
  ];

  const categories = ['All', 'Structural', 'Biting / Parasite', 'Food & Pantry', 'Fabric', 'Garden'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Structural':
        return <Home className="w-5 h-5 text-amber-400" />;
      case 'Biting / Parasite':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Food & Pantry':
        return <Utensils className="w-5 h-5 text-blue-400" />;
      case 'Fabric':
        return <Scissors className="w-5 h-5 text-purple-400" />;
      case 'Garden':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bug className="w-5 h-5 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Structural':
        return 'bg-amber-950/60 border-amber-500/40 text-amber-300';
      case 'Biting / Parasite':
        return 'bg-rose-950/60 border-rose-500/40 text-rose-300';
      case 'Food & Pantry':
        return 'bg-blue-950/60 border-blue-500/40 text-blue-300';
      case 'Fabric':
        return 'bg-purple-950/60 border-purple-500/40 text-purple-300';
      case 'Garden':
        return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  const getSpeciesCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case 'useful':
        return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
      case 'protected':
        return 'bg-blue-950/70 border-blue-500/40 text-blue-300';
      case 'harmless':
        return 'bg-teal-950/70 border-teal-500/40 text-teal-300';
      case 'dangerous':
        return 'bg-rose-950/70 border-rose-500/40 text-rose-300';
      case 'venomous':
        return 'bg-red-950/70 border-red-500/40 text-red-300';
      default:
        return 'bg-purple-950/70 border-purple-500/40 text-purple-300';
    }
  };

  const getNonPestClarification = (sp: Species) => {
    if (sp.category === 'Useful') {
      return 'Beneficial pollinator & biocontrol agent. Harmless to home structures.';
    }
    if (sp.category === 'Protected') {
      return 'Protected wildlife species under conservation directives. Not a household pest.';
    }
    if (sp.category === 'Harmless') {
      return 'Ecological outdoor species. Does not infest or damage indoor properties.';
    }
    if (sp.category === 'Venomous' || sp.category === 'Dangerous') {
      return 'Wild defensive venomous specimen. Outdoor risk, not a structural wood/fabric pest.';
    }
    return 'Not classified as a household pest.';
  };

  const handleOpenEncyclopediaSpecies = (sp: Species) => {
    sessionStorage.setItem('selected_encyclopedia_species_id', sp.id);
    onNavigate('encyclopedia');
  };

  const normQuery = normalizeText(searchQuery);

  // Derive search terms & multilingual synonyms
  const queryTerms = normQuery
    ? Array.from(new Set([normQuery, ...(SEARCH_SYNONYMS[normQuery] || []).map(normalizeText)]))
    : [];

  // Filter Pest items (Priority Pest Guide Source)
  const filteredPests = pests.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    if (!normQuery) return matchesCategory;

    const pestCorpus = normalizeText(
      `${p.name} ${p.latin} ${p.category} ${p.signs.join(' ')} ${p.treatment.join(' ')} ${p.naturalRemedy} ${p.prevention}`
    );

    const matchesSearch =
      queryTerms.some((term) => pestCorpus.includes(term)) ||
      normQuery.split(/\s+/).every((word) => pestCorpus.includes(word));

    return matchesSearch && matchesCategory;
  });

  // Filter Encyclopedia items (Encyclopedia Source)
  const filteredEncyclopedia = encyclopediaSpecies.filter((sp) => {
    if (!normQuery) return false;

    // Rule 6: Avoid redundant duplicates if already displayed in filteredPests
    const alreadyInPests = filteredPests.some((pest) => {
      const pestNormLatin = normalizeText(pest.latin);
      const pestNormName = normalizeText(pest.name);
      const spNormLatin = normalizeText(sp.latin_name);
      const spNormCommon = normalizeText(sp.common_name);
      return (
        spNormLatin.includes(pestNormLatin) ||
        pestNormLatin.includes(spNormLatin) ||
        spNormCommon.includes(pestNormName) ||
        pestNormName.includes(spNormCommon)
      );
    });

    if (alreadyInPests) return false;

    const speciesCorpus = normalizeText(
      `${sp.common_name} ${sp.latin_name} ${sp.category} ${sp.description} ${sp.habitat} ${(sp.look_alikes || []).join(' ')} ${sp.fun_fact || ''}`
    );

    return (
      queryTerms.some((term) => speciesCorpus.includes(term)) ||
      normQuery.split(/\s+/).every((word) => speciesCorpus.includes(word))
    );
  });

  const hasSearchActive = normQuery.length > 0;
  const totalResultsCount = filteredPests.length + filteredEncyclopedia.length;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-[#f5a623]/40 text-[#f5a623] text-xs font-semibold">
          <Bug className="w-3.5 h-3.5 shrink-0" />
          <span>Infestation Diagnosis & Eradication Guide</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          Pest Control &amp; Infestation Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Clinical guide to identify household infestations, warning signs, eradication protocols, and professional exterminator cost estimates.
        </p>
      </div>

      {/* Fast Action AI Banner */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2e1a1a] via-[#242448] to-[#1a1a2e] border border-[#8b4513]/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Unsure what's infesting your property?</span>
          </h3>
          <p className="text-xs text-slate-300">
            Take a photo of droppings, wood damage, or live specimens for instant AI vision classification.
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
            placeholder="Search pest or species (e.g. 'syrphe', 'bed bugs', 'Apis mellifera', 'cockroach')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-[#161628] border border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f5a623]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          )}
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

      {/* NO MATCHES STATE */}
      {hasSearchActive && totalResultsCount === 0 && (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-3">
          <Bug className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-display font-bold text-white text-sm sm:text-base">
            No insect or pest found.
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try another common name or scientific name (e.g. "syrphe", "bed bugs", "Apis mellifera", "frelon", "coccinelle").
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* 1. PEST GUIDE RESULTS SECTION */}
      {filteredPests.length > 0 && (
        <div className="space-y-4">
          {hasSearchActive && (
            <div className="flex items-center justify-between border-b border-[#2e2e50] pb-2">
              <div className="flex items-center gap-2 text-[#f5a623]">
                <Bug className="w-4 h-4" />
                <h2 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
                  Pest Guide Results ({filteredPests.length})
                </h2>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">Household Infestation Profiles</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPests.map((pest) => (
              <div
                key={pest.id}
                className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-4 sm:p-5 flex flex-col justify-between hover:border-slate-500 transition-all shadow-xl group space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Header with Icon, Category & Urgency Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#282848] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#141424] border border-slate-700 flex items-center justify-center shrink-0">
                        {getCategoryIcon(pest.category)}
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${getCategoryBadgeClass(pest.category)}`}>
                          {pest.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                        pest.urgency === 'Critical'
                          ? 'bg-rose-600 text-white'
                          : pest.urgency === 'High'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {pest.urgency} Urgency
                    </span>
                  </div>

                  {/* Names */}
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-[#f5a623] transition-colors">
                      {pest.name}
                    </h3>
                    <p className="text-xs italic text-slate-400 font-serif">{pest.latin}</p>
                  </div>

                  {/* Treatment Scope & Exterminator Cost Badge */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#141424] border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">Treatment:</span>
                      <span className={`font-semibold text-[11px] ${pest.diy ? 'text-[#10b981]' : 'text-[#e94560]'}`}>
                        {pest.diy ? '✓ DIY Treatable' : '⚠️ Pro Required'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#141424] border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">Est. Pro Cost:</span>
                      <span className="font-bold text-[11px] text-amber-300 truncate block">
                        {pest.exterminatorCost.split('(')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Warning Signs Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Key Infestation Signs:</span>
                    </span>
                    <ul className="text-[11px] text-slate-300 space-y-1">
                      {pest.signs.slice(0, 2).map((s, idx) => (
                        <li key={idx} className="line-clamp-1 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shrink-0 mt-1.5"></span>
                          <span className="leading-snug">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setActiveModalPest(pest)}
                  className="w-full min-h-[42px] py-2.5 rounded-xl bg-[#28284c] hover:bg-[#343460] text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>View Full Treatment &amp; Costs</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ENCYCLOPEDIA RESULTS SECTION (DISTINCT, NON-PEST FIELD SPECIMENS) */}
      {hasSearchActive && filteredEncyclopedia.length > 0 && (
        <div className="space-y-4 pt-3">
          <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
            <div className="flex items-center gap-2 text-purple-400">
              <BookOpen className="w-4 h-4" />
              <h2 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-purple-200">
                Encyclopedia Results ({filteredEncyclopedia.length})
              </h2>
            </div>
            <span className="text-[11px] text-purple-300 font-mono">Reference Species Taxonomy (Non-Pest)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEncyclopedia.map((sp) => (
              <div
                key={sp.id}
                className="rounded-2xl sm:rounded-3xl bg-[#1a1a36] border border-purple-900/60 p-4 sm:p-5 flex flex-col justify-between hover:border-purple-500/80 transition-all shadow-xl group space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Header with ENCYCLOPEDIA tag, Category & Threat Index */}
                  <div className="flex items-start justify-between gap-2 border-b border-purple-900/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-purple-950/90 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>ENCYCLOPEDIA</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${getSpeciesCategoryBadge(sp.category)}`}>
                        {sp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121226] border border-slate-700">
                      <span className="text-[10px] text-slate-400">Threat:</span>
                      <span className={`text-[11px] font-extrabold ${sp.danger_level >= 7 ? 'text-rose-400' : sp.danger_level >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {sp.danger_level} / 10
                      </span>
                    </div>
                  </div>

                  {/* Names */}
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                      {sp.common_name}
                    </h3>
                    <p className="text-xs italic text-purple-300/80 font-serif">{sp.latin_name}</p>
                  </div>

                  {/* Non-Pest Clarification Badge */}
                  <div className="p-2.5 rounded-xl bg-[#121226] border border-purple-950 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Not a household pest</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {getNonPestClarification(sp)}
                    </p>
                  </div>

                  {/* Description Excerpt */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Field Notes &amp; Habitat:
                    </span>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {sp.description || sp.habitat}
                    </p>
                  </div>
                </div>

                {/* Action Button to Open in Encyclopedia */}
                <button
                  onClick={() => handleOpenEncyclopediaSpecies(sp)}
                  className="w-full min-h-[42px] py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 hover:text-white border border-purple-800/60 text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>View in Encyclopedia</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PEST DETAIL & TREATMENT MODAL */}
      {activeModalPest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1c1c34] border border-slate-700 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-2 border-b border-[#282848] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#141424] border border-slate-700 flex items-center justify-center shrink-0">
                  {getCategoryIcon(activeModalPest.category)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                      {activeModalPest.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        activeModalPest.urgency === 'Critical'
                          ? 'bg-rose-600 text-white'
                          : activeModalPest.urgency === 'High'
                          ? 'bg-amber-500 text-black'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {activeModalPest.urgency}
                    </span>
                  </div>
                  <p className="text-xs italic text-slate-400 font-serif">{activeModalPest.latin}</p>
                </div>
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
              <h4 className="font-display font-bold text-xs uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Infestation Indicators:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeModalPest.signs.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shrink-0 mt-1.5"></span>
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
                <span>Natural &amp; Non-Toxic Solution:</span>
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
