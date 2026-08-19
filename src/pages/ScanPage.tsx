import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DangerBadge } from '../components/DangerBadge';
import { ShareCardModal } from '../components/ShareCardModal';
import { ScanPreview } from '../components/previews/ScanPreview';
import { InstallAppModal } from '../components/InstallAppModal';
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
  Smartphone,
  Video,
  X,
} from 'lucide-react';

interface ScanPageProps {
  onNavigate: (tab: string) => void;
  onGoBack?: () => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ onNavigate, onGoBack }) => {
  const { user, token, isPro, isAuthenticated, refreshUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [journalNotes, setJournalNotes] = useState('');
  const [journalStatus, setJournalStatus] = useState<'found' | 'observed' | 'reported' | 'photographed'>('found');
  const [savingJournal, setSavingJournal] = useState(false);

  // Live Camera / Webcam Viewfinder State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  if (!isPro) {
    return <ScanPreview onNavigate={onNavigate} isAuthenticated={isAuthenticated} />;
  }

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

  // Start Live Webcam / Camera
  const handleStartCamera = async () => {
    setCameraError(null);
    // On mobile devices, standard file capture works directly via native camera
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click();
      return;
    }

    // On desktop or web with getUserMedia support, launch live webcam modal
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setMediaStream(stream);
        setIsLiveCameraOpen(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }, 100);
      } catch (err: any) {
        console.warn('Live webcam unavailable, falling back to file input:', err);
        cameraInputRef.current?.click();
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage(dataUrl);
      setErrorMsg(null);
      setCurrentScan(null);
      setSavedToJournal(false);
      handleCloseCamera();
    }
  };

  const handleCloseCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsLiveCameraOpen(false);
  };

  const handleScanImage = async () => {
    if (!selectedImage) return;

    if (!token) {
      onNavigate('register');
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
          notes: journalNotes || 'Logged from AI scan.',
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
          AI Insect &amp; Spider Identification
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
              Photograph or Upload an Insect
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
                type="button"
                onClick={handleStartCamera}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#2e86ff] text-black font-display font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Take Photo / Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 rounded-xl bg-[#282848] hover:bg-[#34345c] text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Upload from Gallery</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-4">
              💡 Works seamlessly on smartphones (triggers rear camera) &amp; computers (live webcam or file upload).
            </p>
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
                    <span>Identify Specimen &amp; Assess Danger</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Live Camera Viewfinder Modal */}
        {isLiveCameraOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#1c1c34] border border-slate-700 rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Video className="w-4 h-4 text-[#10b981]" />
                  <span>Live Camera Viewfinder</span>
                </div>
                <button
                  onClick={handleCloseCamera}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black border border-slate-700 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl pointer-events-none m-4"></div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="px-8 py-3.5 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-black font-display font-black text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600/50 text-xs sm:text-sm text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Identification Error</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* CLAUDE AI VISION ANALYSIS RESULT */}
      {result && currentScan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Species Profile Card */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-4 sm:p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Top Badge & Action Icons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282848] pb-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DangerBadge status={result.status} dangerLevel={result.danger_level} size="lg" />
                  <span className="px-2.5 py-1 rounded-full bg-[#141424] border border-slate-700 text-[11px] font-mono text-slate-300">
                    Active: {result.active_season || 'All Year'}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white pt-2">
                  {result.common_name}
                </h2>
                <p className="text-sm sm:text-base italic text-slate-400 font-serif">
                  {result.latin_name}
                </p>
              </div>

              {/* Action Buttons: Share Card & First Aid Shortcut */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#282848] hover:bg-[#34345c] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-[#2e86ff]" />
                  <span>Share Card</span>
                </button>

                {result.danger_level >= 5 && (
                  <button
                    onClick={() => onNavigate('first-aid')}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all active:scale-95"
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>First Aid Guide</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Threat Index</span>
                <span className="font-bold text-sm text-white">{result.danger_level} / 10</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Can Bite / Sting?</span>
                <span className={`font-bold text-sm ${result.can_bite || result.can_sting ? 'text-amber-400' : 'text-[#10b981]'}`}>
                  {result.can_bite || result.can_sting ? 'Yes, Sting / Bite Risk' : 'Harmless / No Stinger'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Pet / Child Hazard</span>
                <span className={`font-bold text-sm ${result.dangerous_to_children || result.dangerous_to_pets ? 'text-rose-400' : 'text-[#10b981]'}`}>
                  {result.dangerous_to_children || result.dangerous_to_pets ? 'Caution Advised' : 'Safe for Pets/Kids'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">Status Type</span>
                <span className="font-bold text-sm text-[#2e86ff] uppercase tracking-wider">
                  {result.status}
                </span>
              </div>
            </div>

            {/* Specimen Description */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-xs uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#2e86ff]" />
                <span>Species Description &amp; Behavioral Profile</span>
              </h4>
              <div className="p-4 rounded-xl bg-[#141426] border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.description}
              </div>
            </div>

            {/* First Aid & Emergency Guidance */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-xs uppercase text-white tracking-wider flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#10b981]" />
                <span>Immediate First Aid Response</span>
              </h4>
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs sm:text-sm text-emerald-200 leading-relaxed">
                {result.first_aid}
              </div>
            </div>

            {/* When to Call Emergency */}
            {result.when_to_call_emergency && (
              <div className="space-y-2">
                <h4 className="font-display font-bold text-xs uppercase text-rose-400 tracking-wider flex items-center gap-2">
                  <Skull className="w-4 h-4" />
                  <span>When to Seek Emergency Medical Attention</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200 leading-relaxed">
                  {result.when_to_call_emergency}
                </div>
              </div>
            )}

            {/* Lookalike Confusion Warning */}
            {result.look_alikes && result.look_alikes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-display font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Lookalike Species</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.look_alikes.map((lk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#141424] border border-slate-800 text-slate-300">
                      <span className="font-bold text-white block mb-0.5">{lk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Habitat & Fun Facts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300 block">Typical Habitat:</span>
                <p className="text-slate-400 leading-relaxed">{result.habitat}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#141424] border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300 block">Interesting Fact:</span>
                <p className="text-slate-400 leading-relaxed">{result.interesting_facts}</p>
              </div>
            </div>
          </div>

          {/* SAVE SPECIMEN TO PRIVATE JOURNAL */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#1c1c34] border border-[#2e2e50] p-4 sm:p-6 space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
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

      {/* Smartphone Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
