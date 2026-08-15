import React from 'react';
import { Camera, HeartPulse, Shield, BookMarked, BookOpen } from 'lucide-react';

interface BottomTabBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161628]/95 backdrop-blur-lg border-t border-[#242444] px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
      <button
        onClick={() => onSelectTab('journal')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === 'journal' ? 'text-[#2e86ff]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookMarked className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Journal</span>
      </button>

      <button
        onClick={() => onSelectTab('first-aid')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === 'first-aid' ? 'text-[#e94560]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <HeartPulse className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">First Aid</span>
      </button>

      {/* Main Center Scan Button */}
      <button
        onClick={() => onSelectTab('scan')}
        className="relative -top-4 flex flex-col items-center group"
      >
        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#10b981] via-[#2e86ff] to-[#e94560] p-0.5 shadow-xl group-hover:scale-105 active:scale-95 transition-transform">
          <div className="w-full h-full bg-[#1a1a2e] rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-[#10b981] group-hover:text-white transition-colors" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-white mt-0.5">Scan AI</span>
      </button>

      <button
        onClick={() => onSelectTab('pest')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === 'pest' ? 'text-[#f5a623]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Shield className="w-4.5 h-4.5" />
        <span className="text-[10px] font-medium mt-0.5">Pests</span>
      </button>

      <button
        onClick={() => onSelectTab('encyclopedia')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === 'encyclopedia' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Guide</span>
      </button>
    </div>
  );
};
