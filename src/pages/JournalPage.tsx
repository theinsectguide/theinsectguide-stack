import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeafletMap } from '../components/LeafletMap';
import { DangerBadge } from '../components/DangerBadge';
import { JournalPreview } from '../components/previews/JournalPreview';
import { JournalEntry } from '../types';
import {
  BookMarked,
  MapPin,
  Calendar,
  Download,
  Filter,
  Trash2,
  Edit3,
  Award,
  Shield,
  Loader2,
  Camera,
  Search,
} from 'lucide-react';

export const JournalPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token, isPro, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);

  if (!isPro) {
    return <JournalPreview onNavigate={onNavigate} isAuthenticated={isAuthenticated} />;
  }

  const fetchJournal = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/journal', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.warn('Failed to load journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, [token]);

  const handleDeleteEntry = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this observation?')) return;

    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    setExportingPdf(true);
    // Simple printable window approach which converts cleanly to PDF on all browsers
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate your field journal PDF.');
      setExportingPdf(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>The Insect Guide — Field Observation Journal</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #111; }
            h1 { color: #1a1a2e; border-bottom: 2px solid #2e86ff; padding-bottom: 8px; }
            .header-meta { font-size: 12px; color: #666; margin-bottom: 24px; }
            .entry-card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
            .entry-title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
            .entry-latin { font-style: italic; color: #555; font-size: 13px; margin-bottom: 8px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .notes { font-size: 12px; background: #f9f9f9; padding: 8px; border-radius: 4px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>The Insect Guide — Field Observation Journal</h1>
          <div class="header-meta">
            <strong>Entomologist:</strong> ${user?.name || 'Explorer'} | 
            <strong>Region:</strong> ${user?.region || 'Global'} | 
            <strong>Total Observations:</strong> ${entries.length} | 
            <strong>Exported:</strong> ${new Date().toLocaleDateString()}
          </div>
          ${entries
            .map(
              (e) => `
              <div class="entry-card">
                <div class="entry-title">${e.insect_name}</div>
                <div class="entry-latin">${e.latin_name || 'Specimen'}</div>
                <div>
                  <span class="badge" style="background:#eee;">Status: ${e.status.toUpperCase()}</span>
                  <span class="badge" style="background:#ffebee; color:#c62828;">Danger Level: ${e.danger_level ?? 'N/A'}/10</span>
                  <span style="font-size: 11px; color: #777; margin-left: 10px;">Date: ${new Date(e.date).toLocaleDateString()}</span>
                </div>
                ${e.location?.lat ? `<div style="font-size: 11px; color:#555; margin-top:6px;">📍 GPS: ${e.location.lat.toFixed(4)}, ${e.location.lng.toFixed(4)}</div>` : ''}
                ${e.notes ? `<div class="notes"><strong>Field Notes:</strong> ${e.notes}</div>` : ''}
              </div>
            `
            )
            .join('')}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setExportingPdf(false);
  };

  // Stats calculation
  const totalCount = entries.length;
  const dangerousCount = entries.filter(
    (e) => e.status_type === 'venomous' || e.status_type === 'dangerous' || (e.danger_level || 0) >= 5
  ).length;
  const safeCount = totalCount - dangerousCount;

  // Level determination: Beginner (0-10), Amateur (11-50), Expert (51-200), Master (200+)
  let levelTitle = 'Beginner Explorer';
  let nextLevelCount = 10;
  if (totalCount >= 200) {
    levelTitle = 'Master Entomologist';
    nextLevelCount = 500;
  } else if (totalCount >= 51) {
    levelTitle = 'Expert Naturalist';
    nextLevelCount = 200;
  } else if (totalCount >= 11) {
    levelTitle = 'Amateur Field Guide';
    nextLevelCount = 50;
  }

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.insect_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.latin_name && e.latin_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2e86ff]/10 border border-[#2e86ff]/30 text-[#2e86ff] text-xs font-semibold mb-2">
            <BookMarked className="w-3.5 h-3.5" />
            Field Naturalist Journal
          </div>
          <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
            Observation Journal & GPS Maps
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Private log of every insect found, photographed, or reported with exact GPS coordinates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={entries.length === 0}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#242446] hover:bg-[#2e2e58] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-[#2e86ff]" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => onNavigate('scan')}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>New Observation</span>
          </button>
        </div>
      </div>

      {/* STATS & LEVEL SUMMARY CARD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c34] border border-[#2e2e50] space-y-1">
          <span className="text-[10px] sm:text-[11px] text-slate-400 block">Total Specimen Scans</span>
          <span className="text-xl sm:text-2xl font-display font-black text-white">{totalCount}</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c34] border border-[#2e2e50] space-y-1">
          <span className="text-[10px] sm:text-[11px] text-rose-300 block">Venomous / High Danger</span>
          <span className="text-xl sm:text-2xl font-display font-black text-[#e94560]">{dangerousCount}</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c34] border border-[#2e2e50] space-y-1">
          <span className="text-[10px] sm:text-[11px] text-emerald-300 block">Harmless / Beneficial</span>
          <span className="text-xl sm:text-2xl font-display font-black text-[#10b981]">{safeCount}</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c34] border border-[#2e2e50] space-y-1">
          <span className="text-[10px] sm:text-[11px] text-amber-300 block flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Rank Level
          </span>
          <span className="text-xs font-bold text-white truncate block">{levelTitle}</span>
          <span className="text-[10px] text-slate-400 block">
            {totalCount}/{nextLevelCount} to level up
          </span>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search specimen by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[#161628] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2e86ff]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[40px] flex-1 sm:flex-none px-3 py-2 bg-[#161628] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="found">Found Only</option>
            <option value="observed">Observed Only</option>
            <option value="photographed">Photographed</option>
            <option value="reported">Reported</option>
          </select>

          {/* List vs Map Switcher */}
          <div className="p-1 rounded-xl bg-[#141424] border border-slate-800 flex items-center shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-[#2e86ff] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'map' ? 'bg-[#2e86ff] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              GPS Map
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: MAP OR LIST */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#2e86ff]" />
          <p className="text-xs">Loading your field sightings...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-[#1a1a2e] border border-[#2e2e4e] space-y-4">
          <BookMarked className="w-12 h-12 mx-auto text-slate-500" />
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-white">No Observations Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Identify your first insect or spider with the camera to start building your private field database.
            </p>
          </div>
          <button
            onClick={() => onNavigate('scan')}
            className="min-h-[44px] px-6 py-3 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-black font-bold text-xs transition-colors shadow-lg"
          >
            Start First AI Scan
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <LeafletMap entries={filteredEntries} />
          <p className="text-xs text-slate-400 text-center">
            Click on any pin to review specimen classification and field notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry._id}
              className="rounded-xl sm:rounded-2xl bg-[#1c1c34] border border-[#2d2d4e] p-3 sm:p-4 flex gap-3 sm:gap-4 hover:border-slate-500 transition-all shadow-md group"
            >
              {/* Photo Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl bg-black overflow-hidden shrink-0 border border-slate-800">
                <img
                  src={entry.photo_url || 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=300&q=80'}
                  alt={entry.insect_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info Block */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-display font-bold text-sm sm:text-base text-white truncate">
                      {entry.insect_name}
                    </h3>
                    <button
                      onClick={() => handleDeleteEntry(entry._id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 -mr-1 transition-colors touch-manipulation"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] sm:text-xs italic text-slate-400 font-serif truncate">
                    {entry.latin_name || 'Specimen'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <DangerBadge status={entry.status_type || 'safe'} dangerLevel={entry.danger_level} size="sm" />
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px] sm:text-[10px] text-slate-300 uppercase font-mono">
                    {entry.status}
                  </span>
                </div>

                {entry.notes && (
                  <p className="text-[10px] sm:text-[11px] text-slate-300 italic line-clamp-1 bg-[#141424] px-2 py-0.5 sm:py-1 rounded border border-slate-800">
                    "{entry.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  {entry.location?.lat && (
                    <span className="flex items-center gap-1 text-[#2e86ff]">
                      <MapPin className="w-3 h-3" />
                      GPS Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
