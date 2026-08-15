import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Loader,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  User,
  Star,
  FileText,
  Zap,
  Navigation,
  ExternalLink
} from "lucide-react";
import { bookingsApi, paymentsApi } from "../../services/api";
import SingleExpertMap from "../../components/Map/SingleExpertMap";
import { calculateDistance, estimateTravelTime, getDirectionsUrl } from "../../utils/geoUtils";
import { useLocation } from "../../context/LocationContext";

const statusConfig = {
  PENDING: { label: "Pending Confirmation", cls: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  pending: { label: "Pending Confirmation", cls: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  CONFIRMED: { label: "Confirmed & Scheduled", cls: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
  confirmed: { label: "Confirmed & Scheduled", cls: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
  IN_PROGRESS: { label: "Technician En Route / Working", cls: "bg-purple-100 text-purple-800 border-purple-200", icon: Loader },
  in_progress: { label: "Technician En Route / Working", cls: "bg-purple-100 text-purple-800 border-purple-200", icon: Loader },
  COMPLETED: { label: "Service Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle },
  completed: { label: "Service Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [updatingCompletion, setUpdatingCompletion] = useState(false);
  const { coordinates: userCoords } = useLocation();

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        const data = await bookingsApi.getById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error("Failed to load booking detail:", err);
        setError("Failed to load booking details. It may not exist or you do not have permission.");
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  async function handlePayNow() {
    try {
      setPaying(true);
      setPayError(null);
      const res = await paymentsApi.initiate(bookingId);
      if (res?.payment_url) {
        if (res.payment_url.startsWith('/')) {
          navigate(res.payment_url);
        } else {
          window.location.href = res.payment_url;
        }
      } else {
        setPayError("Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setPayError(err.message || "Payment initiation failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  async function handleToggleCompletion(e) {
    const isCompleted = e.target.checked;
    try {
      setUpdatingCompletion(true);
      await bookingsApi.customerComplete(bookingId, isCompleted);
      setBooking((prev) => ({
        ...prev,
        customerConfirmedAt: isCompleted ? new Date().toISOString() : null,
      }));
    } catch (err) {
      console.error("Failed to update completion:", err);
      alert("Failed to update job status.");
    } finally {
      setUpdatingCompletion(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading booking & dispatch details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Booking Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Unable to fetch requested booking details."}</p>
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const statusKey = booking.status ? booking.status.toUpperCase() : "PENDING";
  const statusInfo = statusConfig[statusKey] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;
  const provider = booking.provider || {};
  const providerUser = provider.user || {};

  const providerLat = provider.latitude || 27.7172;
  const providerLng = provider.longitude || 85.3240;

  const distance = userCoords
    ? calculateDistance(userCoords.lat, userCoords.lng, providerLat, providerLng)
    : (provider.distance || null);

  const travelTime = estimateTravelTime(distance);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </button>

        {/* Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {booking.serviceName || "Service Booking"}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono font-bold">Booking #{booking.id}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">
              Rs. {Number(booking.quotedPrice || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Live Location & Map Tracker Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-red-600" />
                  Live Expert Proximity & Route
                </h2>
                {distance !== null && (
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                    {distance} km away (~{travelTime})
                  </span>
                )}
              </div>
              <SingleExpertMap
                provider={{
                  ...provider,
                  name: providerUser.name || provider.businessName || 'Your Technician',
                  latitude: providerLat,
                  longitude: providerLng,
                  location: provider.location || 'Kathmandu, Nepal'
                }}
                height="280px"
                showRoute={true}
              />
            </div>

            {/* Appointment Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" /> Appointment Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">Scheduled Date</span>
                    <span className="font-bold text-slate-800">
                      {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">Time Slot</span>
                    <span className="font-bold text-slate-800">{booking.timeSlot || "Flexible"}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">Service Location</span>
                    <span className="font-bold text-slate-800">{booking.address || "Kathmandu Valley"}</span>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                  <span className="text-xs font-bold text-red-800 block mb-1">Customer Instructions</span>
                  <p className="text-xs sm:text-sm text-slate-700 italic">"{booking.notes}"</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Payment & Billing
              </h2>
              <div className="flex items-center justify-between py-2 text-xs sm:text-sm border-b border-slate-100">
                <span className="text-slate-500">Price Type</span>
                <span className="font-semibold text-slate-700 capitalize">{provider.priceType || "Fixed"}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs sm:text-sm border-b border-slate-100">
                <span className="text-slate-500">Quoted Price</span>
                <span className="font-bold text-slate-900">Rs. {Number(booking.quotedPrice || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs sm:text-sm border-b border-slate-100">
                <span className="text-slate-500">Selected Method</span>
                <span className="font-semibold text-slate-700 capitalize">{booking.paymentMethod === 'KHALTI' ? 'Khalti Online Escrow' : (booking.paymentMethod || "Cash on Completion")}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs sm:text-sm border-b border-slate-100">
                <span className="text-slate-500">Payment Status</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  ['RELEASED', 'PAID'].includes(booking.paymentStatus)
                    ? 'bg-emerald-100 text-emerald-800'
                    : booking.paymentStatus === 'ESCROW_HELD'
                    ? 'bg-amber-100 text-amber-800'
                    : booking.paymentStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {['RELEASED', 'PAID'].includes(booking.paymentStatus)
                    ? '✓ Paid & Settled'
                    : booking.paymentStatus === 'ESCROW_HELD'
                    ? '🔒 Held in Khalti Escrow'
                    : booking.paymentStatus === 'PENDING'
                    ? 'Pending Payment'
                    : 'Unpaid'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 text-base font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-red-600">Rs. {Number(booking.quotedPrice || 0).toLocaleString()}</span>
              </div>

              {/* Pay Now button — only when not yet paid */}
              {!['ESCROW_HELD', 'RELEASED', 'PAID'].includes(booking.paymentStatus) && booking.quotedPrice > 0 && (
                <div className="mt-3 space-y-3">
                  {payError && (
                    <p className="text-xs text-red-600 mb-2 text-center font-bold">{payError}</p>
                  )}
                  <button
                    id="pay-now-btn"
                    onClick={handlePayNow}
                    disabled={paying}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30"
                    style={{
                      background: paying
                        ? '#6b7280'
                        : 'linear-gradient(135deg, #5C2D91 0%, #7C3AED 100%)',
                    }}
                  >
                    {paying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirecting to Khalti...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Pay Online via Khalti (सुरक्षित भुक्तानी)
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    100% Buyer Protection · Funds held safely until you confirm service satisfaction
                  </p>
                </div>
              )}

              {/* Release Escrow Button */}
              {booking.paymentStatus === 'ESCROW_HELD' && !booking.customerConfirmedAt && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h3 className="font-bold text-amber-900 text-sm mb-1">Funds in Safe Escrow</h3>
                        <p className="text-xs text-amber-700 mb-4">
                            Your payment is safely held. Please click confirm once your technician finishes the work.
                        </p>
                        <button
                            onClick={async () => {
                                try {
                                    setUpdatingCompletion(true);
                                    await paymentsApi.release(bookingId);
                                    setBooking(prev => ({ 
                                        ...prev, 
                                        paymentStatus: 'RELEASED', 
                                        status: 'COMPLETED', 
                                        customerConfirmedAt: new Date().toISOString() 
                                    }));
                                } catch (err) {
                                    alert(err.message || "Failed to release payment.");
                                } finally {
                                    setUpdatingCompletion(false);
                                }
                            }}
                            disabled={updatingCompletion}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-sm text-white transition-all shadow-md cursor-pointer"
                        >
                            {updatingCompletion ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Confirm Work Done & Release Funds
                        </button>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* Provider Card Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <User className="w-4 h-4 text-red-600" /> Assigned Expert
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={providerUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                  alt={providerUser.name || "Provider"}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-red-100 shadow-sm bg-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{providerUser.name || "Nepali Technician"}</h3>
                  <p className="text-xs font-semibold text-red-600 truncate">{provider.businessName || provider.category || "Home Care Specialist"}</p>
                  {provider.rating && (
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{provider.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {providerUser.phone && (
                  <a
                    href={`tel:${providerUser.phone}`}
                    className="flex items-center gap-2 text-slate-800 hover:text-red-600 font-semibold p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>Call: {providerUser.phone}</span>
                  </a>
                )}
                {providerUser.email && (
                  <div className="flex items-center gap-2 p-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{providerUser.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-emerald-700 font-bold p-2 bg-emerald-50 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Citizenship & Police Verified</span>
                </div>
              </div>

              {provider.id && (
                <Link
                  to={`/providers/${provider.id}`}
                  className="mt-4 w-full block text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  View Full Profile & Reviews
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
