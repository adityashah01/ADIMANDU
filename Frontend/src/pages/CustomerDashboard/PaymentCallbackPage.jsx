import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../services/api';
import {
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';

export default function PaymentCallbackPage() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState(
        'Verifying your payment...'
    );

    // Prevent React StrictMode from verifying twice
    const hasVerified = useRef(false);

    useEffect(() => {

        const verify = async () => {

            // ----------------------------------------------------
            // Prevent duplicate verification
            // ----------------------------------------------------

            if (hasVerified.current) {
                return;
            }

            hasVerified.current = true;

            // ----------------------------------------------------
            // Get information from Khalti callback URL
            // ----------------------------------------------------

            const pidx =
                searchParams.get('pidx');

            const khaltiStatus =
                searchParams.get('status');

            const purchaseOrderId =
                searchParams.get('purchase_order_id');

            // ----------------------------------------------------
            // Validate callback
            // ----------------------------------------------------

            if (!pidx) {

                setStatus('error');

                setMessage(
                    'Invalid payment callback. Missing pidx.'
                );

                return;
            }

            if (!purchaseOrderId) {

                setStatus('error');

                setMessage(
                    'Invalid payment callback. Missing booking information.'
                );

                return;
            }

            // ----------------------------------------------------
            // If Khalti explicitly says payment wasn't completed
            // ----------------------------------------------------

            if (
                khaltiStatus &&
                khaltiStatus.toLowerCase() !== 'completed'
            ) {

                setStatus('error');

                setMessage(
                    `Payment was not completed. Status: ${khaltiStatus}`
                );

                return;
            }

            // ----------------------------------------------------
            // Verify with our backend
            // ----------------------------------------------------

            try {

                console.log(
                    "Verifying payment:",
                    {
                        pidx,
                        purchaseOrderId
                    }
                );

                const res =
                    await paymentsApi.verify(
                        pidx,
                        purchaseOrderId
                    );

                // ------------------------------------------------
                // Successful verification
                // ------------------------------------------------

                if (res.success) {

                    setStatus('success');

                    setMessage(
                        'Payment verified successfully! Funds are now securely held in escrow.'
                    );

                    // --------------------------------------------
                    // Redirect to booking
                    // --------------------------------------------

                    setTimeout(() => {

                        navigate(
                            `/bookings/${purchaseOrderId}`
                        );

                    }, 3000);

                } else {

                    setStatus('error');

                    setMessage(
                        res.error ||
                        'Failed to verify payment with our server.'
                    );
                }

            } catch (error) {

                console.error(
                    "Payment verification error:",
                    error
                );

                setStatus('error');

                setMessage(
                    error.message ||
                    'An error occurred while verifying the payment.'
                );
            }
        };

        verify();

    }, [searchParams, navigate]);


    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">

                {/* =================================================
                    LOADING
                ================================================= */}

                {status === 'loading' && (

                    <div className="flex flex-col items-center">

                        <Loader2
                            className="w-16 h-16 text-blue-600 animate-spin mb-4"
                        />

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Processing Payment
                        </h2>

                        <p className="text-slate-500">
                            {message}
                        </p>

                    </div>
                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {status === 'success' && (

                    <div className="flex flex-col items-center">

                        <CheckCircle
                            className="w-16 h-16 text-green-500 mb-4"
                        />

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Payment Successful!
                        </h2>

                        <p className="text-slate-500 mb-6">
                            {message}
                        </p>

                        <p className="text-sm text-slate-400">
                            Redirecting to your booking...
                        </p>

                    </div>
                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {status === 'error' && (

                    <div className="flex flex-col items-center">

                        <XCircle
                            className="w-16 h-16 text-red-500 mb-4"
                        />

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Payment Verification Failed
                        </h2>

                        <p className="text-slate-500 mb-6">
                            {message}
                        </p>

                        <div className="flex gap-3">

                            <button
                                onClick={() => navigate('/bookings')}
                                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Go to Bookings
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}