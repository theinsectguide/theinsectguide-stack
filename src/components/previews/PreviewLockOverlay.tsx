import React from 'react';
import { Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface PreviewLockOverlayProps {
  title?: string;
  description?: string;
  onUnlock: () => void;
  isAuthenticated: boolean;
  blurClassName?: string;
  badgeText?: string;
}

export const PreviewLockOverlay: React.FC<PreviewLockOverlayProps> = ({
  title = 'PRO Feature Locked',
  description = 'Subscribe to unlock complete entomological intelligence, detailed guides, and full access.',
  onUnlock,
  isAuthenticated,
  badgeText = 'Instant Access • Cancel Anytime',
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#141428]/85 via-[#1a1a32]/95 to-[#141428]/95 backdrop-blur-[6px] rounded-2xl sm:rounded-3xl border border-emerald-500/30 text-center shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        <Lock className="w-6 h-6 text-emerald-400" />
      </div>

      <h4 className="font-display font-bold text-base sm:text-lg text-white max-w-md">
        {title}
      </h4>

      <p className="text-xs text-slate-300 max-w-sm mt-1.5 mb-4 leading-relaxed">
        {description}
      </p>

      <button
        onClick={onUnlock}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 active:scale-98 transition-all flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isAuthenticated ? 'Subscribe to unlock' : 'Unlock — $4.99/mo'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 mt-3">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{badgeText}</span>
      </div>
    </div>
  );
};
