import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, Lock, LayoutDashboard, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

interface PayPalButtonProps {
  plan: 'monthly' | 'annual';
  price: string;
  onSuccess?: () => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ plan, price, onSuccess }) => {
  const { user, token, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [clientId, setClientId] = useState<string>('AffnRM3aLTLlYUT538UDsDxpM4MqrBrrCt-2Ihl9L4TDKgVLsmiTjE8qdmO-CrHi7HqgS6fOnlQOmmYV');
  const [monthlyPlanId, setMonthlyPlanId] = useState<string>('');

  useEffect(() => {
    // Fetch live client configuration from backend
    fetch('/api/paypal/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) {
          setClientId(data.clientId);
        }
        if (data.monthlyPlanId) {
          setMonthlyPlanId(data.monthlyPlanId);
        }
      })
      .catch((err) => {
        console.warn('Using default PayPal configuration:', err);
      });
  }, []);

  const handleConfirmOk = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <a
          href="#register"
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span>Sign Up to Subscribe ({price})</span>
        </a>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            48h money-back guarantee
          </span>
          <a href="#login" className="text-[#2e86ff] hover:underline font-medium">
            Already have account? Sign In
          </a>
        </div>
      </div>
    );
  }

  const isMonthlyRecurring = plan === 'monthly';

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-[#e94560] text-xs text-rose-200 flex items-start gap-2">
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
          <span>
            {isMonthlyRecurring
              ? 'Activation et vérification sécurisée de l\'abonnement PayPal...'
              : 'Vérification et capture sécurisée en cours...'}
          </span>
        </div>
      )}

      {/* Official PayPal SDK Buttons Provider */}
      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: 'USD',
          vault: isMonthlyRecurring ? true : undefined,
          intent: isMonthlyRecurring ? 'subscription' : 'capture',
          components: 'buttons',
          disableFunding: 'bancontact,sofort,giropay,mybank,eps,ideal,sepa,paylater',
        }}
      >
        <div className="min-h-[44px]">
          {isMonthlyRecurring ? (
            /* MONTHLY RECURRING SUBSCRIPTION BUTTON (v1/billing/subscriptions) */
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'subscribe',
                height: 44,
              }}
              disabled={loading}
              createSubscription={async (data, actions) => {
                setErrorMsg(null);
                setCancelMsg(null);
                setLoading(true);

                try {
                  if (monthlyPlanId) {
                    setLoading(false);
                    return actions.subscription.create({
                      plan_id: monthlyPlanId,
                      custom_id: user?.id,
                      application_context: {
                        brand_name: 'The Insect Guide',
                        shipping_preference: 'NO_SHIPPING',
                        user_action: 'SUBSCRIBE_NOW',
                      },
                    });
                  }

                  // Fallback: server-side subscription creation
                  const res = await fetch('/api/paypal/create-subscription', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ plan: 'monthly' }),
                  });

                  const subData = await res.json();
                  if (!res.ok || !subData.subscriptionID) {
                    throw new Error(subData.error || 'Impossible d\'initialiser l\'abonnement récurrent.');
                  }

                  setLoading(false);
                  return subData.subscriptionID;
                } catch (err: any) {
                  setLoading(false);
                  setErrorMsg(err.message || 'Erreur lors de l\'initialisation de l\'abonnement PayPal.');
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
                      verifyResult.error || 'L\'abonnement récurrent n\'a pas pu être validé. Accès Pro non accordé.'
                    );
                  }

                  await refreshUser();
                  setCompleted(true);
                } catch (err: any) {
                  console.error('[PayPal Subscription onApprove Error]', err);
                  setErrorMsg(err.message || 'Échec de la validation de l\'abonnement.');
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => {
                setLoading(false);
                setCancelMsg('Abonnement annulé. Votre compte reste en formule gratuite.');
              }}
              onError={(err) => {
                setLoading(false);
                console.error('[PayPal Subscription SDK Error]', err);
                setErrorMsg('Une erreur est survenue lors de l\'abonnement. Veuillez réessayer.');
              }}
            />
          ) : (
            /* ANNUAL PASS CAPTURE BUTTON (1-Year Pass $29.99) */
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'pay',
                height: 44,
              }}
              disabled={loading}
              createOrder={async () => {
                setErrorMsg(null);
                setCancelMsg(null);
                setLoading(true);

                try {
                  const res = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ plan: 'annual' }),
                  });

                  const data = await res.json();
                  if (!res.ok || !data.orderID) {
                    throw new Error(data.error || 'Impossible de créer la commande PayPal.');
                  }

                  setLoading(false);
                  return data.orderID;
                } catch (err: any) {
                  setLoading(false);
                  setErrorMsg(err.message || 'Erreur lors de la création de la commande PayPal.');
                  throw err;
                }
              }}
              onApprove={async (data) => {
                setLoading(true);
                setErrorMsg(null);

                try {
                  const res = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      orderID: data.orderID,
                      plan: 'annual',
                    }),
                  });

                  const captureResult = await res.json();

                  if (!res.ok || !captureResult.success || captureResult.status !== 'COMPLETED') {
                    throw new Error(
                      captureResult.error || 'Le paiement n\'a pas pu être validé. Accès Pro non accordé.'
                    );
                  }

                  await refreshUser();
                  setCompleted(true);
                } catch (err: any) {
                  console.error('[PayPal onApprove Error]', err);
                  setErrorMsg(err.message || 'Échec de la validation du paiement.');
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => {
                setLoading(false);
                setCancelMsg('Transaction annulée. Votre compte reste en formule gratuite.');
              }}
              onError={(err) => {
                setLoading(false);
                console.error('[PayPal SDK Error]', err);
                setErrorMsg('Une erreur est survenue lors du paiement. Veuillez vérifier vos informations.');
              }}
            />
          )}
        </div>
      </PayPalScriptProvider>

      {/* Guarantee Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
        <span>Garantie satisfait ou remboursé 48h sur le 1er paiement</span>
      </div>

      {/* Full Modal Confirmation on Payment / Subscription Receipt */}
      {completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-[#16162c] border-2 border-emerald-500/80 shadow-2xl p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {isMonthlyRecurring ? 'Abonnement PayPal Confirmé' : 'Paiement Confirmé'}
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                {isMonthlyRecurring ? 'Abonnement Pro Activé !' : 'Paiement Reçu avec Succès !'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Votre formule{' '}
                <strong className="text-emerald-400 font-bold">
                  {plan === 'annual' ? 'Annuelle ($29.99/an Pass)' : 'Mensuelle ($4.99/mois Récurrent)'}
                </strong>{' '}
                est validée. Votre statut <strong className="text-white">PRO</strong> est immédiatement actif.
              </p>
            </div>

            {/* Feature Perks Summary */}
            <div className="rounded-2xl bg-[#1f1f3a] border border-[#303058] p-3.5 text-left text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Accès illimité à l'identification Claude Vision</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Journal GPS d'observation &amp; Export PDF</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Garantie satisfait ou remboursé 48h active</span>
              </div>
            </div>

            {/* OK Action Button directly to Dashboard */}
            <button
              onClick={handleConfirmOk}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#10b981] hover:brightness-110 text-slate-950 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>OK — Accéder à mon Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
