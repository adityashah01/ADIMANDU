import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, CheckCircle, XCircle, Loader,
  Phone, Mail, ShieldCheck, User, FileText, ClipboardList, AlertCircle
} from "lucide-react";
import { serviceRequestsApi } from "../../services/api";

const statusConfig = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700", icon: Clock },
  consultation: { label: "Consultation", cls: "bg-amber-100 text-amber-700", icon: Clock },
  inspection_requested: { label: "Inspection Requested", cls: "bg-blue-100 text-blue-700", icon: Clock },
  inspection_scheduled: { label: "Inspection Scheduled", cls: "bg-blue-100 text-blue-700", icon: Calendar },
  inspection_completed: { label: "Inspection Done", cls: "bg-purple-100 text-purple-700", icon: CheckCircle },
  quote_sent: { label: "Quote Received", cls: "bg-indigo-100 text-indigo-700", icon: ClipboardList },
  quote_accepted: { label: "Quote Accepted", cls: "bg-green-100 text-green-700", icon: CheckCircle },
  quote_rejected: { label: "Quote Rejected", cls: "bg-red-100 text-red-700", icon: XCircle },
  in_progress: { label: "In Progress", cls: "bg-purple-100 text-purple-700", icon: Loader },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700", icon: XCircle },
};

export default function ServiceRequestDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await serviceRequestsApi.getById(requestId);
      setRequest(data);
    } catch (err) {
      console.error("Failed to load request detail:", err);
      setError("Failed to load details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) loadRequest();
  }, [requestId]);

  const handleQuoteResponse = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this quote?`)) return;
    setIsSubmitting(true);
    try {
      await serviceRequestsApi.respondToQuote(requestId, action);
      await loadRequest();
    } catch (err) {
      console.error(err);
      alert("Failed to respond to quote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!window.confirm("Confirm that the service is completed and release payment to the provider?")) return;
    setIsSubmitting(true);
    try {
      await serviceRequestsApi.confirmCompletion(requestId);
      await loadRequest();
    } catch (err) {
      console.error(err);
      alert("Failed to confirm completion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Request Not Found</h2>
          <Link to="/customer/bookings" className="text-blue-600 font-medium">Back to Bookings</Link>
        </div>
      </div>
    );
  }

  const statusKey = request.status ? request.status.toLowerCase() : "pending";
  const statusInfo = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const provider = request.provider || {};
  const providerUser = provider.user || {};
  const quote = request.quote;
  const inspection = request.inspection;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{request.serviceName}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" /> {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Request Number: {request.requestNumber}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Final Amount</span>
            <span className="text-2xl font-extrabold text-slate-900">
              Rs. {Number(request.finalAmount || request.inspectionFee || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Request Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Request Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Service Address</span>
                    <span className="font-semibold text-slate-700">{request.address}</span>
                  </div>
                </div>
                {request.description && (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-xs font-semibold text-blue-700 block mb-1">Description / Notes</span>
                    <p className="text-sm text-slate-600 italic">"{request.description}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Details (if any) */}
            {inspection && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" /> Inspection Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Scheduled Date</span>
                    <span className="font-medium text-slate-800">
                      {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Scheduled Time</span>
                    <span className="font-medium text-slate-800">{inspection.scheduledTime || 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Status</span>
                    <span className="font-medium text-slate-800">{inspection.status}</span>
                  </div>
                </div>
                {inspection.diagnosis && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Provider's Diagnosis</span>
                    <p className="text-sm text-slate-700">{inspection.diagnosis}</p>
                  </div>
                )}
              </div>
            )}

            {/* Quote Action Card */}
            {quote && quote.status === 'SENT' && request.status === 'QUOTE_SENT' && (
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-md">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Action Required: Quote Received</h3>
                    <p className="text-sm text-slate-600">Please review the quote details and accept to proceed.</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Labour Cost</span>
                    <span className="font-medium">Rs. {Number(quote.labourCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Parts Cost</span>
                    <span className="font-medium">Rs. {Number(quote.partsCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Inspection/Visit Fee</span>
                    <span className="font-medium">Rs. {Number(quote.inspectionCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-lg text-indigo-700">
                    <span>Total Amount</span>
                    <span>Rs. {Number(quote.totalAmount).toLocaleString()}</span>
                  </div>
                  {quote.description && (
                    <div className="mt-2 text-sm text-slate-600 pt-2 border-t border-slate-200">
                      <strong>Notes:</strong> {quote.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleQuoteResponse('ACCEPT')} disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                    Accept & Pay
                  </button>
                  <button onClick={() => handleQuoteResponse('REJECT')} disabled={isSubmitting} className="flex-1 border border-red-200 text-red-600 bg-red-50 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors">
                    Reject Quote
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Completion */}
            {request.paymentStatus === 'ESCROW_HELD' && !request.customerConfirmedAt && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6 shadow-sm text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-slate-800 mb-2">Service Completed?</h3>
                <p className="text-sm text-slate-600 mb-6">If the provider has completed the job to your satisfaction, please confirm to release their payment.</p>
                <button onClick={handleConfirmCompletion} disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md">
                  Confirm Job Completed
                </button>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Service Provider
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <img src={providerUser.avatarUrl || "https://ui-avatars.com/api/?name=Provider"} alt="Provider" className="w-14 h-14 rounded-full object-cover border-2 border-blue-100" />
                <div>
                  <h3 className="font-bold text-slate-800">{providerUser.name}</h3>
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {providerUser.phone && (
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span>{providerUser.phone}</span></div>
                )}
                {providerUser.email && (
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span>{providerUser.email}</span></div>
                )}
              </div>
              <Link to={`/providers/${provider.id}`} className="mt-5 w-full block text-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors">
                View Profile
              </Link>
            </div>
            
            {/* Payment Summary if Quote Accepted */}
            {quote && quote.status === 'ACCEPTED' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Payment Summary</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Labour</span> <span>Rs. {Number(quote.labourCost).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Parts</span> <span>Rs. {Number(quote.partsCost).toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-800">
                    <span>Total Paid</span> <span className="text-blue-600">Rs. {Number(quote.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${request.paymentStatus === 'RELEASED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    Payment: {request.paymentStatus === 'RELEASED' ? 'Completed' : 'In Escrow'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
