import React, { useRef } from 'react';
import { ScanResult } from '../types';
import { DangerBadge } from './DangerBadge';
import { X, Download, Share2, Bug, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareCardModalProps {
  scanResult: ScanResult;
  photoUrl: string;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  scanResult,
  photoUrl,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const text = `I just identified a ${scanResult.common_name} (${scanResult.latin_name}) with The Insect Guide! Danger rating: ${scanResult.danger_level}/10.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Specimen: ${scanResult.common_name}`,
          text: text,
          url: window.location.origin,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#1e1e38] border border-slate-700 rounded-3xl max-w-md w-full p-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-slate-200">Share Specimen Card</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card visual to capture/share */}
        <div
          ref={cardRef}
          className="relative bg-gradient-to-b from-[#242448] to-[#161628] rounded-2xl p-4 border border-[#3b3b6b] shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-[#10b981]" />
              <span className="font-display font-extrabold text-xs tracking-wider text-white uppercase">
                The Insect Guide
              </span>
            </div>
            <DangerBadge status={scanResult.status} dangerLevel={scanResult.danger_level} size="sm" />
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-video bg-black/50 mb-3 border border-slate-800">
            <img
              src={photoUrl}
              alt={scanResult.common_name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-2 left-3 right-3">
              <h4 className="font-display font-bold text-lg text-white drop-shadow-md">
                {scanResult.common_name}
              </h4>
              <p className="text-xs italic text-slate-300 -mt-0.5">{scanResult.latin_name}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-black/30 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Sting / Bite Hazard</span>
              <span className="font-semibold text-slate-200">
                {scanResult.can_sting && scanResult.can_bite
                  ? 'Stings & Bites'
                  : scanResult.can_sting
                  ? 'Venomous Stinger'
                  : scanResult.can_bite
                  ? 'Can Bite'
                  : 'Harmless'}
              </span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Active Seasons</span>
              <span className="font-semibold text-slate-200 truncate block">
                {scanResult.active_season || 'Spring / Summer'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 italic mb-2">
            "{scanResult.description}"
          </p>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Verified with AI Vision</span>
            <span>theinsectguide.com</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2e86ff] to-[#10b981] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied Summary!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share Specimen
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-[#2b2b4d] text-slate-300 hover:text-white font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
