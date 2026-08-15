import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CreditCard, Loader2, Sparkles, Check } from 'lucide-react';

interface PayPalButtonProps {
  plan: 'monthly' | 'annual';
  price: string;
  onSuccess?: () => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ plan, price, onSuccess }) => {
  const { token, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'paypal' | 'card' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleCheckout = async (mode: 'paypal' | 'card') => {
    if (!isAuthenticated) {
      window.location.href = '#login';
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan,
          payment_method: mode,
          subscription_id: `SUB_${mode.toUpperCase()}_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      setCompleted(true);
      await refreshUser();
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/60 border border-[#10b981] text-center animate-in zoom-in-95 duration-200">
        <div className="w-10 h-10 rounded-full bg-[#10b981] text-black flex items-center justify-center mx-auto mb-2 font-bold">
          <Check className="w-6 h-6" />
        </div>
        <h4 className="font-display font-bold text-white text-base">Payment Confirmed!</h4>
        <p className="text-xs text-slate-300 mt-1">Your Pro subscription is now active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-[#e94560] text-xs text-rose-200 text-center">
          {errorMsg}
        </div>
      )}

      {/* PayPal Smart Button: Direct Yellow PayPal */}
      <button
        onClick={() => handleCheckout('paypal')}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-[#ffc439] hover:bg-[#f4b82d] text-[#003087] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#003087]" />
        ) : (
          <>
            <span className="italic font-black text-base text-[#003087]">Pay</span>
            <span className="italic font-black text-base text-[#0079C1]">Pal</span>
            <span className="text-xs text-slate-800 font-semibold ml-1">— Pay {price}</span>
          </>
        )}
      </button>

      {/* Debit or Credit Card Option */}
      {!paymentMode ? (
        <button
          onClick={() => setPaymentMode('card')}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2b2b4d] hover:bg-[#34345c] text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <CreditCard className="w-4 h-4 text-slate-300" />
          Debit or Credit Card
        </button>
      ) : (
        <div className="p-4 rounded-xl bg-[#1e1e36] border border-slate-700 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Card Checkout</span>
            <button
              onClick={() => setPaymentMode(null)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            placeholder="Card Number (4242 •••• •••• ••••)"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full px-3 py-2 bg-[#141424] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2e86ff]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="MM/YY"
              value={cardExp}
              onChange={(e) => setCardExp(e.target.value)}
              className="w-full px-3 py-2 bg-[#141424] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2e86ff]"
            />
            <input
              type="text"
              placeholder="CVC"
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value)}
              className="w-full px-3 py-2 bg-[#141424] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2e86ff]"
            />
          </div>
          <button
            onClick={() => handleCheckout('card')}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#2e86ff] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Complete Payment (${price})`}
          </button>
        </div>
      )}

      {/* Guarantee Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
        <span>48-hour money-back guarantee on first payment</span>
      </div>
    </div>
  );
};
