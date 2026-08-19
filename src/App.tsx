/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ScanPage } from './pages/ScanPage';
import { FirstAidPage } from './pages/FirstAidPage';
import { PestGuidePage } from './pages/PestGuidePage';
import { JournalPage } from './pages/JournalPage';
import { EncyclopediaPage } from './pages/EncyclopediaPage';
import { AlertsPage } from './pages/AlertsPage';
import { WeatherPage } from './pages/WeatherPage';
import { PricingPage } from './pages/PricingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';

const PRO_PROTECTED_TABS = ['scan', 'journal', 'pest', 'encyclopedia', 'first-aid', 'alerts', 'weather'];

function AppContent() {
  const { user, isAuthenticated, isPro, isAdmin, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  const checkAccessAndResolveTab = (tab: string, userOverride?: any): string => {
    // Sanitize input: strip query parameters or bypass arguments (e.g. "?pro=true", "?bypass=1")
    let cleanTab = (tab || 'landing').split('?')[0].split('&')[0].trim().toLowerCase();

    const effectiveUser = userOverride !== undefined ? userOverride : user;
    const effectiveIsAuth = !!effectiveUser || isAuthenticated || !!localStorage.getItem('insect_guide_token');
    const effectiveIsAdmin = effectiveUser?.role === 'admin' || isAdmin;
    const effectiveIsPro = effectiveUser?.tier === 'pro' || effectiveUser?.role === 'admin' || isPro;

    // Strict Security Guard: Only users with role === 'admin' can access admin-dashboard
    if (cleanTab === 'admin-dashboard' && !effectiveIsAdmin) {
      return 'admin-login';
    }

    // Protected dashboard / settings page requires authentication
    if ((cleanTab === 'settings' || cleanTab === 'dashboard') && !effectiveIsAuth) {
      return 'register';
    }

    // Pro-only tool tabs protection -> redirect unauthenticated visitors to register (Sign Up)
    if (PRO_PROTECTED_TABS.includes(cleanTab)) {
      if (!effectiveIsAuth) {
        return 'register';
      }
      if (!effectiveIsPro) {
        return 'pricing';
      }
    }

    return cleanTab;
  };

  const [historyStack, setHistoryStack] = useState<string[]>([]);

  const handleGoBack = () => {
    if (historyStack.length > 0) {
      const newStack = [...historyStack];
      const prevTab = newStack.pop()!;
      setHistoryStack(newStack);
      const resolved = checkAccessAndResolveTab(prevTab);
      setCurrentTab(resolved);
      window.location.hash = resolved;
    } else if (currentTab !== 'landing') {
      setCurrentTab('landing');
      window.location.hash = 'landing';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Immediate redirect after login/register if user is currently on login or register screen
  useEffect(() => {
    if (user && !isLoading) {
      if (currentTab === 'login' || currentTab === 'register') {
        if (user.role === 'admin') {
          handleNavigate('admin-dashboard');
        } else if (user.tier === 'pro') {
          handleNavigate('scan');
        } else {
          handleNavigate('pricing');
        }
      } else if (currentTab === 'admin-login') {
        if (user.role === 'admin') {
          handleNavigate('admin-dashboard');
        }
      }
    }
  }, [user, isLoading]);

  // Handle URL hash routing or initial state
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      const resolved = checkAccessAndResolveTab(hash);
      setCurrentTab(resolved);
      if (resolved !== hash) {
        window.location.hash = resolved;
      }
    };

    if (!isLoading) {
      handleHash();
    }
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [user, isAuthenticated, isPro, isAdmin, isLoading]);

  // Route protection watcher
  useEffect(() => {
    if (isLoading) return;
    const resolved = checkAccessAndResolveTab(currentTab);
    if (resolved !== currentTab) {
      setCurrentTab(resolved);
      window.location.hash = resolved;
    }
  }, [currentTab, user, isAuthenticated, isPro, isAdmin, isLoading]);

  const handleNavigate = (tab: string, userOverride?: any) => {
    const resolved = checkAccessAndResolveTab(tab, userOverride);
    if (resolved !== currentTab) {
      setHistoryStack((prev) => {
        const last = prev[prev.length - 1];
        if (last === currentTab) return prev;
        return [...prev, currentTab].slice(-15);
      });
    }
    setCurrentTab(resolved);
    window.location.hash = resolved;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Authenticating session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-slate-100 flex flex-col font-sans selection:bg-[#e94560] selection:text-white pb-16 lg:pb-0">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        canGoBack={currentTab !== 'landing'}
        onGoBack={handleGoBack}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentTab === 'scan' && <ScanPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'first-aid' && <FirstAidPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'pest' && <PestGuidePage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'journal' && <JournalPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'encyclopedia' && <EncyclopediaPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'alerts' && <AlertsPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'weather' && <WeatherPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'pricing' && <PricingPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'register' && <RegisterPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'login' && <LoginPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'admin-login' && <AdminLoginPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {currentTab === 'admin-dashboard' && <AdminDashboardPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
        {(currentTab === 'settings' || currentTab === 'dashboard') && <SettingsPage onNavigate={handleNavigate} onGoBack={handleGoBack} />}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar currentTab={currentTab} onSelectTab={handleNavigate} />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  );
}
