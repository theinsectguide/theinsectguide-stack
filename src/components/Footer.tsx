import React, { useState } from 'react';
import { Bug, ShieldCheck, Mail, AlertTriangle, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const openPolicy = (type: 'privacy' | 'terms' | 'disclaimer') => {
    if (type === 'privacy') {
      setModalContent({
        title: 'Privacy Policy',
        body: 'The Insect Guide respects your data sovereignty. Photos uploaded for AI identification are processed securely via Claude Vision API and never sold. Private GPS coordinates logged in your Observation Journal are strictly restricted to your private authenticated account.',
      });
    } else if (type === 'terms') {
      setModalContent({
        title: 'Terms of Service',
        body: 'Subscriptions are billed in advance on a recurring monthly ($4.99) or annual ($29.99) basis. Cancellations immediately prevent renewal while preserving access until the billing cycle terminates.',
      });
    } else {
      setModalContent({
        title: 'Medical & Educational Disclaimer',
        body: 'FOR EDUCATIONAL PURPOSES ONLY. The Insect Guide uses advanced artificial intelligence to identify insects and estimate safety profiles. AI classification can make errors. This application is NOT a substitute for professional medical care, diagnosis, or treatment. If bitten or stung, or in the event of allergic symptoms (such as throat swelling or shortness of breath), immediately contact local emergency medical services or visit urgent care.',
      });
    }
  };

  return (
    <>
      <footer className="bg-[#121222] border-t border-[#242444] py-8 sm:py-10 px-3 sm:px-4 lg:px-8 mt-12 sm:mt-16 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2e86ff] to-[#10b981] p-0.5 flex items-center justify-center overflow-hidden">
                <img src="/favicon.svg" alt="The Insect Guide" className="w-full h-full object-cover rounded-[6px]" />
              </div>
              <span className="font-display font-bold text-lg text-white">The Insect Guide</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Real-time AI insect identification, bite danger assessments, and pest infestation triage for UK, USA, Canada, Australia, and Europe.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Mail className="w-3.5 h-3.5 text-[#2e86ff]" />
              <a href="mailto:contact@theinsectguide.com" className="hover:text-white transition-colors underline">
                contact@theinsectguide.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate && onNavigate('scan')} className="hover:text-white transition-colors">
                  AI Insect Identification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('first-aid')} className="hover:text-white transition-colors">
                  First Aid Triage Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('pest')} className="hover:text-white transition-colors">
                  Pest & Infestation Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('encyclopedia')} className="hover:text-white transition-colors">
                  Species Encyclopedia
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('pricing')} className="hover:text-white transition-colors">
                  Pro Membership ($4.99/mo)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => openPolicy('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('disclaimer')} className="hover:text-white transition-colors text-amber-400 font-medium">
                  Medical Disclaimer
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Encrypted & Secure Transactions
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-[#1e1e38] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            &copy; {new Date().getFullYear()} <span className="text-slate-300 font-medium">theinsectguide.com</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>UK • US • CA • AU • EU</span>
            <button
              onClick={() => onNavigate && onNavigate('admin-login')}
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Admin Access
            </button>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1e1e36] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white mb-3">{modalContent.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-6">
              {modalContent.body}
            </p>
            <button
              onClick={() => setModalContent(null)}
              className="w-full py-2.5 rounded-xl bg-[#2b2b4d] text-white font-medium text-sm hover:bg-[#383861] transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
};
