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
  Trash2,
  Award,
  Shield,
  Loader2,
  Camera,
  Search,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Skull,
  Sparkles,
  Globe,
  Wrench,
  Flame,
  ShieldAlert,
} from 'lucide-react';

export const JournalPage: React.FC<{ onNavigate: (tab: string) => void; onGoBack?: () => void }> = ({ onNavigate, onGoBack }) => {
  const { user, token, isPro, isAuthenticated, refreshUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);

  // Active Entry for Detail Modal
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Deletion Modal / State
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

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

  const confirmDelete = async () => {
    if (!token || !entryToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/journal/${entryToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== entryToDelete._id));
        if (selectedEntry?._id === entryToDelete._id) {
          setSelectedEntry(null);
        }
        setDeleteSuccessMsg(`"${entryToDelete.insect_name}" removed from journal.`);
        setTimeout(() => setDeleteSuccessMsg(null), 3000);
        refreshUser();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
      setEntryToDelete(null);
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    setExportingPdf(true);
    setPdfMessage(null);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setPdfMessage('Popup was blocked by your browser. Please allow popups to download your field journal PDF.');
      setExportingPdf(false);
      setTimeout(() => setPdfMessage(null), 5000);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>The Insect Guide — Field Observation Journal</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #111; line-height: 1.5; }
            h1 { color: #1a1a2e; border-bottom: 2px solid #2e86ff; padding-bottom: 8px; font-size: 24px; }
            .header-meta { font-size: 12px; color: #666; margin-bottom: 24px; }
            .entry-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
            .entry-title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
            .entry-latin { font-style: italic; color: #555; font-size: 13px; margin-bottom: 8px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 6px; }
            .notes { font-size: 12px; background: #f4f6f8; padding: 10px; border-radius: 6px; margin-top: 10px; border-left: 3px solid #2e86ff; }
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
                <div style="margin-top: 6px;">
                  <span class="badge" style="background:#eee; color:#333;">Status: ${e.status.toUpperCase()}</span>
                  <span class="badge" style="background:#ffebee; color:#c62828;">Danger Level: ${e.danger_level ?? 'N/A'}/10</span>
                  <span style="font-size: 11px; color: #777;">Date: ${new Date(e.date).toLocaleDateString()}</span>
                </div>
                ${e.location?.lat ? `<div style="font-size: 11px; color:#555; margin-top:6px;">📍 GPS: ${e.location.lat.toFixed(5)}, ${e.location.lng.toFixed(5)}</div>` : ''}
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
            Observation Journal &amp; GPS Maps
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Private log of every insect found, photographed, or reported with exact GPS coordinates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={entries.length === 0 || exportingPdf}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#242446] hover:bg-[#2e2e58] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-[#2e86ff]" />
            <span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
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

      {/* Notifications / Toast */}
      {deleteSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {pdfMessage && (
        <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-xs text-amber-300 flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0" />
          <span>{pdfMessage}</span>
        </div>
      )}

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
            Click on any pin or observation to review classification and field notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry._id}
              onClick={() => setSelectedEntry(entry)}
              className="rounded-xl sm:rounded-2xl bg-[#1c1c34] border border-[#2d2d4e] p-3 sm:p-4 flex gap-3 sm:gap-4 hover:border-[#2e86ff] transition-all shadow-md group cursor-pointer"
            >
              {/* Photo Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl bg-black overflow-hidden shrink-0 border border-slate-800 relative">
                <img
                  src={entry.photo_url || 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=300&q=80'}
                  alt={entry.insect_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info Block */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-display font-bold text-sm sm:text-base text-white truncate group-hover:text-[#2e86ff] transition-colors">
                      {entry.insect_name}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening modal
                        setEntryToDelete(entry);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1.5 -mr-1 transition-colors touch-manipulation rounded-lg hover:bg-rose-950/40"
                      title="Delete observation"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  {entry.location?.lat ? (
                    <span className="flex items-center gap-1 text-[#2e86ff]">
                      <MapPin className="w-3 h-3" />
                      GPS Logged
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Click to view file &rarr;</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL SPECIMEN DETAIL MODAL */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1c1c34] border border-slate-700 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#2a2a48] pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                    {selectedEntry.scan_result?.common_name || selectedEntry.insect_name}
                  </h3>
                  <DangerBadge
                    status={selectedEntry.scan_result?.status || selectedEntry.status_type || 'safe'}
                    dangerLevel={selectedEntry.scan_result?.danger_level ?? selectedEntry.danger_level}
                    size="md"
                  />
                </div>
                <p className="text-xs italic text-slate-400 font-serif">
                  {selectedEntry.scan_result?.latin_name || selectedEntry.latin_name || 'Specimen'}
                </p>
              </div>

              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white bg-[#202038] flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Specimen Photograph */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-black border border-slate-800">
              <img
                src={selectedEntry.photo_url || 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=800&q=80'}
                alt={selectedEntry.insect_name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm text-xs text-white font-mono uppercase font-bold border border-slate-700">
                  {selectedEntry.status}
                </span>
              </div>
            </div>

            {/* Specimen Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Date Logged
                </span>
                <span className="font-semibold text-slate-200">
                  {new Date(selectedEntry.date).toLocaleDateString()} {new Date(selectedEntry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Hazard Rating
                </span>
                <span className="font-bold text-white">
                  {(selectedEntry.scan_result?.danger_level ?? selectedEntry.danger_level) ?? 0} / 10 Threat Index
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2e86ff]" />
                  Coordinates
                </span>
                {selectedEntry.location?.lat ? (
                  <a
                    href={`https://www.google.com/maps?q=${selectedEntry.location.lat},${selectedEntry.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#2e86ff] hover:underline flex items-center gap-1"
                  >
                    <span>{selectedEntry.location.lat.toFixed(4)}, {selectedEntry.location.lng.toFixed(4)}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500">Not recorded</span>
                )}
              </div>
            </div>

            {/* Quick Safety Matrix (From Scan Result) */}
            {selectedEntry.scan_result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Sting Hazard</span>
                  <span className={`font-bold ${selectedEntry.scan_result.can_sting === null ? 'text-slate-400' : selectedEntry.scan_result.can_sting ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedEntry.scan_result.can_sting === null ? '❓ Unknown' : selectedEntry.scan_result.can_sting ? '⚠️ Yes (Venomous)' : '✓ None'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Bite Hazard</span>
                  <span className={`font-bold ${selectedEntry.scan_result.can_bite === null ? 'text-slate-400' : selectedEntry.scan_result.can_bite ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedEntry.scan_result.can_bite === null ? '❓ Unknown' : selectedEntry.scan_result.can_bite ? '⚠️ Yes (Can Bite)' : '✓ None'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Child Safety</span>
                  <span className={`font-bold ${selectedEntry.scan_result.dangerous_to_children ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedEntry.scan_result.dangerous_to_children ? '⚠️ High Caution' : '✓ Safe'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Pet Safety</span>
                  <span className={`font-bold ${selectedEntry.scan_result.dangerous_to_pets ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedEntry.scan_result.dangerous_to_pets ? '⚠️ Toxic Risk' : '✓ Safe'}
                  </span>
                </div>
              </div>
            )}

            {/* Geographical & Seasonal presence (From Scan Result) */}
            {selectedEntry.scan_result && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedEntry.scan_result.active_season && (
                  <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      Active Seasons
                    </span>
                    <span className="font-semibold text-slate-200">{selectedEntry.scan_result.active_season}</span>
                  </div>
                )}
                {selectedEntry.scan_result.geographic_regions && selectedEntry.scan_result.geographic_regions.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#2e86ff]" />
                      Geographic Regions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEntry.scan_result.geographic_regions.map((reg) => (
                        <span key={reg} className="px-2 py-0.5 rounded bg-[#28284c] text-purple-200 font-mono text-[10px] font-bold">
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full Species Description (From Scan Result) */}
            {selectedEntry.scan_result?.description && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#2e86ff]" />
                  <span>AI Taxonomic &amp; Behavioral Profile:</span>
                </h4>
                <div className="p-4 rounded-xl bg-[#141426] border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedEntry.scan_result.description}
                </div>
              </div>
            )}

            {/* Habitat (From Scan Result) */}
            {selectedEntry.scan_result?.habitat && (
              <div className="p-3.5 rounded-xl bg-[#141424] border border-slate-800 space-y-1 text-xs">
                <span className="font-semibold text-slate-300 block">Typical Habitat &amp; Environment:</span>
                <p className="text-slate-400 leading-relaxed">{selectedEntry.scan_result.habitat}</p>
              </div>
            )}

            {/* Clinical First Aid & Emergency Guidance (From Scan Result) */}
            {selectedEntry.scan_result?.first_aid && (
              <div className="p-4 rounded-xl sm:rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    Clinical First Aid Protocol:
                  </span>
                  <p className="text-rose-100 leading-relaxed">{selectedEntry.scan_result.first_aid}</p>
                </div>

                {selectedEntry.scan_result.when_to_call_emergency && (
                  <div className="p-3 rounded-lg bg-black/40 border border-rose-900/40 text-[11px] text-rose-200 space-y-1">
                    <strong className="text-rose-300 block flex items-center gap-1">
                      <Skull className="w-3.5 h-3.5 text-rose-400" />
                      When to Seek Emergency Medical Attention:
                    </strong>
                    <p>{selectedEntry.scan_result.when_to_call_emergency}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lookalike Species (From Scan Result) */}
            {selectedEntry.scan_result?.look_alikes && selectedEntry.scan_result.look_alikes.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Lookalike Species:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedEntry.scan_result.look_alikes.map((lookalike, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#141424] border border-slate-800 text-slate-300">
                      <span className="font-bold text-white block">{lookalike}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pest Control & DIY Treatments (From Scan Result) */}
            {selectedEntry.scan_result?.pest_control?.is_pest && (
              <div className="p-4 rounded-xl sm:rounded-2xl bg-amber-950/30 border border-amber-900/50 space-y-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Pest Management &amp; Treatment Protocol:
                </span>
                <p className="text-amber-100">{selectedEntry.scan_result.pest_control.treatment_method}</p>
                {selectedEntry.scan_result.pest_control.natural_solutions && (
                  <p className="text-amber-200/90">
                    <strong>Eco / Natural Solutions:</strong> {selectedEntry.scan_result.pest_control.natural_solutions}
                  </p>
                )}
                {selectedEntry.scan_result.pest_control.prevention && (
                  <p className="text-amber-200/90">
                    <strong>Prevention:</strong> {selectedEntry.scan_result.pest_control.prevention}
                  </p>
                )}
              </div>
            )}

            {/* Interesting Facts (From Scan Result) */}
            {selectedEntry.scan_result?.interesting_facts && (
              <div className="p-3.5 rounded-xl sm:rounded-2xl bg-purple-950/40 border border-purple-900/50 text-xs text-purple-200">
                <strong className="text-purple-300 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Entomology Insight:
                </strong>
                {selectedEntry.scan_result.interesting_facts}
              </div>
            )}

            {/* Field Notes & Observations */}
            <div className="p-4 rounded-2xl bg-[#141426] border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-[#2e86ff]" />
                <span>Field Observations &amp; Custom Notes:</span>
              </h4>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedEntry.notes || 'No custom observation notes added for this specimen.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setEntryToDelete(selectedEntry);
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Delete Specimen</span>
              </button>

              <button
                onClick={() => setSelectedEntry(null)}
                className="min-h-[42px] px-6 py-2 rounded-xl bg-[#282848] hover:bg-[#34345c] text-white font-medium text-xs transition-colors"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG (Custom Modal, Safe for IFrames) */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1c1c34] border border-rose-500/50 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Delete Observation?</h3>
                <p className="text-xs text-slate-400">This action will remove the observation permanently.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#141424] p-3 rounded-xl border border-slate-800">
              Are you sure you want to remove <strong className="text-white">"{entryToDelete.insect_name}"</strong> from your field journal?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                disabled={deleting}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Observation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
