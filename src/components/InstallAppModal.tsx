import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, Share, PlusSquare, X } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIos) {
      setDeviceType('ios');
    } else if (isAndroid) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Check if already in standalone / installed mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Listen for PWA prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161628] border border-[#2e2e50] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#202038] text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a1a2e] via-[#2e86ff] to-[#10b981] p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-[#161628] rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-[#10b981]" />
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Install on Your Smartphone
            </h3>
            <p className="text-xs text-slate-400">
              Compatible with iOS, Android &amp; Tablets
            </p>
          </div>
        </div>

        {/* Key Features of App Installation */}
        <div className="p-3.5 rounded-2xl bg-[#1c1c34] border border-[#2a2a48] space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>Instant 1-tap camera access in the field</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>Works offline with cached hazard profiles</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>Full-screen app experience without browser bars</span>
          </div>
        </div>

        {/* Installation Instructions based on Device */}
        {deviceType === 'ios' ? (
          <div className="space-y-3 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              iPhone &amp; iPad (Safari):
            </h4>
            <ol className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white flex inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-blue-400 inline" /> Share</strong> button at the bottom of Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="text-white flex inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Tap <strong className="text-emerald-400">Add</strong> in the top-right corner.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            {deferredPrompt ? (
              <button
                onClick={handleNativeInstall}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#2e86ff] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                <span>Install Application Now</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-[#1c1c34] border border-[#2a2a48] space-y-2.5 text-xs text-slate-200">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Android (Chrome / Samsung Internet):
                </h4>
                <ol className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">1.</span>
                    <span>Tap the <strong>three dots (&vellip;)</strong> menu in your browser.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">2.</span>
                    <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#202038] hover:bg-[#282848] text-slate-300 font-semibold text-xs transition-colors"
        >
          Got it / Close
        </button>
      </div>
    </div>
  );
};
