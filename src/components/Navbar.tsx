import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { InstallAppModal } from './InstallAppModal';
import {
  Bug,
  Camera,
  HeartPulse,
  BookOpen,
  BookMarked,
  Shield,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Sparkles,
  Smartphone,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  canGoBack = false,
  onGoBack,
}) => {
  const { isAuthenticated, isPro, isAdmin, logout } = useAuth();
  const { unreadCount } = useAlerts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#161628]/95 backdrop-blur-md border-b border-[#242444] px-3 sm:px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Back Button & Logo/Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Universal Back Button */}
          {canGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#242446]/90 hover:bg-[#2f2f5c] border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 group shrink-0"
              title="Go back to previous page"
              aria-label="Previous page"
            >
              <ArrowLeft className="w-4 h-4 text-[#10b981] group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-display">Back</span>
            </button>
          )}

          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#1a1a2e] via-[#2e86ff] to-[#10b981] p-0.5 shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#0c1022] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src="/favicon.svg" alt="The Insect Guide" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="font-display font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5 truncate">
                The Insect Guide
                {isPro && (
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-black shrink-0">
                    PRO
                  </span>
                )}
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden xs:block truncate">AI ID & Venom Safety</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {!isAdmin && (
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('scan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'scan'
                  ? 'bg-[#242444] text-[#10b981] shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e1e38]'
              }`}
            >
              <Camera className="w-4 h-4 text-[#10b981]" />
              Identify
            </button>

            <button
              onClick={() => handleNav('first-aid')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'first-aid'
                  ? 'bg-[#242444] text-[#e94560] shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e1e38]'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-[#e94560]" />
              First Aid
            </button>

            <button
              onClick={() => handleNav('pest')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'pest'
                  ? 'bg-[#242444] text-[#f5a623] shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e1e38]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#f5a623]" />
              Pest Guide
            </button>

            <button
              onClick={() => handleNav('journal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'journal'
                  ? 'bg-[#242444] text-[#2e86ff] shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e1e38]'
              }`}
            >
              <BookMarked className="w-4 h-4 text-[#2e86ff]" />
              Journal
            </button>

            <button
              onClick={() => handleNav('encyclopedia')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'encyclopedia'
                  ? 'bg-[#242444] text-purple-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e1e38]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              Encyclopedia
            </button>

            <button
              onClick={() => handleNav('alerts')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'alerts'
                  ? 'bg-[#242444] text-amber-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e1e38]'
              }`}
            >
              <Bell className="w-4 h-4" />
              Alerts
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#e94560] animate-pulse"></span>
              )}
            </button>
          </nav>
        )}

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => handleNav('login')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-[#242444] transition-colors min-h-[38px] flex items-center"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('pricing')}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] hover:from-rose-600 hover:to-amber-500 text-white text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Pro</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isAdmin ? (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="px-3 py-1.5 rounded-lg bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-bold hover:bg-purple-800 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-300" />
                  <span>Admin Panel</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNav('settings')}
                  className={`p-2 rounded-lg border transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center ${
                    currentTab === 'settings'
                      ? 'bg-[#242444] border-slate-600 text-white'
                      : 'bg-[#1b1b32] border-[#292949] text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                  title="Account Settings"
                  aria-label="Account Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={logout}
                className="p-2 rounded-lg bg-[#1b1b32] border border-[#292949] text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#1b1b32] border border-[#292949] text-slate-300 hover:text-white min-w-[38px] min-h-[38px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#242444] flex flex-col gap-1 pb-2 animate-in slide-in-from-top duration-150">
          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-slate-800">
              <button
                onClick={() => handleNav('register')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up (Free)
              </button>
              <button
                onClick={() => handleNav('login')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-[#242446] hover:bg-[#2e2e56] border border-slate-700"
              >
                Sign In
              </button>
            </div>
          )}
          {isAdmin ? (
            <>
              <button
                onClick={() => handleNav('admin-dashboard')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-purple-300 bg-purple-950/60 border border-purple-500/40"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard & Metrics
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('scan')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'scan' ? 'bg-[#242444] text-[#10b981]' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <Camera className="w-4 h-4 text-[#10b981]" />
                AI Insect Scanner
              </button>
              <button
                onClick={() => handleNav('first-aid')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'first-aid' ? 'bg-[#242444] text-[#e94560]' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <HeartPulse className="w-4 h-4 text-[#e94560]" />
                First Aid Bite & Sting Triage
              </button>
              <button
                onClick={() => handleNav('pest')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'pest' ? 'bg-[#242444] text-[#f5a623]' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#f5a623]" />
                Pest & Infestation Guide
              </button>
              <button
                onClick={() => handleNav('journal')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'journal' ? 'bg-[#242444] text-[#2e86ff]' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <BookMarked className="w-4 h-4 text-[#2e86ff]" />
                Observation Journal (GPS)
              </button>
              <button
                onClick={() => handleNav('encyclopedia')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'encyclopedia' ? 'bg-[#242444] text-purple-400' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                Insect Encyclopedia
              </button>
              <button
                onClick={() => handleNav('alerts')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'alerts' ? 'bg-[#242444] text-amber-400' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Seasonal & Weather Alerts
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#e94560] text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('pricing')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'pricing' ? 'bg-[#242444] text-amber-300' : 'text-slate-300 hover:bg-[#1e1e38]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Pro Pricing & 48h Guarantee
              </button>
              <button
                onClick={() => {
                  setShowInstallModal(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Install on Smartphone
              </button>
            </>
          )}
        </div>
      )}

      {/* PWA / Smartphone Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </header>
  );
};
