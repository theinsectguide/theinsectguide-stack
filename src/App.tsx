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
import { PricingPage } from './pages/PricingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, isPro, isAdmin, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  const checkAccessAndResolveTab = (tab: string): string => {
    let resolvedTab = tab;
    if (resolvedTab === 'weather') resolvedTab = 'alerts';

    // STRICT ADMIN ISOLATION: Admin role must ONLY have access to the admin dashboard & admin login
    if (isAdmin) {
      if (resolvedTab !== 'admin-dashboard' && resolvedTab !== 'admin-login') {
        return 'admin-dashboard';
      }
      return resolvedTab;
    }

    const protectedTabs = ['scan', 'journal', 'pest', 'encyclopedia', 'first-aid', 'alerts'];
    
    if (protectedTabs.includes(resolvedTab)) {
      if (!isAuthenticated) {
        return 'login';
      }
      if (!isPro) {
        return 'pricing';
      }
    }

    if (resolvedTab === 'settings' && !isAuthenticated) {
      return 'login';
    }

    if (resolvedTab === 'admin-dashboard' && !isAdmin) {
      return 'admin-login';
    }

    return resolvedTab;
  };

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
  }, [isAuthenticated, isPro, isAdmin, isLoading]);

  // Route protection watcher
  useEffect(() => {
    if (isLoading) return;
    const resolved = checkAccessAndResolveTab(currentTab);
    if (resolved !== currentTab) {
      setCurrentTab(resolved);
      window.location.hash = resolved;
    }
  }, [currentTab, isAuthenticated, isPro, isAdmin, isLoading]);

  const handleNavigate = (tab: string) => {
    const resolved = checkAccessAndResolveTab(tab);
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
      <Navbar currentTab={currentTab} onSelectTab={handleNavigate} />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentTab === 'scan' && <ScanPage onNavigate={handleNavigate} />}
        {currentTab === 'first-aid' && <FirstAidPage />}
        {currentTab === 'pest' && <PestGuidePage onNavigate={handleNavigate} />}
        {currentTab === 'journal' && <JournalPage onNavigate={handleNavigate} />}
        {currentTab === 'encyclopedia' && <EncyclopediaPage onNavigate={handleNavigate} />}
        {currentTab === 'alerts' && <AlertsPage />}
        {currentTab === 'pricing' && <PricingPage onNavigate={handleNavigate} />}
        {currentTab === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentTab === 'admin-login' && <AdminLoginPage onNavigate={handleNavigate} />}
        {currentTab === 'admin-dashboard' && <AdminDashboardPage onNavigate={handleNavigate} />}
        {currentTab === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
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
