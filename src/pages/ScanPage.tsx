import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { DangerBadge } from '../components/DangerBadge';
import { ShareCardModal } from '../components/ShareCardModal';
import { ScanResult, Scan } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  AlertTriangle,
  HeartPulse,
  Share2,
  BookmarkPlus,
  CheckCircle2,
  ShieldCheck,
  Info,
  MapPin,
  RefreshCw,
  HelpCircle,
  Skull,
} from 'lucide-react';

interface ScanPageProps {
  onNavigate: (tab: string) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ onNavigate }) => {
  const { user, token, isPro, refreshUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [journalNotes, setJournalNotes] = useState('');
  const [journalStatus, setJournalStatus] = useState<'found' | 'observed' | 'reported' | 'photographed'>('found');
  const [savingJournal, setSavingJournal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
      setCurrentScan(null);
      setSavedToJournal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleScanImage = async () => {
    if (!selectedImage) return;

    if (!token) {
      onNavigate('login');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSavedToJournal(false);

    try {
      // Get GPS location if user permits
      let locData: any = null;
      if (navigator.geolocation) {
        try {
          const pos: any = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
          );
          locData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            country: user?.region || 'UK',
          };
        } catch {
          // GPS optional
        }
      }

      const res = await fetch('/api/scans/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: selectedImage,
          location: locData,
          notes: 'Identified via Mobile AI Vision',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to identify insect.');
      }

      setCurrentScan(data.scan);
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToJournal = async () => {
    if (!currentScan || !token) return;
    setSavingJournal(true);

    try {
      const res = await fetch(`/api/scans/${currentScan._id}/save-to-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: journalStatus,
          notes: journalNotes || 'Logged from mobile camera scan.',
          location: currentScan.location,
        }),
      });

      if (res.ok) {
        setSavedToJournal(true);
      }
    } catch (err) {
      console.error('Failed to save to journal:', err);
    } finally {
      setSavingJournal(false);
    }
  };

  const result: ScanResult | undefined = currentScan?.result;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-6">
      {/* Scanner Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Claude Vision Neural Classifier</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl md:text-4xl text-white">
          AI Insect & Spider Identification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-1">
          Snap or upload a photo to instantly determine species, venom danger, bite hazards, and first aid steps.
        </p>
      </div>

      {/* Capture / Upload Zone */}
      <div className="bg-[#1c1c34] border border-[#2d2d4e] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl space-y-5">
        {!selectedImage ? (
          <div className="border-2 border-dashed border-slate-700 hover:border-[#2e86ff] rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12 text-center transition-all bg-[#141424]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#242448] text-[#10b981] flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white mb-1">
              Photograph an insect
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 sm:mb-6">
              Take a clear, close-up picture of the bug, spider, wasp or caterpillar in good lighting.
            </p>

            {/* Hidden inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#2e86ff] text-black font-display font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Take Photo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 rounded-xl bg-[#282848] hover:bg-[#34345c] text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Upload from Gallery</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-video max-h-96 bg-black border border-slate-700">
              <img
                src={selectedImage}
                alt="Selected specimen"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setCurrentScan(null);
                  setErrorMsg(null);
                }}
                className="absolute top-3 right-3 min-h-[36px] px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur-sm transition-colors"
              >
                Change Photo
              </button>
            </div>

            {/* Scan trigger button */}
            {!currentScan && (
              <button
                onClick={handleScanImage}
                disabled={loading}
                className="w-full min-h-[48px] py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#e94560] via-[#f5a623] to-[#10b981] text-white font-display font-bold text-sm sm:text-base shadow-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing with Claude Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Identify Specimen & Assess Danger</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-950/70 border border-[#e94560] text-xs sm:text-sm text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#e94560] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Identification Notice</p>
              <p className="text-xs text-rose-300 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* IDENTIFICATION SCAN RESULTS CARD */}
      {result && (
        <div className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2d2d4e] p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 animate-in fade-in duration-200">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white">
                  {result.common_name}
                </h2>
                <DangerBadge status={result.status} dangerLevel={result.danger_level} size="md" />
              </div>
              <p className="text-xs sm:text-sm italic text-slate-400 font-serif">{result.latin_name}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-xl bg-[#2b2b4d] hover:bg-[#383864] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#2e86ff]" />
                <span>Share Card</span>
              </button>
            </div>
          </div>

          {/* Danger Meter 0 - 10 */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141424] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-amber-400" />
                Danger & Envenomation Rating
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-400">
                {result.danger_level} / 10
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  result.danger_level >= 8
                    ? 'bg-[#e94560]'
                    : result.danger_level >= 5
                    ? 'bg-[#f5a623]'
                    : result.danger_level >= 2
                    ? 'bg-amber-400'
                    : 'bg-[#10b981]'
                }`}
                style={{ width: `${Math.max(6, result.danger_level * 10)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0: Safe</span>
              <span>5: Moderate Sting</span>
              <span>10: Severe Venom</span>
            </div>
          </div>

          {/* Quick Hazard Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141426] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Can Sting?</span>
              <span
                className={`font-semibold text-xs ${
                  result.can_sting ? 'text-[#e94560]' : 'text-[#10b981]'
                }`}
              >
                {result.can_sting ? '⚠️ Yes (Venom)' : '✓ No Stinger'}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141426] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Can Bite?</span>
              <span
                className={`font-semibold text-xs ${
                  result.can_bite ? 'text-[#f5a623]' : 'text-[#10b981]'
                }`}
              >
                {result.can_bite ? '⚠️ Can Bite' : '✓ No Bite'}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141426] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Children Risk?</span>
              <span
                className={`font-semibold text-xs ${
                  result.dangerous_to_children ? 'text-[#e94560]' : 'text-[#10b981]'
                }`}
              >
                {result.dangerous_to_children ? 'High Caution' : 'Safe for Kids'}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#141426] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Pets Risk?</span>
              <span
                className={`font-semibold text-xs ${
                  result.dangerous_to_pets ? 'text-[#e94560]' : 'text-[#10b981]'
                }`}
              >
                {result.dangerous_to_pets ? 'Toxic to Pets' : 'Safe for Pets'}
              </span>
            </div>
          </div>

          {/* Description & Habitat */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h4 className="font-semibold text-white text-[11px] sm:text-xs uppercase tracking-wider mb-1">
                Overview & Identification Notes
              </h4>
              <p>{result.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Natural Habitat</span>
                <span className="font-medium text-slate-200">{result.habitat}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Active Season</span>
                <span className="font-medium text-slate-200">{result.active_season}</span>
              </div>
            </div>
          </div>

          {/* First Aid & Emergency Protocol */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-3">
            <div className="flex items-center gap-2 text-[#e94560]">
              <HeartPulse className="w-5 h-5 shrink-0" />
              <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                First Aid Protocol if Stung or Bitten
              </h4>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed">{result.first_aid}</p>

            <div className="p-3 rounded-xl bg-black/40 border border-rose-900/50 text-xs">
              <span className="font-bold text-[#e94560] block mb-0.5">When to Seek Medical Care:</span>
              <p className="text-rose-200">{result.when_to_call_emergency}</p>
            </div>
          </div>

          {/* Look-alikes and Fun Facts */}
          {result.look_alikes && result.look_alikes.length > 0 && (
            <div className="p-4 rounded-xl bg-[#141424] border border-slate-800 space-y-1.5 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#2e86ff]" />
                Dangerous Look-Alikes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.look_alikes.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[#242444] text-slate-300 font-mono text-[11px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.interesting_facts && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200 space-y-1">
              <span className="font-bold text-[#10b981] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Entomologist Fun Fact:
              </span>
              <p className="italic text-slate-300">{result.interesting_facts}</p>
            </div>
          )}

          {/* SAVE TO JOURNAL SECTION */}
          <div className="p-5 rounded-2xl bg-[#161628] border border-slate-700 space-y-3">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-[#2e86ff]" />
              Save Observation to Private Journal
            </h4>

            {savedToJournal ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-[#10b981] text-xs text-[#10b981] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully saved to your field journal!
                </span>
                <button
                  onClick={() => onNavigate('journal')}
                  className="font-bold underline text-white hover:text-emerald-300"
                >
                  View in Journal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Observation Status</label>
                    <select
                      value={journalStatus}
                      onChange={(e) => setJournalStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#10101c] border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="found">Found (Direct Sighting)</option>
                      <option value="observed">Observed (Behavior Tracked)</option>
                      <option value="photographed">Photographed Only</option>
                      <option value="reported">Reported Infestation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Field Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Near kitchen sink, high grass on trail..."
                      value={journalNotes}
                      onChange={(e) => setJournalNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10101c] border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveToJournal}
                  disabled={savingJournal}
                  className="w-full py-2.5 rounded-xl bg-[#2e86ff] hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {savingJournal ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                  Save Specimen to Journal (GPS Logged)
                </button>
              </div>
            )}
          </div>

          {/* Systematic Medical Disclaimer */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-amber-400">Disclaimer:</span> For educational purposes only. Always seek immediate professional medical attention if stung or bitten by an unknown insect.
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && result && selectedImage && (
        <ShareCardModal
          scanResult={result}
          photoUrl={selectedImage}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
