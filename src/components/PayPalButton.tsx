import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, Check, AlertCircle, Lock } from 'lucide-react';

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

  useEffect(() => {
    // Fetch live client configuration from backend
    fetch('/api/paypal/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) {
          setClientId(data.clientId);
        }
      })
      .catch((err) => {
        console.warn('Using default PayPal client ID:', err);
      });
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <a
          href="#login"
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span>Sign In to Subscribe ({price})</span>
        </a>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          <span>48-hour money-back guarantee on first payment</span>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/70 border border-[#10b981] text-center animate-in zoom-in-95 duration-200">
        <div className="w-10 h-10 rounded-full bg-[#10b981] text-black flex items-center justify-center mx-auto mb-2 font-bold shadow-md">
          <Check className="w-6 h-6" />
        </div>
        <h4 className="font-display font-bold text-white text-base">Paiement PayPal Confirmé !</h4>
        <p className="text-xs text-emerald-200 mt-1">Votre abonnement Pro est activé avec succès.</p>
      </div>
    );
  }

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
          <span>Vérification et capture sécurisée PayPal en cours...</span>
        </div>
      )}

      {/* Official PayPal SDK Buttons Provider */}
      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: 'USD',
          intent: 'capture',
          components: 'buttons',
        }}
      >
        <div className="min-h-[44px]">
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
                  body: JSON.stringify({ plan }),
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
                    plan,
                  }),
                });

                const captureResult = await res.json();

                // Strict verification: Server MUST return success: true & status: 'COMPLETED'
                if (!res.ok || !captureResult.success || captureResult.status !== 'COMPLETED') {
                  throw new Error(
                    captureResult.error || 'Le paiement n\'a pas pu être validé par PayPal. Accès Pro non accordé.'
                  );
                }

                setCompleted(true);
                await refreshUser();

                setTimeout(() => {
                  if (onSuccess) onSuccess();
                }, 1500);
              } catch (err: any) {
                console.error('[PayPal onApprove Error]', err);
                setErrorMsg(err.message || 'Échec de la validation du paiement PayPal.');
              } finally {
                setLoading(false);
              }
            }}
            onCancel={() => {
              setLoading(false);
              setCancelMsg('Transaction PayPal annulée. Votre compte reste en formule gratuite.');
            }}
            onError={(err) => {
              setLoading(false);
              console.error('[PayPal SDK Error]', err);
              setErrorMsg('Une erreur PayPal est survenue. Veuillez vérifier vos informations ou réessayer.');
            }}
          />
        </div>
      </PayPalScriptProvider>

      {/* Guarantee Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
        <span>Garantie satisfait ou remboursé 48h sur le 1er paiement</span>
      </div>
    </div>
  );
};
