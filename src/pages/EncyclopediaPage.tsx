import React, { useState, useEffect } from 'react';
import { DangerBadge } from '../components/DangerBadge';
import { Species } from '../types';
import {
  BookOpen,
  Search,
  Filter,
  Globe,
  Flame,
  Shield,
  HeartPulse,
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  Loader2,
  Skull,
} from 'lucide-react';

export const EncyclopediaPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [activeSpecies, setActiveSpecies] = useState<Species | null>(null);
  const [showTopTenModal, setShowTopTenModal] = useState<string | null>(null);
  const [topTenList, setTopTenList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/encyclopedia')
      .then((res) => res.json())
      .then((data) => {
        setSpeciesList(data.species || []);
      })
      .catch((err) => console.warn('Encyclopedia fetch warning:', err))
      .finally(() => setLoading(false));
  }, []);

  const openTopTen = async (country: string) => {
    setShowTopTenModal(country);
    try {
      const res = await fetch(`/api/encyclopedia/top-ten?country=${country}`);
      if (res.ok) {
        const data = await res.json();
        setTopTenList(data.topTen || []);
      }
    } catch (err) {
      console.warn('Top 10 fetch error:', err);
    }
  };

  const regions = ['All', 'UK', 'US', 'CA', 'AU', 'EU'];
  const categories = ['All', 'Venomous', 'Dangerous', 'Harmless', 'Pest', 'Protected', 'Useful'];
  const seasons = ['All', 'Spring', 'Summer', 'Autumn', 'Winter'];

  const filteredSpecies = speciesList.filter((s) => {
    const matchesSearch =
      s.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.latin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.habitat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === 'All' || s.regions.includes(selectedRegion as any);

    const matchesCategory =
      selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSeason =
      selectedSeason === 'All' || s.active_seasons.includes(selectedSeason as any);

    return matchesSearch && matchesRegion && matchesCategory && matchesSeason;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Global Species Taxonomy Database</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          Insect & Spider Encyclopedia
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Comprehensive field guide for UK, USA, Canada, Australia, and Europe with scientific hazard profiles.
        </p>
      </div>

      {/* TOP 10 DANGEROUS QUICK SELECTORS */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#28183c] via-[#1c1c38] to-[#121226] border border-purple-900/60 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <Skull className="w-4 h-4 shrink-0" />
            <h3 className="font-display font-bold text-xs sm:text-sm text-white">
              Top 10 Most Dangerous Insects by Country
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:block">Select country ranking:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['UK', 'US', 'CA', 'AU', 'EU'].map((c) => (
            <button
              key={c}
              onClick={() => openTopTen(c)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#28284c] hover:bg-[#343464] text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-purple-900 transition-colors shadow-md active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-[#2e86ff]" />
              <span>Top 10 — {c}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="space-y-3 bg-[#1c1c34] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#2d2d4e]">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search common name, latin classification, habitat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#141424] border border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Geographic Region
            </label>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedRegion === r
                      ? 'bg-[#2e86ff] text-white'
                      : 'bg-[#141424] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#141424] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Active Season
            </label>
            <div className="flex flex-wrap gap-1.5">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedSeason === s
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-[#141424] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SPECIES GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          <p className="text-xs">Loading species database...</p>
        </div>
      ) : filteredSpecies.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] space-y-2">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-display font-bold text-white text-sm sm:text-base">No Matching Species</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search criteria or clearing active filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSpecies.map((sp) => (
            <div
              key={sp.id}
              onClick={() => setActiveSpecies(sp)}
              className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2d2d50] overflow-hidden hover:border-purple-500/80 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  <img
                    src={sp.photo_url}
                    alt={sp.common_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <DangerBadge status={sp.category} dangerLevel={sp.danger_level} size="sm" />
                  </div>
                  <div className="absolute bottom-2 left-2.5 flex gap-1">
                    {sp.regions.map((reg) => (
                      <span
                        key={reg}
                        className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-slate-300"
                      >
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 space-y-2">
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                      {sp.common_name}
                    </h3>
                    <p className="text-xs italic text-slate-400 font-serif">{sp.latin_name}</p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {sp.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Sting: {sp.can_sting ? '⚠️ Yes' : '✓ No'}</span>
                    <span>•</span>
                    <span>Bite: {sp.can_bite ? '⚠️ Yes' : '✓ No'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0">
                <button className="w-full min-h-[40px] py-2.5 rounded-xl bg-[#28284c] hover:bg-[#343460] text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                  <span>View Species Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SPECIES DETAIL MODAL */}
      {activeSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1c1c34] border border-slate-700 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                    {activeSpecies.common_name}
                  </h3>
                  <DangerBadge status={activeSpecies.category} dangerLevel={activeSpecies.danger_level} size="md" />
                </div>
                <p className="text-xs italic text-slate-400 font-serif">{activeSpecies.latin_name}</p>
              </div>
              <button
                onClick={() => setActiveSpecies(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white bg-slate-800 flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Photo */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-video bg-black border border-slate-700">
              <img
                src={activeSpecies.photo_url}
                alt={activeSpecies.common_name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Sting Hazard</span>
                <span className="font-bold text-white">{activeSpecies.can_sting ? '⚠️ Yes' : '✓ None'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Bite Hazard</span>
                <span className="font-bold text-white">{activeSpecies.can_bite ? '⚠️ Yes' : '✓ None'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Child Safety</span>
                <span className="font-bold text-white">{activeSpecies.dangerous_to_children ? '⚠️ High Caution' : '✓ Safe'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Pet Safety</span>
                <span className="font-bold text-white">{activeSpecies.dangerous_to_pets ? '⚠️ Toxic Risk' : '✓ Safe'}</span>
              </div>
            </div>

            {/* Description & Habitat */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Description</h4>
                <p>{activeSpecies.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Habitat & Environment:</span>
                <p className="text-slate-200">{activeSpecies.habitat}</p>
              </div>
            </div>

            {/* First Aid */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-2 text-xs">
              <span className="font-bold text-[#e94560] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                First Aid Guidance:
              </span>
              <p className="text-rose-100">{activeSpecies.first_aid}</p>
              <div className="p-2.5 rounded-lg bg-black/40 border border-rose-900/40 text-[11px] text-rose-200">
                <strong>When to Seek Emergency Care:</strong> {activeSpecies.when_to_call_emergency}
              </div>
            </div>

            {/* Fun Fact */}
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-purple-950/40 border border-purple-900/50 text-xs text-purple-200">
              <strong className="text-purple-300">Entomology Insight: </strong>
              {activeSpecies.fun_fact}
            </div>

            <button
              onClick={() => setActiveSpecies(null)}
              className="w-full min-h-[44px] py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
            >
              Close Specimen Details
            </button>
          </div>
        </div>
      )}

      {/* TOP 10 COUNTRY MODAL */}
      {showTopTenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1c1c34] border border-purple-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-lg sm:text-2xl text-white flex items-center gap-2">
                  <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-[#e94560] shrink-0" />
                  Top 10 Most Dangerous Insects — {showTopTenModal}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Ranked by envenomation severity, hospitalization risk, and invasive threat.
                </p>
              </div>
              <button
                onClick={() => setShowTopTenModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white bg-slate-800 flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {topTenList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141426] border border-slate-800 flex items-start gap-3 hover:border-slate-600 transition-colors"
                >
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-950/80 border border-[#e94560] text-[#e94560] font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                    #{item.rank || idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-bold text-sm sm:text-base text-white truncate">
                        {item.common_name}
                      </h4>
                      <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-400 shrink-0">
                        {item.danger_level}/10
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs italic text-slate-400 font-serif mb-1">{item.latin_name}</p>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">{item.danger_summary || item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTopTenModal(null)}
              className="w-full min-h-[44px] py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
            >
              Close Ranking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
