import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, Lock, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function KhaltiSandboxPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [fallbackPidx] = useState(() => `khalti_sandbox_${Date.now()}`);
    const pidx = searchParams.get('pidx') || fallbackPidx;
    const purchaseOrderId = searchParams.get('purchase_order_id') || '';
    const amount = Number(searchParams.get('amount') || 0);
    const orderName = searchParams.get('order_name') || 'SewaCenter Booking';

    const [mobile, setMobile] = useState('9800000000');
    const [mpin, setMpin] = useState('1111');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSimulatePayment = (success = true) => {
        if (!purchaseOrderId) {
            setError('Missing purchase order ID');
            return;
        }

        if (success && (!mobile || !mpin)) {
            setError('Please enter your Khalti test credentials');
            return;
        }

        setIsProcessing(true);
        setError('');

        setTimeout(() => {
            if (success) {
                const amountInPaisa = Math.round(amount * 100);
                const txnId = `TXN_KHALTI_${Date.now()}`;
                navigate(`/payment/callback?pidx=${encodeURIComponent(pidx)}&purchase_order_id=${encodeURIComponent(purchaseOrderId)}&status=Completed&amount=${amountInPaisa}&transaction_id=${txnId}`);
            } else {
                setIsProcessing(false);
                setError('Payment failed: Transaction was declined by user / insufficient test balance.');
            }
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-slate-950/5 flex flex-col justify-center items-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
                {/* Header with Khalti purple theme */}
                <div className="bg-gradient-to-br from-[#5C2D91] to-[#7C3AED] p-6 text-white text-center relative">
                    <div className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider text-purple-100 uppercase mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Khalti Sandbox Gateway
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Khalti Digital Wallet</h1>
                    <p className="text-purple-200 text-xs mt-1">Escrow Payment Gateway for Nepal</p>

                    <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15 text-left flex justify-between items-center">
                        <div>
                            <p className="text-[11px] text-purple-200 uppercase font-medium">Order details</p>
                            <p className="text-sm font-semibold text-white truncate max-w-[200px]">{orderName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-purple-200 uppercase font-medium">Total Amount</p>
                            <p className="text-xl font-black text-amber-300">Rs. {amount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Body Form */}
                <div className="p-6 space-y-5">
                    <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-3.5 text-xs text-purple-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold block text-purple-950">Test Sandbox Mode Active</span>
                            <span>Your payment will be securely placed into <strong>Escrow</strong> until the provider finishes the service.</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Khalti Mobile ID
                            </label>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="98XXXXXXXX"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex justify-between">
                                <span>Khalti MPIN</span>
                                <span className="text-[11px] font-normal text-slate-400">Default: 1111</span>
                            </label>
                            <input
                                type="password"
                                maxLength={4}
                                value={mpin}
                                onChange={(e) => setMpin(e.target.value)}
                                placeholder="****"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 font-mono text-center tracking-[0.5em]"
                            />
                        </div>
                    </div>

                    <div className="pt-2 space-y-2.5">
                        <button
                            type="button"
                            id="sandbox-pay-btn"
                            disabled={isProcessing}
                            onClick={() => handleSimulatePayment(true)}
                            className="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 active:scale-[0.99]"
                            style={{ background: 'linear-gradient(135deg, #5C2D91, #7C3AED)' }}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying Escrow Payment...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Pay Rs. {amount.toLocaleString()} with Khalti
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => purchaseOrderId ? navigate(`/bookings/${purchaseOrderId}`) : navigate('/bookings')}
                            className="w-full py-2.5 px-4 rounded-xl text-slate-500 font-medium text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Cancel and Return to SewaCenter
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-3 text-center">
                        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            Protected by SewaCenter Escrow Guarantee
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
