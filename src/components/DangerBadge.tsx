import React from 'react';
import { ShieldCheck, AlertTriangle, Skull, Bug, ShieldAlert, Sparkles } from 'lucide-react';

interface DangerBadgeProps {
  status: 'safe' | 'dangerous' | 'venomous' | 'pest' | 'protected' | 'useful' | 'uncertain' | string;
  dangerLevel?: number | null; // 0-10 or null/undefined
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DangerBadge: React.FC<DangerBadgeProps> = ({
  status,
  dangerLevel,
  showIcon = true,
  size = 'md',
}) => {
  const normStatus = (status || 'safe').toLowerCase();

  let bgColor = 'bg-emerald-950/80 border-[#10b981]/50 text-[#10b981]';
  let badgeText = 'Safe';
  let Icon = ShieldCheck;

  if (normStatus === 'uncertain' || normStatus === 'unknown') {
    bgColor = 'bg-slate-900/80 border-slate-600/50 text-slate-300';
    badgeText = 'Uncertain';
    Icon = AlertTriangle;
  } else if (normStatus === 'dangerous') {
    bgColor = 'bg-amber-950/80 border-[#f5a623]/50 text-[#f5a623]';
    badgeText = 'Dangerous';
    Icon = AlertTriangle;
  } else if (normStatus === 'venomous') {
    bgColor = 'bg-rose-950/80 border-[#e94560]/60 text-[#e94560]';
    badgeText = 'Venomous';
    Icon = Skull;
  } else if (normStatus === 'pest') {
    bgColor = 'bg-[#3b1d11]/80 border-[#8b4513]/60 text-[#d48b55]';
    badgeText = 'Pest Hazard';
    Icon = Bug;
  } else if (normStatus === 'protected') {
    bgColor = 'bg-blue-950/80 border-[#2e86ff]/50 text-[#2e86ff]';
    badgeText = 'Protected Species';
    Icon = ShieldAlert;
  } else if (normStatus === 'useful') {
    bgColor = 'bg-emerald-950/80 border-[#10b981]/50 text-[#10b981]';
    badgeText = 'Beneficial';
    Icon = Sparkles;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm md:text-base px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-sm font-semibold tracking-wide backdrop-blur-sm ${bgColor} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'} />}
      <span>{badgeText}</span>
      {typeof dangerLevel === 'number' && (
        <span className="ml-1 px-1.5 py-0.2 bg-black/40 rounded-full text-[10px] md:text-xs font-mono font-bold">
          {dangerLevel}/10
        </span>
      )}
    </div>
  );
};
