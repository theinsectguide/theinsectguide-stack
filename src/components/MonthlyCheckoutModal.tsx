import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, X, Sparkles, Lock } from 'lucide-react';

interface MonthlyCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate: (tab: string) => void;
}

export const MONTHLY_PLAN_ID_STRICT = 'P-1VK52313VC6878320NKDSNEY';
const PAYPAL_CLIENT_ID = 'AVzCfKJSQG7YWcbPj1D6cajYS4WFNPSpUBsyd33bOJ0MZXUryqo3gR_36mgn-pfgrLAWpbr9lzlRhOCD';

const MONTHLY_SCRIPT_OPTIONS = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'subscription',
  vault: true,
  components: 'buttons',
};

export const MonthlyCheckoutModal: React.FC<MonthlyCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
}) => {
  const { user, token, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleConfirmOk = () => {
    onClose();
    onSuccessNavigate('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#16162c] border border-emerald-500/40 shadow-2xl p-6 sm:p-8 space-y-6 text-left my-8 animate-in zoom-in-95 duration-200">
        {/* If Completed: Render EXCLUSIVELY the pure success screen */}
        {completed ? (
          <div className="py-8 px-4 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-white">Payment successful!</h3>
              <p className="text-sm text-slate-300 font-medium">
                Your Pro account is now active.
              </p>
            </div>
            <button
              onClick={handleConfirmOk}
              className="w-full max-w-xs py-3.5 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-base shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        ) : (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Monthly Pro Subscription</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                Complete your Monthly Plan
              </h2>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-display font-black text-emerald-400">$4.99</span>
                <span className="text-xs text-slate-400 font-medium">USD / month • No commitment</span>
              </div>
            </div>

            {/* Auth Check */}
            {!isAuthenticated ? (
              <div className="space-y-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-700">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Sign in required to link your subscription</span>
                </div>
                <p className="text-xs text-slate-400">
                  Please create an account or sign in before subscribing to the monthly plan.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#register"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-all shadow-md cursor-pointer"
                  >
                    Create an account
                  </a>
                  <a
                    href="#login"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center transition-all cursor-pointer"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            ) : (
              /* Dedicated PayPal Provider with vault=true & intent=subscription */
              <div className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-xs text-rose-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {cancelMsg && (
                  <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-xs text-amber-200 text-center">
                    {cancelMsg}
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating and activating your recurring subscription...</span>
                  </div>
                )}

                <PayPalScriptProvider options={MONTHLY_SCRIPT_OPTIONS}>
                  <div className="min-h-[100px] pt-2">
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'subscribe',
                        height: 46,
                      }}
                      disabled={loading}
                      createSubscription={async (data, actions) => {
                        setErrorMsg(null);
                        setCancelMsg(null);
                        setLoading(true);

                        try {
                          setLoading(false);
                          return actions.subscription.create({
                            plan_id: MONTHLY_PLAN_ID_STRICT,
                            custom_id: user?.id,
                            application_context: {
                              brand_name: 'The Insect Guide',
                              shipping_preference: 'NO_SHIPPING',
                              user_action: 'SUBSCRIBE_NOW',
                            },
                          });
                        } catch (err: any) {
                          setLoading(false);
                          setErrorMsg(err.message || "Error during subscription initialization.");
                          throw err;
                        }
                      }}
                      onApprove={async (data) => {
                        setLoading(true);
                        setErrorMsg(null);

                        try {
                          const res = await fetch('/api/paypal/verify-subscription', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              subscriptionID: data.subscriptionID,
                              orderID: data.orderID,
                              plan: 'monthly',
                            }),
                          });

                          const verifyResult = await res.json();

                          if (!res.ok || !verifyResult.success || verifyResult.status !== 'ACTIVE') {
                            throw new Error(
                              verifyResult.error || "The recurring subscription could not be validated."
                            );
                          }

                          await refreshUser();
                          setCompleted(true);
                        } catch (err: any) {
                          console.error('[Monthly Subscription Approval Error]', err);
                          setErrorMsg(err.message || "Failed to confirm subscription.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      onCancel={() => {
                        setLoading(false);
                        setCancelMsg('Subscription cancelled.');
                      }}
                      onError={(err) => {
                        setLoading(false);
                        console.error('[Monthly Subscription SDK Error]', err);
                        setErrorMsg("An error occurred while connecting to PayPal payment service.");
                      }}
                    />
                  </div>
                </PayPalScriptProvider>
              </div>
            )}

            {/* Perks & Guarantee */}
            <div className="p-3.5 rounded-2xl bg-[#1c1c38] border border-slate-700/60 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Official plan: $4.99 USD / month (cancel anytime)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>48-hour money-back guarantee on the first payment</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
